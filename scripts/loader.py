import argparse
import csv

import requests

parser = argparse.ArgumentParser()

parser.add_argument("-f", "--filename", help="File to parse")

args = parser.parse_args()
print(args.filename)

file = open(args.filename, 'r')

ffa_name_mappings = {
    "Will Fuller V": "Will Fuller",
    "Terrelle Pryor Sr.": "Terrelle Pryor",
    "Tedd Ginn Jr.": "Tedd Ginn",
    "Odell Beckham Jr.": "Odell Beckham Jr",
    "Wil Lutz": "Will Lutz",


    "Colts": "Indianapolis",
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
    "Rams": "Los Angeles Rams",
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
    "Chargers": "Los Angeles Chargers",
    "Raiders": "Oakland Raiders"


}

for line in csv.reader(file, delimiter="\t"):

    if args.filename == 'espn':
        name = line[1]
        position = line[0]
        if position == 'D':
            name = name.replace(' D/ST', '')
        if name in ffa_name_mappings:
            name = ffa_name_mappings[name]

        player = {
            'name': name,
            'position': position,
            'target_price': int(line[3][1:])
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
            'target_price': round(float(line[18])) if line[18] != 'null' else 0,
            'dropoff': round(float(line[14])) if line[14] != 'null' else None,
            'risk': round(float(line[20])) if line[20] != 'null' else None,
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
        name_team_bye = line[0].split('(')
        if len(name_team_bye) > 1:
            bye = name_team_bye[1][:-1]
        else:
            bye = None
        name_team = name_team_bye[0].strip().split(' ')
        if line[6] == 'D':
            team = ' '.join(name_team)
            name = ' '.join(name_team)
        else:
            team = name_team[-1:]
            name = ' '.join(name_team[:-1])

        if line[6] == 'K':
            name = name.replace(',', '')

        player = {
            'name': name,
            'team_name': team,
            'position': line[6],
            'position_rank': line[1],
            'adp': line[4],
            'points': line[2],
            'risk': line[3],
            'tier': line[5].split(' ')[1],
            'notes': line[7] if len(line) > 7 else None,
            'bye': bye,
            'target_price': 1
        }

    elif args.filename == 'footballers_auction':
        name_team_bye = line[0].split('(')
        name_team = name_team_bye[0].strip().split(' ')
        if line[1] == 'D':
            team = ' '.join(name_team)
            name = ' '.join(name_team)
        else:
            team = name_team[-1:]
            name = ' '.join(name_team[:-1])

        player = {
            'name': name,
            'team_name': team,
            'position': line[1],
            'target_price': int(line[2])
        }

    elif args.filename == 'footballers_ranks':
        name_team_bye = line[0].split('(')
        name_team = name_team_bye[0].strip().split(' ')

        if line[1] == 'D':
            team = ' '.join(name_team)
            name = ' '.join(name_team)
        else:
            team = name_team[-1:]
            name = ' '.join(name_team[:-1])

        if line[1] == 'K':
            name = name.replace(',', '')

        player = {
            'name': name,
            'team_name': team,
            'position': line[1],
            'rank': line[2],
            'target_price': 1
        }

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

    # print(player)
    response = requests.post('http://localhost:9000/players', json=player)
    print(response.json)

