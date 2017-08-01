import tornado
from tornado.gen import coroutine

from app.models import *

import logging
logger = logging.getLogger(__name__)

PRICE_OFFSET = .1
BENCH_SIZE = 7

REQUIRED_POSITIONS = [
    ['QB'],
    ['RB'],
    ['RB'],
    ['WR'],
    ['WR'],
    ['TE'],
    ['RB', 'WR'],
    ['D'],
    ['K']
]

class BaseHandler(tornado.web.RequestHandler):

    def options(self, *args, **kwargs):
        pass

    @property
    def db(self):
        return self.application.db

    @property
    def request_body_json(self):
        return tornado.escape.json_decode(self.request.body)

    @property
    def stats_service(self):
        return self.application.stats_service

    @property
    def optimizer_service(self):
        return self.application.optimizer_service

    @staticmethod
    def _update_fields(obj, data):
        for prop, value in data.items():
            if hasattr(obj, prop):
                setattr(obj, prop, value)

    @coroutine
    def optimize(self, starters, available_players, money, bench=False):
        result = yield self.optimizer_service.get('/optimize', data={
            'starters': starters,
            'available_players': available_players,
            'money': money,
            'bench': bench
        })
        return result.get('roster'), result.get('points')

    @coroutine
    def multi_optimize(self, min_price, max_price, starters, available_players, money, bench=False):
        results = {}
        for m in range(min_price, max_price):
            results[m] = self.optimize(starters, available_players, money)
        yield multi(results)

        return {key: value[1] for key, value in results}

    def place_player(self, player, starters, bench):
        if not player.bench:
            idx = 0
            while idx < len(starters):
                if player.core.position in REQUIRED_POSITIONS[idx]:
                    if starters[idx] is None:
                        starters[idx] = player
                        return True
                    elif starters[idx].core.points < player.core.points:
                        other_player = starters[idx]
                        starters[idx] = player
                        place_player(other_player, starters, bench)
                        return True
                idx+=1
        bench.append(player)
        return False

    @coroutine
    def get_starters_and_bench(self, team_id):
        owned_players = yield self.get_owned_players(team_id)

        starters = [None]*len(REQUIRED_POSITIONS)
        bench = []

        for player in owned_players:
            place_player(player, starters, bench)

        return starters, bench

    @coroutine
    def get_owned_players(self, team_id):
        core_players = yield self.stats_service.get('/players')
        players = self.db.query(Player).filter(Player.team_id == int(team_id)).all()
        players.sort(key=lambda p: core_players[p.id].get('rank'))
        return players

class DraftsHandler(BaseHandler):

    def get(self, *args, **kwargs):
        drafts = self.db.query(Draft).all()
        self.write({'drafts': [d.to_dict() for d in drafts]})

    @coroutine
    def post(self, *args, **kwargs):
        draft = Draft()

        self._update_fields(draft, self.request_body_json)

        self.db.add(draft)

        core_players = yield self.stats_service.get('/players')

        for core_player_id, core_player in core_players.items():
            player = Player(core_id=core_player_id, draft=draft)
            self.db.add(player)

        self.db.commit()

        self.write(draft.to_dict())


class DraftHandler(BaseHandler):

    def get(self, draft_id):
        draft = self.db.query(Draft).filter(Draft.id == int(draft_id)).first()
        self.write(draft.to_dict())

    def put(self, draft_id):
        draft = self.db.query(Draft).filter(Draft.id == int(draft_id)).first()

        self._update_fields(draft, self.request_body_json)

        self.db.add(draft)
        self.db.commit()

        self.write(draft.to_dict())

class DraftTeamsHandler(BaseHandler):

    @coroutine
    def get(self, draft_id):
        teams = self.db.query(Team).filter(Team.draft_id == int(draft_id)).all()
        teams_dict = [t.to_dict() for t in teams]
        for team in teams_dict:
            starters, bench = yield self.get_starters_and_bench(team['id'])
            team['starters'] = [player.to_dict(['core']) if player is not None else None for player in starters]
            team['bench'] = [player.to_dict(['core']) if player is not None else None for player in bench]
            team['points'] = 0
            for player in starters:
                team['points'] += player.core.points if player is not None else 0
        self.write({'teams': teams_dict})

    def post(self, draft_id):
        team = Team(draft_id=draft_id)
        self._update_fields(team, self.request_body_json)
        if team.order == 0:
            team.is_turn = True
        self.db.add(team)
        self.db.commit()

        self.write(team.to_dict())


