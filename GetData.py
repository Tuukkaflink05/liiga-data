import requests
import pandas as pd
import json
from tqdm import tqdm
import random
import time



file = 'players.json'
gamesFile = 'games.json'
shotFile = 'shots.json'

Baseurl = 'https://liiga.fi/api/v2/'
headers = {'user-agent': 'Mozilla/5.0'}


def GetPlayerData():

    path = 'players/stats/summed/2020/2025/runkosarja/true'

    r = requests.get(Baseurl + path, headers=headers)

    print(r.url)

    jsondata = r.json()

    with open(file, 'w') as f:
        json.dump(jsondata, f, indent=2)

##runkosarja + playoffs

def GetGamesData():
    match = ['playoffs']

    #save all of the data first before adding to a file
    allData = []

    for i in range(len(match)):
        path = f'games?tournament={match[i]}&season=2025'
        r = requests.get(Baseurl + path, headers=headers)
        print(r.url)

        jsondata = r.json()

        allData.extend(jsondata)


    with open(gamesFile, 'w') as f:
        json.dump(allData, f, indent=2)


def GetShotData():

    df = pd.read_json(gamesFile)

    idlist = []

    idlist = df['id'].to_list()

    alldata = []

    for i in tqdm(range(len(idlist))):
        path = f'shotmap/2025/{idlist[i]}'

        print(f"fetching shotdata for game: {idlist[i]}")

        r = requests.get(Baseurl + path, headers=headers)
        jsondata = r.json()
        alldata.extend(jsondata)

        wait_time = random.uniform(2.0, 4.0)
        print(f'waiting for: {wait_time}')

        time.sleep(wait_time)


    with open(shotFile, 'w') as f:
        json.dump(alldata, f, indent=2)
