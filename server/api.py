import math
from multiprocessing.pool import Pool
from queue import Queue
from threading import Thread
from multiprocessing import Manager
from sqlalchemy import and_, or_
from sqlalchemy.orm import joinedload
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
            return draft.to_dict()
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
            return player.to_dict(['core'])
        else:
            players = q.join(PlayerCore).filter(and_(Player.draft_id == int(draft_id),
                                                     PlayerCore.rank != None,
                                                     PlayerCore.target_price != None)).all()
            return {'players': [p.to_dict(['core']) for p in players]}

    def _update(self, args):
        id = args[1]

        player = self.db.query(Player).filter(Player.id == int(id)).first()

        self._update_fields(player, self.request_body_json)

        if 'paid_price' in self.request_body_json:
            player.team.money -= int(self.request_body_json['paid_price'])

        self.db.add(player)
        self.db.commit()

        return player.to_dict(['core'])


class CorePlayersHandler(BaseHandler):
    def _create(self, args):
        player_name = self.request_body_json['name']
        player = self.db.query(PlayerCore).filter(PlayerCore.name == player_name).first()
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


class RostersHandler(BaseHandler):

    def _get(self, args):
        draft_id = args[0]

        owner_team = self.db.query(Team).filter(and_(Team.is_owner == True,
                                                     Team.draft_id == int(draft_id))).first()

        team_id = owner_team.id
        owned_players = self.db.query(Player).join(Player.core).filter(Player.team_id == int(team_id)).order_by(PlayerCore.rank).all()

        starters = [None]*len(constants.required_positions)
        bench = []

        def place_player(player):
            idx = 0
            while idx < len(starters):
                if player.core.position in constants.required_positions[idx]:
                    if starters[idx] is None:
                        starters[idx] = player
                        return True
                    elif starters[idx].core.rank > player.core.rank:
                        other_player = starters[idx]
                        starters[idx] = player
                        place_player(other_player)
                        return True
                idx+=1
            bench.append(player)
            return False

        for player in owned_players:
            place_player(player)

        optimal_roster = optimizer.optimize_roster(self.db, draft_id, starters, owner_team.money - (7 - len(bench)))

        for player in optimal_roster:
            place_player(player)

        bench_fill = self.db.query(Player).join(PlayerCore).filter(and_(Player.draft_id == draft_id,
                                                                        PlayerCore.position.in_(['RB','WR','TE']),
                                                                        PlayerCore.rank != None,
                                                                        PlayerCore.target_price != None,
                                                                        PlayerCore.target_price <= 1,
                                                                        Player.team_id == None)).order_by(PlayerCore.rank).all()

        while len(bench) < 16-len(starters) and len(bench_fill) > 0:
            bench.append(bench_fill.pop(0))

        starters = [p.to_dict(['core']) for p in starters if p is not None]
        bench = [p.to_dict(['core']) for p in bench]

        return {'roster': {'starters': starters, 'bench': bench}}