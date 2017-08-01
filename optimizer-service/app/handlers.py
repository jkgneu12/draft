import tornado
from tornado.gen import coroutine

from app.optimizer import optimize_roster, optimize_bench

import logging
logger = logging.getLogger(__name__)

class BaseHandler(tornado.web.RequestHandler):

    def options(self, *args, **kwargs):
        pass

    @property
    def request_body_json(self):
        return tornado.escape.json_decode(self.request.body)


class OptimizeHandler(BaseHandler):

    def get(self, *args, **kwargs):
        logger.debug(self.request_body_json)

        optimize = optimize_bench if self.request_body_json['bench'] else optimize_roster

        roster, points = optimize(self.request_body_json.get('starters'),
                                  self.request_body_json.get('available_players'),
                                  self.request_body_json.get('money'))

        self.write({'roster':roster,'points':points})



