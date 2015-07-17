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

    name_team = line[2].split('(')
    min_max = line[8].split('-')

    player = {
        'rank': line[1],
        'name': name_team[0][:-1],
        'team_name': name_team[1][:-1],
        'position': line[3],
        'position_rank': line[4].split()[0][1:],
        'risk': line[5],
        'fire_points': line[6],
        'fire_factor': line[7],
        'min_price': min_max[0][1:-1],
        'max_price': min_max[1][2:],
        'target_price': line[9][1:]
    }

    response = requests.post('http://localhost:9000/players', json=player)
    print(response.json)
