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
        name = line[0]

        if name in ffa_name_mappings:
            name = ffa_name_mappings[name]

        team_price_bye = line[1]
        price = team_price_bye.split(' ')[1][1:]

        player = {
            'name': name,
            'target_price': int(price)
        }

    elif args.filename == 'ffa':
        name = line[0]
        if name in ffa_name_mappings:
            name = ffa_name_mappings[name]

        try:
            player = {
                'name': name,
                'target_price': int(line[2])
            }
        except:
            continue

    elif args.filename == 'fantasypros_points':
        name = line[0]

        if name in ffa_name_mappings:
            name = ffa_name_mappings[name]

        try:
            player = {
                'name': name,
                'points': float(line[2]),
                'target_price': 1
            }
        except:
            continue

    elif args.filename == 'fantasypros_adp':
        name = line[1]

        if name in ffa_name_mappings:
            name = ffa_name_mappings[name]

        try:
            player = {
                'name': name,
                'adp': int(line[0]),
                'target_price': 1
            }
        except:
            continue

    elif args.filename == 'fantasypros_auction':
        name = line[1]

        if name in ffa_name_mappings:
            name = ffa_name_mappings[name]

        try:
            player = {
                'name': name,
                'target_price': int(line[2][1:])
            }
        except:
            continue

    elif args.filename == 'footballers':
        name_team_bye = line[0].split('(')
        if len(name_team_bye) > 1:
            bye = name_team_bye[1][:-1]
        else:
            bye = 0
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

    elif args.filename == 'footballers_consistency':
        name_team = line[0].split(',')
        name = name_team[0]

        player = {
            'name': name,
            'consistency': int(float(line[3]) * 100),
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

