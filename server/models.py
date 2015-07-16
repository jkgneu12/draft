
class Player:
    def __init__(self):
        self.value = 0
        self.amount_paid = -1
        self.name = None
        self.team = None
        self.position = None

    def to_dict(self):
        return {
            'value': self.value,
            'amount_paid': self.amount_paid,
            'name': self.name,
            'team': self.team,
            'position': self.position
        }


class PlayerSet:
    def __init__(self):
        self.players = {
            "QB":[],
            "RB":[],
            "WR":[],
            "TE":[],
            "K":[],
            "D":[]
        }


class Team:
    def __init__(self):
        self.remaining_money = 200
        self.players = PlayerSet()

    def to_dict(self):
        return {
            'remaining_money': self.remaining_money,
            'players': self.players.players
        }


class MyTeam:
    def __init__(self):
        self.remaining_money = 200
        self.starters = PlayerSet()
        self.bench = PlayerSet()

    def to_dict(self):
        return {
            'remaining_money': self.remaining_money,
            'starters': self.starters.players,
            'bench': self.bench.players
        }


class Settings:
    def __init__(self):
        self.starting_positions = {
            "QB":1,
            "RB":3,
            "WR":2,
            "TE":1,
            "K":1,
            "D":1
        }
        self.bench_positions = {
            "QB":1,
            "RB":2,
            "WR":2,
            "TE":1,
            "K":0,
            "D":0
        }

    def to_dict(self):
        return {
            'starting_positions': self.starting_positions,
            'bench_positions': self.bench_positions
        }


class Draft:
    def __init__(self):
        self.team = MyTeam()
        self.other_teams = {}
        self.remaining_players = PlayerSet()
        self.settings = None




