import argparse
import csv
import json
import requests

parser = argparse.ArgumentParser()

parser.add_argument("-f", "--filename", help="File to parse")

args = parser.parse_args()
print(args.filename)

file = open(args.filename, 'r')

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
            # 'position': position,
            # 'position_rank': ''.join([i for i in line[3] if i.isdigit()]),
            'target_price': target_price,
            # 'bye': bye
        }

    elif args.filename == 'ffa':
        player = {
            'adp': round(float(line[11])) if line[11] != 'null' else None,
            'rank': round(float(line[8])) if line[8] != 'null' else None,
            'name': line[1] if line[1] != 'null' else None,
            'team_name': line[3]if line[3] != 'null' else 'FA',
            'position': line[2] if line[2] != 'null' else None,
            'position_rank': line[9] if line[9] != 'null' else None,
            'target_price': round(float(line[13])) if line[13] != 'null' else None,
            'dropoff': round(float(line[10])) if line[10] != 'null' else None,
            'risk': round(float(line[16])) if line[16] != 'null' else None,
            'points': round(float(line[5])) if line[5] != 'null' else None
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

    response = requests.post('http://localhost:9000/players', json=player)
    print(response.json)

