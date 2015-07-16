import tornado
from models import Draft, Team, Player

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
        self.db.add(draft)

        return draft.to_dict()


class TeamsHandler(BaseHandler):
    def _get(self, args):
        id = args[0] if len(args) > 0 else None

        q = self.db.query(Team)
        if id is not None:
            team = q.filter(Team.id == int(id)).first()
            return team.to_dict()
        else:
            teams = q.all()
            return {'teams': [t.to_dict() for t in teams]}

    def _create(self, args):
        name = self.request_body_json['name']

        team = Team(name=name)
        self.db.add(team)

        return team.to_dict()


class PlayersHandler(BaseHandler):
    def _get(self, args):
        id = args[0] if len(args) > 0 else None

        q = self.db.query(Player)
        if id is not None:
            player = q.filter(Player.id == int(id)).first()
            return player.to_dict()
        else:
            players = q.all()
            return {'players': [p.to_dict() for p in players]}

    def _create(self, args):
        name = self.request_body_json['name']

        player = Player(name=name)
        self.db.add(player)

        return player.to_dict()
