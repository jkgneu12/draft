from multiprocessing.pool import Pool
from multiprocessing import Manager
import math

from sqlalchemy import and_
import tornado

import constants
from models import Draft, Team, Player, PlayerCore
import optimizer

CORS_REQUEST_HEADERS = 'Access-Control-Request-Headers'
CORS_ALLOW_HEADERS = 'Access-Control-Allow-Headers'
CORS_ALLOW_ORIGIN = 'Access-Control-Allow-Origin'
CORS_ALLOW_CREDENTIALS = 'Access-Control-Allow-Credentials'
CORS_ALLOW_METHODS = 'Access-Control-Allow-Methods'


class BaseHandler(tornado.web.RequestHandler):
    def set_default_headers(self):
        if CORS_REQUEST_HEADERS in self.request.headers:
            self.set_header(CORS_ALLOW_HEADERS, self.request.headers[CORS_REQUEST_HEADERS])
        self.set_header(CORS_ALLOW_ORIGIN, '*')
        self.set_header(CORS_ALLOW_CREDENTIALS, 'true')
        self.set_header(CORS_ALLOW_METHODS, 'POST, PUT, GET, DELETE, OPTIONS')

    def options(self, *args, **kwargs):
        pass

    @property
    def db(self):
        return self.application.db

    @property
    def request_body_json(self):
        return tornado.escape.json_decode(self.request.body)

    def _get(self, args):
        raise Exception("No such method on resource")

    def _update(self, args):
        raise Exception("No such method on resource")

    def _create(self, args):
        raise Exception("No such method on resource")

    def _duplicate(self, args):
        raise Exception("No such method on resource")

    def _delete(self, args):
        raise Exception("No such method on resource")

    def get(self, *args, **kwargs):
        args = self._remove_empty_last_arg(args)
        ret = self._get(args)
        self.set_status(200)
        if ret:
            self.write(ret)
        else:
            self.write({})

    def put(self, *args, **kwargs):
        args = self._remove_empty_last_arg(args)
        ret = self._update(args)
        self.set_status(200)
        if ret:
            self.write(ret)
        else:
            self.write({})

    def post(self, *args, **kwargs):
        args = self._remove_empty_last_arg(args)
        data = self.request_body_json
        ret = self._create(args)
        self.set_status(200)
        if ret:
            self.write(ret)
        else:
            self.write({})

    def delete(self, *args, **kwargs):
        args = self._remove_empty_last_arg(args)
        ret = self._delete(args)
        self.set_status(200)
        if ret:
            self.write(ret)
        else:
            self.write({})

    def _remove_empty_last_arg(self, args):
        if len(args[-1]) == 0:
            return args[:-1]
        return args

    @staticmethod
    def _update_fields(obj, data):
        for prop, value in data.items():
            if hasattr(obj, prop):
                setattr(obj, prop, value)


class DraftsHandler(BaseHandler):
    def _get(self, args):
        id = args[0] if len(args) > 0 else None

        q = self.db.query(Draft)
        if id is not None:
            draft = q.filter(Draft.id == int(id)).first()
            ret = draft.to_dict()
            ret['bench_size'] = constants.BENCH_SIZE
            ret['team_size'] = constants.TEAM_SIZE
            ret['max_budget'] = constants.MAX_BUDGET
            return ret
        else:
            drafts = q.all()
            return {'drafts': [d.to_dict() for d in drafts]}

    def _create(self, args):
        draft = Draft()

        self._update_fields(draft, self.request_body_json)

        self.db.add(draft)

        core_players = self.db.query(PlayerCore).all()
        for core_player in core_players:
            player = Player(core=core_player, draft=draft)
            self.db.add(player)

        self.db.commit()

        return draft.to_dict()

    def _update(self, args):
        id = args[0]

        draft = self.db.query(Draft).filter(Draft.id == int(id)).first()

        self._update_fields(draft, self.request_body_json)

        self.db.add(draft)
        self.db.commit()

        return draft.to_dict()


class TeamsHandler(BaseHandler):
    def _get(self, args):
        draft_id = args[0]
        id = args[1] if len(args) > 1 else None

        q = self.db.query(Team)
        if id is not None:
            team = q.filter(Team.id == int(id)).first()
            return team.to_dict()
        else:
            teams = q.filter(Team.draft_id == int(draft_id)).all()
            return {'teams': [t.to_dict() for t in teams]}

    def _create(self, args):
        draft_id = args[0]

        team = Team(draft_id=draft_id)
        self._update_fields(team, self.request_body_json)
        if team.order == 0:
            team.is_turn = True
        self.db.add(team)
        self.db.commit()

        return team.to_dict()

    def _update(self, args):
        id = args[1]

        team = self.db.query(Team).filter(Team.id == int(id)).first()

        self._update_fields(team, self.request_body_json)

        self.db.add(team)
        self.db.commit()

        return team.to_dict()


