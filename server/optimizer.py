import math
from sqlalchemy import and_
import rpy2.robjects as robjects
from rpy2.robjects.packages import SignatureTranslatedAnonymousPackage
import constants
from models import Player, PlayerCore

r_code = """
library(Rglpk)
optimize <- function(optimizeData, maxCost, qbs, min_rbs, max_rbs, min_wrs, max_wrs, min_tes, max_tes, ks, ds, num_players) {

    points=optimizeData$points
    playerCost=optimizeData$cost

    num.players <- length(optimizeData$name)
    var.types <- rep("I", num.players)

    A <- rbind(as.numeric(optimizeData$pos == "QB"), # num QB
             as.numeric(optimizeData$pos == "RB"), # num RB
             as.numeric(optimizeData$pos == "RB"), # num RB
             as.numeric(optimizeData$pos == "WR"), # num WR
             as.numeric(optimizeData$pos == "WR"), # num WR
             as.numeric(optimizeData$pos == "TE"), # num TE
             as.numeric(optimizeData$pos == "TE"), # num TE,
             as.numeric(optimizeData$pos == "K"), # num K,
             as.numeric(optimizeData$pos == "D"), # num D
             playerCost,                           # total cost
             rep(1,num.players))                   # num of players in starting lineup

    dir <- c("==",
           ">=",
           "<=",
           ">=",
           "<=",
           ">=",
           "<=",
           "==",
           "==",
           "<=",
           "==")

    b <- c(qbs,
         min_rbs,
         max_rbs,
         min_wrs,
         max_wrs,
         min_tes,
         max_tes,
         ks,
         ds,
         maxCost,
         num_players)

    return(Rglpk_solve_LP(obj = points, mat = A, dir = dir, rhs = b,types = var.types, max = TRUE))
}
"""

r_code = SignatureTranslatedAnonymousPackage(r_code, "r_code")


def optimize_roster(db, draft_id, starters, money):
    players = db.query(Player).join(Player.core).filter(and_(PlayerCore.rank != None,
                                                             PlayerCore.target_price != None,
                                                             PlayerCore.points > 0,
                                                             Player.draft_id == draft_id,
                                                             Player.team_id == None)).order_by(PlayerCore.rank).all()

    names = []
    positions = []
    points = []
    costs = []

    for player in players:
        names.append(player.core.name)
        positions.append(player.core.position)
        points.append(player.core.points)
        costs.append(player.core.target_price + constants.PRICE_OFFSET)


    d = {
        'name': robjects.StrVector(names),
        'player': robjects.StrVector(names),
        'pos': robjects.StrVector(positions),
        'points': robjects.IntVector(points),
        'cost': robjects.IntVector(costs)

    }
    dataf = robjects.DataFrame(d)

    qbs = 1
    min_rbs = 2
    max_rbs = 3
    min_wrs = 2
    max_wrs = 3
    min_tes = 1
    max_tes = 2
    ks = 0 if starters[8] is not None else 1
    ds = 0 if starters[7] is not None else 1
    roster_size = 9

    if starters[0] is not None:
        qbs -= 1
        roster_size -= 1

    if starters[1] is not None:
        min_rbs -= 1
        max_rbs -= 1
        roster_size -= 1

    if starters[2] is not None:
        min_rbs -= 1
        max_rbs -= 1
        roster_size -= 1

    if starters[3] is not None:
        min_wrs -= 1
        max_wrs -= 1
        roster_size -= 1

    if starters[4] is not None:
        min_wrs -= 1
        max_wrs -= 1
        roster_size -= 1

    if starters[5] is not None:
        min_tes -= 1
        max_tes -= 1
        roster_size -= 1

    if starters[6] is not None:
        if starters[6].core.position == 'RB':
            max_rbs -= 1
        if starters[6].core.position == 'WR':
            max_wrs -= 1
        if starters[6].core.position == 'TE':
            max_tes -= 1
        roster_size -= 1

    if starters[7] is not None:
        ds -= 1
        roster_size -= 1

    if starters[8] is not None:
        ks -= 1
        roster_size -= 1

    res = r_code.optimize(dataf, math.ceil(money * constants.BUDGET_BUFFER_PCT), qbs, min_rbs, max_rbs, min_wrs, max_wrs, min_tes, max_tes, ks, ds, roster_size)

    res = res[1]

    roster = []
    for idx, count in enumerate(res):
        for i in range(int(count)):
            player = players[idx]
            print("%s\t%s\t%s\t\t%s\t\t%s" % (player.core.name, player.core.target_price + constants.PRICE_OFFSET, player.core.points, player.core.rank, player.core.adp))
            roster.append(player)

    return roster