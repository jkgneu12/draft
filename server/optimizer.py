import math
from copy import deepcopy

import constants

import rpy2.robjects as robjects
from rpy2.robjects.packages import SignatureTranslatedAnonymousPackage

r_code = """
library(Rglpk)
optimize <- function(optimizeData, maxCost, min_qbs, max_qbs, min_rbs, max_rbs, min_wrs, max_wrs, min_tes, max_tes, ks, ds, tier_1_rbs, tier_2_rbs, tier_1_wrs, tier_2_wrs, studs, num_players) {

    points=optimizeData$points
    playerCost=optimizeData$cost

    num.players <- length(optimizeData$name)
    var.types <- rep("I", num.players)

    A <- rbind(as.numeric(optimizeData$pos == "QB"), # num QB
             as.numeric(optimizeData$pos == "QB"), # num QB
             as.numeric(optimizeData$pos == "RB"), # num RB
             as.numeric(optimizeData$pos == "RB"), # num RB
             as.numeric(optimizeData$pos == "WR"), # num WR
             as.numeric(optimizeData$pos == "WR"), # num WR
             as.numeric(optimizeData$pos == "TE"), # num TE
             as.numeric(optimizeData$pos == "TE"), # num TE,
             as.numeric(optimizeData$pos == "K"), # num K,
             as.numeric(optimizeData$pos == "D"), # num D,
             as.numeric(optimizeData$tier == "RB1"), # num tier 1 RB,
             as.numeric(optimizeData$tier == "RB2"), # num tier 2 RB,
             as.numeric(optimizeData$tier == "WR1"), # num tier 1 WR,
             as.numeric(optimizeData$tier == "WR2"), # num tier 2 WR,
             as.numeric(optimizeData$stud == "STUD"), # num studs,
             playerCost,                           # total cost
             rep(1,num.players))                   # num of players in starting lineup

    dir <- c(">=",
           "<=",
           ">=",
           "<=",
           ">=",
           "<=",
           ">=",
           "<=",
           "==",
           "==",
           ">=",
           ">=",
           ">=",
           ">=",
           ">=",
           "<=",
           "==")

    b <- c(min_qbs,
         max_qbs,
         min_rbs,
         max_rbs,
         min_wrs,
         max_wrs,
         min_tes,
         max_tes,
         ks,
         ds,
         tier_1_rbs,
         tier_2_rbs,
         tier_1_wrs,
         tier_2_wrs,
         studs,
         maxCost,
         num_players)

    bounds <- list(lower = list(ind = seq(1, num.players, 1), val = rep(0, num.players)),
                   upper = list(ind = seq(1, num.players, 1), val = rep(1, num.players)))

    return(Rglpk_solve_LP(obj = points, mat = A, dir = dir, rhs = b,types = var.types, bounds = bounds, max = TRUE))
}
"""

r_code = SignatureTranslatedAnonymousPackage(r_code, "r_code")


def optimize_roster(starters, available_players, money):

    names = []
    positions = []
    points = []
    costs = []
    tiers = []
    studs = []

    for player in available_players:
        names.append(player.core.name)
        positions.append(player.core.position)
        points.append(player.core.adjusted_points() * constants.OPTIMIZER_POINTS_MULTIPLIER)
        costs.append(player.core.adjusted_price(available_players))
        tier = 3
        stud = "NOPE"
        if player.core.tier <= 1 and player.core.position in ['RB','WR']:
            stud = "STUD"
        if player.core.tier <= 2:
            tier = 1
        elif player.core.tier <= 4:
            tier = 2
        tiers.append(player.core.position + str(tier))
        studs.append(stud)

    d = {
        'name': robjects.StrVector(names),
        'player': robjects.StrVector(names),
        'pos': robjects.StrVector(positions),
        'points': robjects.IntVector(points),
        'cost': robjects.IntVector(costs),
        'tier': robjects.StrVector(tiers),
        'stud': robjects.StrVector(studs)

    }
    dataf = robjects.DataFrame(d)

    mins = {
        'QB': 0,
        'RB': 0,
        'WR': 0,
        'TE': 0,
        'D': 0,
        'K': 0
    }
    maxs = deepcopy(mins)

    roster_size = len(constants.required_positions)


    for pos_list in constants.required_positions:
        for pos in pos_list:
            if len(pos_list) == 1:
                mins[pos] += 1
            maxs[pos] += 1


    for starter in starters:
        if starter is not None:
            roster_size -= 1
            mins[starter.core.position] -= 1
            mins[starter.core.position] = max(0, mins[starter.core.position])
            maxs[starter.core.position] -= 1
            maxs[starter.core.position] = max(0, maxs[starter.core.position])

    res = r_code.optimize(dataf, money,
                          mins['QB'], maxs['QB'],
                          mins['RB'], maxs['RB'],
                          mins['WR'], maxs['WR'],
                          mins['TE'], maxs['TE'],
                          mins['K'],
                          mins['D'],
                          0, 0, 0, 0, 0,
                          roster_size)

    res = res[1]

    roster = []
    points = 0
    for p in starters:
        if p is not None:
            points += p.core.adjusted_points()
    for idx, count in enumerate(res):
        for i in range(int(count)):
            player = available_players[idx]
            points += player.core.adjusted_points()
            roster.append(player)

    return roster, points


def optimize_bench(bench, available_players, money):

    names = []
    positions = []
    points = []
    costs = []
    tiers = []
    studs = []

    for player in available_players:
        names.append(player.core.name)
        positions.append(player.core.position)
        pts = player.core.adjusted_points() * constants.OPTIMIZER_POINTS_MULTIPLIER
        if player.core.likes:
            pts *= 2
        if player.core.dislikes:
            pts /= 2
        points.append(pts)
        costs.append(player.core.adjusted_price(available_players))
        tiers.append(player.core.position + '5')
        studs.append("NOPE")

    d = {
        'name': robjects.StrVector(names),
        'player': robjects.StrVector(names),
        'pos': robjects.StrVector(positions),
        'points': robjects.IntVector(points),
        'cost': robjects.IntVector(costs),
        'tiers': robjects.StrVector(tiers),
        'studs': robjects.StrVector(studs)

    }
    dataf = robjects.DataFrame(d)

    min_qbs = 0
    max_qbs = 0
    min_rbs = 0
    max_rbs = constants.BENCH_SIZE
    min_wrs = 0
    max_wrs = constants.BENCH_SIZE
    min_tes = 0
    max_tes = 1
    ks = 0
    ds = 0
    bench_size = constants.BENCH_SIZE - len(bench)

    for player in bench:
        if player.core.position == 'TE':
            max_tes = 0

    res = r_code.optimize(dataf, money, min_qbs, max_qbs, min_rbs, max_rbs, min_wrs, max_wrs, min_tes, max_tes, ks, ds, 0, 0, 0, 0, 0, bench_size)

    res = res[1]

    bench = []
    points = 0
    for p in bench:
        if p is not None:
            points += p.core.adjusted_points()
    for idx, count in enumerate(res):
        for i in range(int(count)):
            player = available_players[idx]
            points += player.core.adjusted_points()
            bench.append(player)


    return bench, points
