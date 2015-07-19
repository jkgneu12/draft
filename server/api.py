import math
from sqlalchemy import and_
from sqlalchemy.orm import joinedload
import tornado
from models import Draft, Team, Player, PlayerCore

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
            players = q.options(joinedload('core')).filter(Player.draft_id == int(draft_id)).all()
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
        player = PlayerCore()
        self._update_fields(player, self.request_body_json)
        self.db.add(player)
        self.db.commit()

        return player.to_dict(['players'])

    def _delete(self, args):
        self.db.query(PlayerCore).delete()
        self.db.commit()


class RosteredPlayersHandler(BaseHandler):

    position_importance = {
        'QB': [
            0.135,
            0.005,
            0.0001
        ],
        'RB': [
            0.275,
            0.14,
            0.02,
            0.015,
            0.005,
            0.005,
            0.0001
        ],
        'WR': [
            0.2,
            0.1,
            0.02,
            0.005,
            0.005,
            0.0001
        ],
        'TE': [
            0.05,
            0.001,
            0.0001
        ],
        'D': [
            0.01,
            0.00001,
            0.00001
        ],
        'K': [
            0.01,
            0.00001,
            0.00001
        ]
    }

    def _get(self, args):
        draft_id = args[0]
        owner_team = self.db.query(Team).filter(and_(Team.is_owner == True),
                                                     Team.draft_id == int(draft_id)).first()

        team_id = owner_team.id
        owned_players = self.db.query(Player).filter(Player.team_id == int(team_id)).all()

        positions = {
            'QB': [
                None,
                None,
                None
            ],
            'RB': [
                None,
                None,
                None,
                None,
                None,
                None,
                None
            ],
            'WR': [
                None,
                None,
                None,
                None,
                None,
                None
            ],
            'TE': [
                None,
                None,
                None
            ],
            'D': [
                None,
                None,
                None
            ],
            'K': [
                None,
                None,
                None
            ]
        }

        for player in owned_players:
            position = player.core.position
            pos_rank = player.core.position_rank

            slot = min(math.floor(pos_rank / 12), len(self.position_importance[position])-1)

            while slot < len(self.position_importance[position]):
                if positions[position][slot] == None:
                    positions[position][slot] = player
                    break
                slot+=1

        flattend_positions = []
        total_importance_gathered = 0.0
        for position, importances in self.position_importance.items():
            for index, importance in enumerate(importances):
                player = positions[position][index]
                flattend_positions.append({
                    'position': position, 'importance': importance, 'slot': index+1, 'player': player.to_dict(['core']) if player else None
                })
                if player:
                    total_importance_gathered += importance


        flattend_positions = sorted(flattend_positions, key=lambda pos: pos['importance'], reverse=True)

        for position in flattend_positions:
            if position['player'] is None:
                position['importance'] = position['importance'] / (1 - total_importance_gathered)
                position['target_price'] = math.floor(position['importance'] * owner_team.money)
            else:
                position['target_price'] = math.floor(position['importance'] * 200)

        return {'rostered_players': flattend_positions}