THREAD_DEPTH = 0
PRICE_OFFSET = .15
RB_PRICE_OFFSET = .25
TEAM_SIZE = 22
MAX_BUDGET = 200
OPTIMIZER_POINTS_MULTIPLIER = 100000

required_positions = [
    ['QB'],
    ['RB'],
    ['RB'],
    ['RB'],
    ['RB'],
    ['WR'],
    ['WR'],
    ['WR'],
    ['WR'],
    ['TE'],
    ['D'],
    ['K']
]

BENCH_SIZE = TEAM_SIZE - len(required_positions)
