import tornado
from tornado.gen import coroutine

import logging
logger = logging.getLogger(__name__)

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
    def stats_service(self):
        return self.application.stats_service

    @property
    def drafts_service(self):
        return self.application.drafts_service

    @property
    def request_body_json(self):
        return tornado.escape.json_decode(self.request.body)

# Stat Service

class PlayersHandler(BaseHandler):
    @coroutine
    def get(self, *args, **kwargs):
        self.write((yield self.stats_service.get('/players')))

    @coroutine
    def post(self, *args, **kwargs):
        self.write((yield self.stats_service.post('/players', body=self.request_body_json)))

class PlayerHandler(BaseHandler):
    @coroutine
    def get(self, player_id):
        self.write((yield self.stats_service.get('/players/{}'.format(player_id))))

    @coroutine
    def put(self, player_id):
        self.write((yield self.stats_service.put('/players/{}'.format(player_id), body=self.request_body_json)))


# Draft Service

class DraftsHandler(BaseHandler):
    @coroutine
    def get(self, *args, **kwargs):
        self.write((yield self.drafts_service.get('/drafts')))

    @coroutine
    def post(self, *args, **kwargs):
        self.write((yield self.drafts_service.post('/drafts', body=self.request_body_json)))

class DraftHandler(BaseHandler):
    @coroutine
    def get(self, draft_id):
        self.write((yield self.drafts_service.get('/drafts/{}'.format(draft_id))))

    @coroutine
    def put(self, draft_id):
        self.write((yield self.drafts_service.put('/drafts/{}'.format(draft_id), body=self.request_body_json)))

class DraftTeamsHandler(BaseHandler):
    @coroutine
    def get(self, draft_id):
        self.write((yield self.drafts_service.get('/drafts/{}/teams'.format(draft_id))))

    @coroutine
    def post(self, draft_id):
        self.write((yield self.drafts_service.post('/drafts/{}/teams'.format(draft_id), body=self.request_body_json)))

class DraftTeamHandler(BaseHandler):
    @coroutine
    def get(self, draft_id, team_id):
        self.write((yield self.drafts_service.get('/drafts/{}/teams'.format(draft_id, team_id))))

    @coroutine
    def put(self, draft_id, team_id):
        self.write((yield self.drafts_service.put('/drafts/{}/teams'.format(draft_id, team_id), body=self.request_body_json)))

class DraftPlayersHandler(BaseHandler):
    @coroutine
    def get(self, draft_id):
        self.write((yield self.drafts_service.get('/drafts/{}/players'.format(draft_id))))

class DraftPlayerHandler(BaseHandler):
    @coroutine
    def get(self, draft_id, player_id):
        self.write((yield self.drafts_service.get('/drafts/{}/players/{}'.format(draft_id, player_id))))

    @coroutine
    def put(self, draft_id, player_id):
        self.write((yield self.drafts_service.put('/drafts/{}/players/{}'.format(draft_id, player_id), body=self.request_body_json)))

class DraftRostersHandler(BaseHandler):
    @coroutine
    def get(self, draft_id):
        self.write((yield self.drafts_service.get('/drafts/{}/rosters'.format(draft_id))))

