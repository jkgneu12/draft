import argparse
import csv

import requests

parser = argparse.ArgumentParser()

parser.add_argument("-f", "--filename", help="File to parse")

args = parser.parse_args()
print(args.filename)

file = open(args.filename, 'r')

ffa_name_mappings = {
    "Dan Herron": "Daniel Herron",
    "LeVeon Bell": "Le'Veon Bell",
    "Odell Beckham": "Odell Beckham Jr.",
    "Robert Griffin" : "Robert Griffin III",
    "Steve Smith Sr.": "Steve Smith",

    "Colts": "Indianapolis Colts",
    "Giants": "New York Giants",
    "Buccaneers": "Tampa Bay Buccaneers",
    "Bears": "Chicago Bears",
    "Bills": "Buffalo Bills",
    "Texans": "Houston Texans",
    "Seahawks": "Seattle Seahawks",
    "Cardinals": "Arizona Cardinals",
    "Patriots": "New England Patriots",
    "Chiefs": "Kansas City Chiefs",
    "Eagles": "Philadelphia Eagles",
    "Panthers": "Carolina Panthers",
    "Rams": "St. Louis Rams",
    "Packers": "Green Bay Packers",
    "Ravens": "Baltimore Ravens",
    "Lions": "Detroit Lions",
    "Broncos": "Denver Broncos",
    "Dolphins": "Miami Dolphins",
    "49ers": "San Francisco 49ers",
    "Cowboys": "Dallas Cowboys",
    "Jaguars": "Jacksonville Jaguars",
    "Browns": "Cleveland Browns",
    "Bengals": "Cincinnati Bengals",
    "Jets": "New York Jets",
    "Falcons": "Atlanta Falcons",
    "Vikings": "Minnesota Vikings",
    "Steelers": "Pittsburgh Steelers",
    "Saints": "New Orleans Saints",
    "Titans": "Tennessee Titans",
    "Redskins": "Washington Redskins",
    "Chargers": "San Diego Chargers",
    "Raiders": "Oakland Raiders"


}

