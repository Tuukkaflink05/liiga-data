import pandas as pd
from matplotlib import pyplot as plt
import numpy as np
import seaborn as sns




class files:
    startSeason = 2025
    endSeason = 2025

    matches = ['runkosarja', 'playoffs']

    playersFile = f'json/players-{startSeason}-{endSeason}.json'
    gamesFile = f'json/runkosarjagames{startSeason}-{endSeason}.json'
    runkosarjashotFile = f'json/{matches[0]}shots{startSeason}-{endSeason}.json'
    playoffsshotfile = f'json/{matches[1]}shots{startSeason}-{endSeason}.json'
    nodupplayers = f'json/players-nodup-{startSeason}-{endSeason}.json'
    teamsFile = f'json/teams-{startSeason}-{endSeason}.json'



#6138 shots
#5819 did not go in
#319 goals

# over the 2025 season playoffs
#65 games

# 5% of shot are a goal on average

# 94 shots a match on average

#5 goals a match on averag


def ShotsOnRink():
    df = pd.read_json(files.runkosarjashotFile)

    df = pd.concat([df, pd.read_json(files.playoffsshotfile)], ignore_index=True)



    #only get data from one player

    df = df[(df['shooterId'] == 40056206)]

    print(df)


    plt.figure(figsize=(5,5))
    plt.axis('off')

    ##look at misses
    misses = ['GOALIE_BLOCKED', 'PLAYER_BLOCKED', 'MISSED']

    missedShots = df[(df['eventType'].isin(misses))]



    x = missedShots['shotX'].to_numpy()
    ##mirror the shots to one side
    x = np.where(x > 500, 1000 - x, x)


    y = missedShots['shotY'].to_numpy()
    y = np.where(x > 500, 500 - y, y)


    plt.scatter(x,y, s=0.5, c='red', alpha=0.3)


    #look at goals
    madeShots = df[(df['eventType'] == 'GOAL')]

    x = madeShots['shotX'].to_numpy()
    y = madeShots['shotY'].to_numpy()

    x = np.where(x > 500, 1000 - x, x)
    y = np.where(x > 500, 500 - y, y)


    plt.scatter(x,y, s=0.5, c='green', alpha=1)

    rinkImg = plt.imread('pic/Rink-half.png')
    plt.imshow(rinkImg, extent=[0,500,0,500])

    plt.show()



##does time on ice increase goals
def TimeandGoals():

    forward_roles = ['VL', 'OL', 'KH', 'H']

    df = pd.read_json(files.playersFile)

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