class DraftTeamHandler(BaseHandler):

    @coroutine
    def get(self, draft_id, team_id):
        team = self.db.query(Team).filter(Team.id == int(team_id)).first().to_dict()
        starters, bench = yield self.get_starters_and_bench(team['id'])
        team['starters'] = [player.to_dict(['core']) if player is not None else None for player in starters]
        team['bench'] = [player.to_dict(['core']) for player in bench]
        team['points'] = 0
        for player in starters:
            team['points'] += player.core.points if player is not None else 0
        self.write(team)

    def put(self, draft_id, team_id):
        team = self.db.query(Team).filter(Team.id == int(team_id)).first()

        self._update_fields(team, self.request_body_json)

        self.db.add(team)
        self.db.commit()

        self.write(team.to_dict())


class DraftPlayersHandler(BaseHandler):

    @coroutine
    def get(self, draft_id):
        core_players = yield self.stats_service.get('/players?target_price=true')

        players = self.db.query(Player).filter(Player.draft_id == int(draft_id)).all()

        self.write({'players': [p.to_dict(['core']) for p in players if p.core_id in core_players]})


class DraftPlayerHandler(BaseHandler):

    @coroutine
    def get(self, draft_id, player_id):
        core_players = yield self.stats_service.get('/players?target_price=true&points=true')

        player = self.db.query(Player).filter(Player.id == int(player_id)).first()
        team = self.db.query(Team).filter(and_(Team.is_owner == True,
                                               Team.draft_id == draft_id)).first()

        available_players = self.db.query(Player).filter(and_(Player.draft_id == draft_id,
                                                              Player.team_id == None,
                                                              Player.id != player.id)).all()

        available_players = [p for p in available_players if p.core_id in core_players]
        available_players.sort(key=lambda p: core_players[p.id].get('rank'))

        min_price = 1
        max_price = min(player.core.target_price + 21, team.money)
        max_starters_points = {}
        starters, bench = get_starters_and_bench(team.id)
        max_starters_points[0] = yield self.optimize(starters, available_players, team.money - (BENCH_SIZE - len(bench)))[1]
        max_bench_points = yield self.multi_optimize(min_price, 10, starters, available_players, team.money - m - (BENCH_SIZE - len(bench)) + 1)

        full_starters = True
        for s in starters:
            if s is None:
                full_starters = False
        if not full_starters:
            starters_clone = list(starters)
            bench_clone = list(bench)
            place_player(player, starters_clone, bench_clone)
            max_starters_points.update((yield self.multi_optimize(min_price, max_price, starters_clone, available_players, team.money - m - (BENCH_SIZE - len(bench_clone)))))

        ret = player.to_dict(['core'])
        ret['max_starters_points'] = dict(max_starters_points)
        ret['max_bench_points'] = dict(max_bench_points)

        self.write(ret)

    def put(self, draft_id, player_id):
        player = self.db.query(Player).filter(Player.id == int(player_id)).first()

        price_paid = int(self.request_body_json['paid_price']) if 'paid_price' in self.request_body_json else 0

        if player.team is not None:
            player.team.money += player.paid_price

        self._update_fields(player, self.request_body_json)

        self.db.add(player)
        self.db.commit()

        player = self.db.query(Player).filter(Player.id == int(player_id)).first()

        if player.team is not None:
            player.team.money -= price_paid

        self.db.add(player)
        self.db.commit()

        self.write(player.to_dict(['core']))


class DraftRostersHandler(BaseHandler):

    @coroutine
    def get(self, draft_id):
        core_players = yield self.stats_service.get('/players?target_price=true&points=true')

        owner_team = self.db.query(Team).filter(and_(Team.is_owner == True,
                                                     Team.draft_id == int(draft_id))).first()

        team_id = owner_team.id

        starters, bench = yield self.get_starters_and_bench(team_id)

        available_players = self.db.query(Player).join(Player.core).filter(and_(Player.draft_id == draft_id,
                                                                                Player.team_id == None)).all()

        available_players = [p for p in available_players if p.core_id in core_players]
        available_players.sort(key=lambda p: core_players[p.id].get('rank'))

        optimal_roster, points = yield self.optimize(starters, available_players, owner_team.money - (BENCH_SIZE - len(bench)))

        for player in optimal_roster:
            print(player.core.name)
            place_player(player, starters, bench)

        money_spent = 0
        available_bench = list(available_players)
        for p in starters:
            if p in available_bench:
                money_spent += max(1, math.floor(p.core.target_price + (p.core.target_price * PRICE_OFFSET)))
                available_bench.remove(p)

        optimal_bench = yield self.optimize(bench, available_players, owner_team.money - money_spent, bench=True)[0]
        for player in optimal_bench:
            place_player(player, starters, bench)

        starters = [p.to_dict(['core']) for p in starters if p is not None]
        bench = [p.to_dict(['core']) for p in bench]

        self.write({'roster': {'starters': starters, 'bench': bench, 'max_points': points}})