for line in csv.reader(file, delimiter="\t"):

    if args.filename == 'espn':
        rank_name_pos = line[0]

        rank = rank_name_pos.split('.')[0]
        name = rank_name_pos.split(',')[0][len(rank)+2:]

        target_price = line[4][1:]
        if target_price == '-' or target_price == '--':
            target_price = 0

        bye = line[2]
        if bye == '-' or bye == '--':
            bye = -1

        position = ''.join([i for i in line[3] if not i.isdigit()])
        if position == 'DST':
            position = 'D'

        player = {
            # 'rank': rank,
            'name': name,
            # 'team_name': line[1],
            'position': position,
            # 'position_rank': ''.join([i for i in line[3] if i.isdigit()]),
            'target_price': target_price,
            'bye': bye
        }

        if player['name'] in ffa_name_mappings:
            player['name'] = ffa_name_mappings[player['name']]

    elif args.filename == 'espn_kickers':
        rank_name_pos = line[0]

        rank = rank_name_pos.split('.')[0]
        name = rank_name_pos.split(',')[0][len(rank)+2:]

        player = {
            'position_rank': round(float(rank)),
            'name': name,
            'team_name': line[1],
            'position': 'K',
            'target_price': 1,
            'points': 100 - round(float(rank)),
            'tier': round((float(rank) + 5) / 5),
            'rank': 200 + round(float(rank))
        }

        if player['name'] in ffa_name_mappings:
            player['name'] = ffa_name_mappings[player['name']]

    elif args.filename == 'espn_auction':
        price = round(float(line[0]))
        if price == 0:
            price = 1
        player = {
            'name': line[1],
            'target_price': price
        }

        if player['name'] in ffa_name_mappings:
            player['name'] = ffa_name_mappings[player['name']]

    elif args.filename == 'ffa':
        player = {
            'adp': round(float(line[16])) if line[16] != 'null' else None,
            'rank': round(float(line[11])) if line[11] != 'null' else None,
            'name': line[2] if line[2] != 'null' else None,
            'team_name': line[4]if line[4] != 'null' else 'FA',
            'position': line[3] if line[3] != 'null' else None,
            'position_rank': line[12] if line[12] != 'null' else None,
            'ecr': line[10] if line[10] != 'null' else None,
            'target_price': round(float(line[18])) if line[18] != 'null' else 0,
            'dropoff': round(float(line[15])) if line[15] != 'null' else None,
            'risk': round(float(line[21])) if line[21] != 'null' else None,
            'points': round(float(line[8])) if line[8] != 'null' else None,
            'floor': round(float(line[20])) if line[20] != 'null' else None,
            'ceil': round(float(line[19])) if line[19] != 'null' else None
        }

        if player['position'] == 'DST':
            player['position'] = 'D'

        if player['name'] in ffa_name_mappings:
            player['name'] = ffa_name_mappings[player['name']]
        if player['position'] in ['DEF', 'DL', 'LB', 'DB', 'OLB', 'MLB', 'ILB', 'DE', 'FS', 'SS', 'DT', 'CB', 'NT', 'SAF']:
            continue

    elif args.filename == 'footballers':
        name = line[0].split(' ')[0] + ' ' + line[0].split(' ')[1]
        team = line[0].split(' ')[2]

        tier = line[5].split(' ')[1]

        player = {
            'name': name if name != 'null' else None,
            'team_name': team if team != 'null' else 'FA',
            'position_rank': round(float(line[1])) if line[1] != 'null' else 0,
            'adp': round(float(line[2])) if line[2] != 'null' else None,
            'points': round(float(line[3])) if line[3] != 'null' else None,
            'risk': round(float(line[4])) if line[4] != 'null' else None,
            'tier': float(tier) if float(tier) != 'null' else 0,
            'position': line[6] if line[6] != 'null' else None,
            'notes': line[7] if line[7] != 'null' else None,
        }

        if player['name'] in ffa_name_mappings:
            player['name'] = ffa_name_mappings[player['name']]

    elif args.filename == 'footballers_overall':
        name = line[0].split(' ')[0] + ' ' + line[0].split(' ')[1]
        team = line[0].split(' ')[2]

        player = {
            'name': name if name != 'null' else None,
            'team_name': team if team != 'null' else 'FA',
            'rank': round(float(line[1])) if line[1] != 'null' else None
        }

        if player['name'] in ffa_name_mappings:
            player['name'] = ffa_name_mappings[player['name']]

    elif args.filename == 'footballers_df':
        rank = round(float(line[1])) if line[1] != 'null' else 100
        player = {
            'name': line[0] if line[0] != 'null' else None,
            'team_name': line[0] if line[0] != 'null' else 'FA',
            'position_rank': rank,
            'target_price': round(float(line[2])) if line[2] != 'null' else 0,
            'position': 'D',
            'points': 100 - round(float(rank)),
            'tier': round((float(rank) + 5) / 5),
            'rank': 250 + round(float(rank))
        }

        if player['name'] in ffa_name_mappings:
            player['name'] = ffa_name_mappings[player['name']]

    elif args.filename == 'footballers_auction':
        name = line[0].split(' ')[0] + ' ' + line[0].split(' ')[1]
        team = line[0].split(' ')[2]

        player = {
            'name': name if name != 'null' else None,
            'team_name': team if team != 'null' else 'FA',
            'target_price': round(float(line[1])) if line[1] != 'null' else 0
        }

        if player['name'] in ffa_name_mappings:
            player['name'] = ffa_name_mappings[player['name']]

    else:
        name_team = line[2].split('(')
        min_max = line[8].split('-')

        player = {
            'rank': line[1],
            'name': name_team[0][:-1],
            'team_name': name_team[1][:-1],
            'position': line[3],
            'position_rank': line[4].split()[0][1:],
            'target_price': line[9][1:]
        }

    response = requests.post('http://localhost:80/players', json=player)
    print(response.json)

