import tornado
from engine import Engine

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
        draft = self.application.engine.draft

        return {
            'teams': [t for t in draft.other_teams],
            'settings': draft.settings.to_dict()
        }

    def _create(self, args):
        self.application.engine = Engine()


class TeamsHandler(BaseHandler):
    def _get(self, args):
        draft = self.application.engine.draft

        if len(args) > 0:
            return draft.other_teams[args[0]].to_dict()
        else:
            ret = {}
            for name in draft.other_teams:
                ret[name] = draft.other_teams[name].to_dict()

            return ret

    def _create(self, args):
        name = self.request_body_json['name']
        self.application.engine.add_other_team(name)
        return {
            'name': name
        }


class PlayersHandler(BaseHandler):
    def _get(self, args):
        draft = self.application.engine.draft

        if len(args) > 0:
            name = args[0]
            if name in draft.remaining_players:
                ret = draft.remaining_players[args[0]].to_dict()
                ret['available'] = True
            else:
                for team_name in draft.other_teams:
                    if name in draft.other_teams[team_name].players:
                        ret = draft.other_teams[team_name].players[name].to_dict()
                        ret['available'] = True
                        ret['owned'] = False
                        return ret
                if name in draft.team.players:
                    ret = draft.team.players[name].to_dict()
                    ret['available'] = True
                    ret['owned'] = True
                    return ret
        else:
            ret = {
            }
            for name in draft.remaining_players:
                ret[name] = draft.remaining_players[name].players

            return ret

    def _create(self, args):
        name = self.request_body_json['name']
        self.application.engine.add_other_team(name)
        return {
            'name': name
        }
