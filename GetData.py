import requests
import pandas as pd
import json
from tqdm import tqdm
import random
import time
from Main import files


Baseurl = 'https://liiga.fi/api/v2/'
headers = {'user-agent': 'Mozilla/5.0'}


def GetPlayerData():
    allData = []

    for i in range(len(files.matches)):

        path = f'players/stats/summed/{files.startSeason}/{files.endSeason}/{files.matches[i]}/true'

        r = requests.get(Baseurl + path, headers=headers)

        print(r.url)

        allData.extend(r.json())

    with open(files.playersFile, 'w') as f:
        json.dump(allData, f, indent=2)


GetPlayerData()

def GetGamesData():


    #save all of the data first before adding to a file
    allData = []

    for i in range(len(files.matches)):
        path = f'games?tournament={files.matches[i]}&season=2025'
        r = requests.get(Baseurl + path, headers=headers)
        print(r.url)

        jsondata = r.json()

        allData.extend(jsondata)


    with open(files.gamesFile, 'w') as f:
        json.dump(allData, f, indent=2)




def GetShotData():

    df = pd.read_json(files.gamesFile)

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

        time.sleep(wait_time)


    with open(files.runkosarjashotFile, 'w') as f:
        json.dump(alldata, f, indent=2)
