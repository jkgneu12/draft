import tornado
from tornado.gen import coroutine

from app.models import *

import logging
logger = logging.getLogger(__name__)

class BaseHandler(tornado.web.RequestHandler):

    def options(self, *args, **kwargs):
        pass

    @property
    def db(self):
        return self.application.db

    @property
    def request_body_json(self):
        return tornado.escape.json_decode(self.request.body)

    @staticmethod
    def _update_fields(obj, data):
        for prop, value in data.items():
            if hasattr(obj, prop):
                setattr(obj, prop, value)

class PlayersHandler(BaseHandler):

    def get(self, *args, **kwargs):
        q = self.db.query(Player)

        if self.get_query_argument('target_price', False):
            q.filter(Player.target_price != None)
        if self.get_query_argument('points', False):
            q.filter(Player.target_price > 0)

        players = q.all()

        self.write({player.id: player.to_dict() for player in players})

    def post(self, *args, **kwargs):
        player_name = self.request_body_json['name']
        position = self.request_body_json['position'] if 'position' in self.request_body_json else None
        if position is not None:
            player = self.db.query(Player).filter(and_(Player.name == player_name,
                                                       Player.position == position)).first()
        else:
            player = self.db.query(Player).filter(and_(Player.name == player_name)).first()

        request_body = self.request_body_json
        if player is None:
            return {}
        else:
            if player.target_price > request_body['target_price']:
                request_body['target_price'] = player.target_price
        self._update_fields(player, request_body)
        self.db.add(player)
        self.db.commit()

        self.write(player.to_dict())

class PlayerHandler(BaseHandler):

    def get(self, player_id):
        player = self.db.query(Player).filter(Player.id == int(player_id)).first()
        self.write(player.to_dict())

    def put(self, player_id):
        player = self.db.query(Player).filter(Player.id == int(player_id)).first()

        self._update_fields(player, self.request_body_json)

        self.db.add(player)
        self.db.commit()

        self.write(player.to_dict())


