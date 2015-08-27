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

    elif args.filename == 'ffa':
        player = {
            'adp': round(float(line[15])) if line[15] != 'null' else None,
            'rank': round(float(line[11])) if line[11] != 'null' else None,
            'name': line[2] if line[2] != 'null' else None,
            'team_name': line[4]if line[4] != 'null' else 'FA',
            'position': line[3] if line[3] != 'null' else None,
            'position_rank': line[12] if line[12] != 'null' else None,
            'ecr': line[10] if line[10] != 'null' else None,
            # 'target_price': round(float(line[17])) if line[17] != 'null' else 0,
            'dropoff': round(float(line[14])) if line[14] != 'null' else None,
            'risk': round(float(line[20])) if line[20] != 'null' else None,
            'points': round(float(line[19])) if line[19] != 'null' else None
        }

        if player['position'] == 'DST':
            player['position'] = 'D'

        if player['name'] in ffa_name_mappings:
            player['name'] = ffa_name_mappings[player['name']]
        if player['position'] in ['DEF', 'DL', 'LB', 'DB', 'OLB', 'MLB', 'ILB', 'DE', 'FS', 'SS', 'DT', 'CB', 'NT', 'SAF']:
            continue

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

    response = requests.post('http://localhost:9000/players', json=player)
    print(response.json)

