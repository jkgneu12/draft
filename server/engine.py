from models import Draft, Team


class Engine:
    def __init__(self):
        self.draft = Draft()
        self._load_players()

    def _load_players(self):
        ##TODO: load player data from source
        pass

    def assign_player(self, team_name, player_name, position):
        remaining_in_position = self.draft.remaining_players[position]

        player = None ## TODO: find + remove from remaining players

        player_set = None
        if team_name is None:
            team = self.draft.team
            if len(team.starters.players[position]) == self.draft.settings.starting_positions[position]:
                player_set = team.bench
            else:
                player_set = team.starters
        else:
            player_set = self.draft.other_teams[team_name].players

        player_set.players[position].append(player)

    def add_other_team(self, name):
        self.draft.other_teams[name] = Team()

    def player_search(self, query):
        #TODO
        pass