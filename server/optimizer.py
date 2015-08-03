
from multiprocessing import Manager
from multiprocessing.pool import Pool
from sqlalchemy import and_
import constants
from models import Player, PlayerCore

manager = Manager()
cache = manager.dict()


def optimize_roster(db, draft_id, starters, money):
    available = []
    for idx, positions in enumerate(constants.required_positions):
        available.append(db.query(Player).join(Player.core).filter(and_(PlayerCore.position.in_(positions),
                                                                        PlayerCore.rank != None,
                                                                        PlayerCore.target_price != None,
                                                                        PlayerCore.target_price >= constants.required_prices[idx][0],
                                                                        PlayerCore.target_price <= constants.required_prices[idx][1],
                                                                        PlayerCore.points > 0,
                                                                        Player.draft_id == draft_id,
                                                                        Player.team_id == None))
                         .group_by(PlayerCore.target_price).order_by(PlayerCore.rank).all())

    filled_slots = [i for i, p in enumerate(starters) if p is not None]

    result = optimize_remaining(available, filled_slots, money, [])

    print(result[0])
    for player in result[1]:
        print("%s\t%s\t%s\t\t%s\t\t%s" % (
            player.core.name, player.core.target_price + constants.PRICE_OFFSET, player.core.points, player.core.rank, player.core.adp))
    return result[1]


def optimize_remaining(available, filled_slots, money, picked_players):
    best_result = (0, [])

    if len(filled_slots) == len(available):
        return best_result

    key = "%s::%s" % (len(filled_slots), money)

    if key in cache:
        return cache[key]

    idx = 0
    while idx in filled_slots and idx < len(available):
        idx += 1

    if idx == len(available):
        return (0, picked_players)

    available_players = available[idx]

    tmp_filled_slots = list(filled_slots)
    tmp_filled_slots.append(idx)

    if idx == constants.THREAD_DEPTH:
        pool = Pool(processes=len(available_players))
        pool_results = []

    for i, player in enumerate(available_players):
        if idx == constants.THREAD_DEPTH:
            pool_results.append(pool.apply_async(optimize_for_player, args=(
                player, available, tmp_filled_slots, money, picked_players)))
        else:
            result = optimize_for_player(player, available, tmp_filled_slots, money, picked_players)
            if result[0] > best_result[0]:
                best_result = result

    if idx == constants.THREAD_DEPTH:
        pool.close()
        results = [p.get() for p in pool_results]
        for result in results:
            if result[0] > best_result[0]:
                best_result = result

    cache[key] = best_result

    return best_result


def optimize_for_player(player, available, filled_slots, money, picked_players):
    money = money - player.core.target_price - constants.PRICE_OFFSET

    if money >= 0:
        tmp_available = list(available)
        tmp_picked_players = list(picked_players)
        tmp_picked_players.append(player)

        result = optimize_remaining(tmp_available,
                                    filled_slots,
                                    money,
                                    tmp_picked_players)

        result = (result[0] + player.core.points, result[1])
        result[1].append(player)

        return result
    else:
        return 0, []