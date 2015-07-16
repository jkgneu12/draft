from engine import Engine
from server import BaseHandler


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
