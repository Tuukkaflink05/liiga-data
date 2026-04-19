import requests
import pandas as pd
import json
import matplotlib as mpl
from matplotlib import pyplot as plt
import numpy as np

file = 'players.json'

def GetData():

    Baseurl = 'https://liiga.fi/api/v2/'
    headers = {'user-agent': 'Mozilla/5.0'}
    path = 'players/stats/summed/2020/2025/runkosarja/true'

    r = requests.get(Baseurl + path, headers=headers)

    print(r.url)

    jsondata = r.json()

    with open(file, 'w') as f:
        json.dump(jsondata, f, indent=2)

def TimeandGoals():

    df = pd.read_json(file)

    df = df[df['goalkeeper'] == False]

    t = df['timeOnIce'].to_numpy()
    g = df['goals'].to_numpy()

    plt.scatter(t, g)
    m,b = np.polyfit(t,g,1)
    plt.plot(t,m*g +b)
    plt.show()

TimeandGoals()
