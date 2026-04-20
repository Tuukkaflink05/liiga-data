import requests
import pandas as pd
import json
import matplotlib as mpl
from matplotlib import pyplot as plt
import numpy as np

file = 'players.json'

def GetPlayerData():

    Baseurl = 'https://liiga.fi/api/v2/'
    headers = {'user-agent': 'Mozilla/5.0'}
    path = 'players/stats/summed/2020/2025/runkosarja/true'

    r = requests.get(Baseurl + path, headers=headers)

    print(r.url)

    jsondata = r.json()

    with open(file, 'w') as f:
        json.dump(jsondata, f, indent=2)

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

TimeandGoals()
