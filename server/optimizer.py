import math

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
        costs.append(player.core.adjusted_price())
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

    qbs = 1
    min_rbs = 2
    max_rbs = 3
    min_wrs = 2
    max_wrs = 3
    min_tes = 1
    max_tes = 2
    ks = 1
    ds = 1
    tier_1_rbs = 0
    tier_2_rbs = 1
    tier_1_wrs = 2
    tier_2_wrs = 1
    studs = 1
    roster_size = constants.TEAM_SIZE - constants.BENCH_SIZE

    if starters[0] is not None:
        qbs -= 1
        roster_size -= 1

    if starters[1] is not None:
        min_rbs -= 1
        max_rbs -= 1
        roster_size -= 1
        if starters[1].core.tier <= 1:
            studs -= 1
        if starters[1].core.tier <= 2:
            tier_1_rbs -=1
        elif starters[1].core.tier <= 4:
            tier_2_rbs -=1

    if starters[2] is not None:
        min_rbs -= 1
        max_rbs -= 1
        roster_size -= 1
        if starters[2].core.tier <= 4:
            tier_2_rbs -= 1

    if starters[3] is not None:
        min_wrs -= 1
        max_wrs -= 1
        roster_size -= 1
        if starters[3].core.tier <= 1:
            studs = 0
        if starters[3].core.tier <= 2:
            tier_1_wrs -=1
        elif starters[3].core.tier <= 4:
            tier_2_wrs -=1

    if starters[4] is not None:
        min_wrs -= 1
        max_wrs -= 1
        roster_size -= 1
        if starters[4].core.tier <= 2:
            tier_1_wrs -=1
        elif starters[4].core.tier <= 4:
            tier_2_wrs -=1

    if starters[5] is not None:
        min_tes -= 1
        max_tes -= 1
        roster_size -= 1
        if starters[5].core.tier <= 1:
            studs = 0
        if starters[5].core.tier <= 2:
            tier_1_wrs -= 1

    if starters[6] is not None:
        if starters[6].core.position == 'RB':
            max_rbs -= 1
            if starters[6].core.tier <= 2:
                tier_1_rbs -= 1
            elif starters[6].core.tier <= 4:
                tier_2_rbs -= 1
        if starters[6].core.position == 'WR':
            max_wrs -= 1
            if starters[6].core.tier <= 2:
                tier_1_wrs -= 1
            elif starters[6].core.tier <= 4:
                tier_2_wrs -= 1
        if starters[6].core.position == 'TE':
            max_tes -= 1
        roster_size -= 1

    if starters[7] is not None:
        ds -= 1
        roster_size -= 1

    if starters[8] is not None:
        ks -= 1
        roster_size -= 1

    studs = 0
    tier_1_rbs = 0
    tier_2_rbs = 0
    tier_1_wrs = 0
    tier_2_wrs = 0

    res = r_code.optimize(dataf, money, qbs, qbs, min_rbs, max_rbs, min_wrs, max_wrs, min_tes, max_tes, ks, ds, tier_1_rbs, tier_2_rbs, tier_1_wrs, tier_2_wrs, studs, roster_size)

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
        pts = 0
        if player.core.likes:
            pts += 200
        if not player.core.dislikes:
            pts += player.core.adjusted_points()
        points.append(pts * constants.OPTIMIZER_POINTS_MULTIPLIER)
        costs.append(player.core.adjusted_price())
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
