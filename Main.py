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
    path = 'players/stats/summed/2025/2025/runkosarja/true'

    r = requests.get(Baseurl + path, headers=headers)

    print(r.url)

    jsondata = r.json()

    with open(file, 'w') as f:
        json.dump(jsondata, f, indent=2)

