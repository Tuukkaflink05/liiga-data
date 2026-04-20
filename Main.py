import requests
import pandas as pd
import json
import matplotlib as mpl
from matplotlib import pyplot as plt
import numpy as np
from tqdm import tqdm
import random
import time
import statistics as st

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

    for i in tqdm(range(len(idlist)))   :
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

def Shotsandok():
    df = pd.read_json(shotFile)

    ##look at misses
    misses = ['GOALIE_BLOCKED', 'PLAYER_BLOCKED', 'MISSED']

    missedShots = df[(df['eventType'].isin(misses))]

    x = missedShots['shotX'].to_numpy()
    y = missedShots['shotY'].to_numpy()
    plt.scatter(x,y, s=0.5, c='red', alpha=0.5)


    #look at goals
    madeShots = df[(df['eventType'] == 'GOAL')]

    x = madeShots['shotX'].to_numpy()
    y = madeShots['shotY'].to_numpy()
    plt.scatter(x,y, s=5, c='green')

    plt.show()







Shotsandok()

def TimeandGoals():

    forward_roles = ['VL', 'OL', 'KH', 'H']

    df = pd.read_json(file)

    df = df[(df['goalkeeper'] == False)]

    t = df['timeOnIce'].to_numpy()
    g = df['goals'].to_numpy()

    # divide t by 60 to get minutes instead of seconds
    t = t / 60

    plt.scatter(t, g, c='blue')

    m,b = np.polyfit(t,g,1)
    plt.plot(t,m*t +b, c ='red', linewidth='2', linestyle='--')

    plt.title("Time on ice vs. goals scored")
    plt.xlabel("Time on ice (minutes)")
    plt.ylabel("goals scored")

    plt.grid(True, linestyle=':')
    plt.show()