class PlayersHandler(BaseHandler):
    def _get(self, args):
        draft_id = args[0]
        id = args[1] if len(args) > 1 else None

        q = self.db.query(Player)
        if id is not None:
            player = q.filter(Player.id == int(id)).first()
            team = self.db.query(Team).filter(and_(Team.is_owner == True,
                                                   Team.draft_id == draft_id)).first()

            available_players = self.db.query(Player).join(Player.core).filter(and_(PlayerCore.rank != None,
                                                                                    PlayerCore.target_price != None,
                                                                                    PlayerCore.points > 0,
                                                                                    Player.draft_id == draft_id,
                                                                                    Player.team_id == None,
                                                                                    Player.id != player.id)).order_by(PlayerCore.rank).all()

            min_price = 1
            max_price = min(player.core.target_price + 21, team.money)
            manager = Manager()
            max_starters_points = manager.dict()
            max_bench_points = manager.dict()
            pool = Pool(processes=8)
            starters, bench = get_starters_and_bench(self.db, team.id)
            max_starters_points[0] = optimizer.optimize_roster(starters, available_players, team.money - (constants.BENCH_SIZE - len(bench)))[1]
            for m in range(min_price, 10):
                pool.apply_async(wrap_optimizer, args=(starters, available_players, team.money - m - (constants.BENCH_SIZE - len(bench)) + 1, max_bench_points, m))
            if len(get_owned_players(self.db, team.id)) < (constants.TEAM_SIZE - constants.BENCH_SIZE):
                starters_clone = list(starters)
                bench_clone = list(bench)
                place_player(player, starters_clone, bench_clone)
                for m in range(min_price, max_price):
                    pool.apply_async(wrap_optimizer, args=(starters_clone, available_players, team.money - m - (constants.BENCH_SIZE - len(bench_clone)), max_starters_points, m))

            pool.close()
            pool.join()

            ret = player.to_dict(['core'])
            ret['max_starters_points'] = dict(max_starters_points)
            ret['max_bench_points'] = dict(max_bench_points)

            return ret
        else:
            players = q.join(PlayerCore).filter(and_(Player.draft_id == int(draft_id),
                                                     PlayerCore.rank != None,
                                                     PlayerCore.target_price != None)).all()
            return {'players': [p.to_dict(['core']) for p in players]}

    def _update(self, args):
        id = args[1]

        player = self.db.query(Player).filter(Player.id == int(id)).first()

        price_paid = int(self.request_body_json['paid_price']) if 'paid_price' in self.request_body_json else 0

        if player.team is not None:
            player.team.money += player.paid_price

        self._update_fields(player, self.request_body_json)

        self.db.add(player)
        self.db.commit()

        player = self.db.query(Player).filter(Player.id == int(id)).first()

        if player.team is not None:
            player.team.money -= price_paid

        self.db.add(player)
        self.db.commit()

        return player.to_dict(['core'])


class CorePlayersHandler(BaseHandler):
    def _create(self, args):
        player_name = self.request_body_json['name']
        position = self.request_body_json['position']
        player = self.db.query(PlayerCore).filter(and_(PlayerCore.name == player_name,
                                                       PlayerCore.position == position)).first()
        if player is None:
            player = PlayerCore()
        self._update_fields(player, self.request_body_json)
        self.db.add(player)
        self.db.commit()

        return player.to_dict()

    def _update(self, args):
        id = args[0]

        player = self.db.query(PlayerCore).filter(PlayerCore.id == int(id)).first()

        self._update_fields(player, self.request_body_json)

        self.db.add(player)
        self.db.commit()

        return player.to_dict()


def wrap_optimizer(starters, available_players, money, max_points, key):
    max_points[key] = optimizer.optimize_roster(starters, available_players, money)[1]

def place_player(player, starters, bench):
    if not player.bench:
        idx = 0
        while idx < len(starters):
            if player.core.position in constants.required_positions[idx]:
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

def get_owned_players(db, team_id):
    return db.query(Player).join(Player.core).filter(Player.team_id == int(team_id)).order_by(PlayerCore.rank).all()

def get_starters_and_bench(db, team_id):
    owned_players = get_owned_players(db, team_id)

    starters = [None]*len(constants.required_positions)
    bench = []

    for player in owned_players:
        place_player(player, starters, bench)

    return starters, bench


class RostersHandler(BaseHandler):

    def _get(self, args):
        draft_id = args[0]

        owner_team = self.db.query(Team).filter(and_(Team.is_owner == True,
                                                     Team.draft_id == int(draft_id))).first()

        team_id = owner_team.id

        starters, bench = get_starters_and_bench(self.db, team_id)

        available_players = self.db.query(Player).join(Player.core).filter(and_(PlayerCore.rank != None,
                                                                                PlayerCore.target_price != None,
                                                                                PlayerCore.points > 0,
                                                                                Player.draft_id == draft_id,
                                                                                Player.team_id == None)).order_by(PlayerCore.rank).all()

        optimal_roster, points = optimizer.optimize_roster(starters, available_players, owner_team.money - (constants.BENCH_SIZE - len(bench)))

        for player in optimal_roster:
            place_player(player, starters, bench)

        money_spent = 0
        available_bench = list(available_players)
        for p in starters:
            if p in available_bench:
                money_spent += max(1, math.floor(p.core.target_price + (p.core.target_price * constants.PRICE_OFFSET)))
                available_bench.remove(p)

        optimal_bench = optimizer.optimize_bench(bench, available_players, owner_team.money - money_spent)[0]
        for player in optimal_bench:
            place_player(player, starters, bench)

        starters = [p.to_dict(['core']) for p in starters if p is not None]
        bench = [p.to_dict(['core']) for p in bench]

        return {'roster': {'starters': starters, 'bench': bench, 'max_points': points}}

