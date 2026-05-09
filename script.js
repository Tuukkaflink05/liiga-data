import {unitToMeter, mirrorShots, calculateMedian, calcDistances} from './helpers.js';
import {Viridis} from './config.js';

// global variables.
const playerdropdown = document.getElementById('players');
playerdropdown.addEventListener("change", () => {
    playerdataupdated(shotdf);
});

const teamdropdown = document.getElementById('teams');
teamdropdown.addEventListener('change', teamDataupdated);

//team info
const teaminfolist = document.getElementById('team-info-list');

//player info
const playerinfolist = document.getElementById('player-info-list');

const splash = document.querySelector('.splash')


let shotdf;
let playerdf;
let teamdf;
let velocitydf;
let layout;
let allgoals;
let allmisses;
let alluniqplayerids;
let alluniqteamids;

loadData();

//only from runkosarja
async function loadData() {
   // const playoffshotdata = await fetch('./json/playoffsshots2025-2025.json');
    const runkosarjashotdata = await fetch('./json/runkosarjashots2025-2025.json');
    const playerdata = await fetch('./json/runkosarjaplayers2025-2025.json');
    const teamdata = await fetch('./json/teams-2025-2025.json')

    //const rawplayoffdata = await playoffshotdata.json();
    const rawrunkosarjadata = await runkosarjashotdata.json();
    const rawplayerdata = await playerdata.json();
    const rawteamdata = await teamdata.json();

    //const combinedrawdata = [...rawplayoffdata, ...rawrunkosarjadata];


    shotdf = new dfd.DataFrame(rawrunkosarjadata);
    playerdf = new dfd.DataFrame(rawplayerdata);
    teamdf = new dfd.DataFrame(rawteamdata);

    //mirror shots to one side
    let mirrored = mirrorShots(shotdf['shotX'].values, shotdf['shotY'].values);

    shotdf.addColumn('shotY', mirrored.y, {inplace: true});
    shotdf.addColumn('shotX', mirrored.x, {inplace: true});

    alluniqteamids = await teamdf['internalId'].unique().values;

    SetTeamsDropdown(alluniqteamids);


    alluniqplayerids = await shotdf['shooterId'].unique().values;


    SetplayerDropDown(alluniqplayerids);

    allgoals = await shotdf.query(shotdf['eventType'].eq('GOAL'));

    allmisses = await shotdf.query(shotdf['eventType'].ne('GOAL'));

    // TODO: better way to get the hardest shot and corresponding id
  /*  velocitydf = playerdf.loc({columns: ['playerId', 'hardestShotVelocity','teamId']});
    velocitydf.sortValues('hardestShotVelocity', {inplace: true, ascending: false});
    let hardestshotplayerid = velocitydf.iat(0,0);
    let playername = await GetPlayerName(hardestshotplayerid);
    let hardestshotvelo = velocitydf.iat(0,1);
*/
    // goal on left x:60 y:250
    // goal on right x:940 y:250

    //calculate distance from both points depending if x is less than or more than 500

    UpdateInfoText(shotdf, allgoals);

    let goalPlot = {
        x: allgoals['shotX'].values,
        y: allgoals['shotY'].values,
        mode: 'markers',
        marker: {
            size: 3,
            color: 'rgb(0,255,0)',
        },
        type: 'scattergl',
        opacity: 0.7,
        name: 'Goal'
    };


    let missedPlot = {
        x: shotdf['shotX'].values,
        y: shotdf['shotY'].values,
        type: 'histogram2dcontour',
        colorscale: Viridis,
        contours: {
        coloring: 'heatmap', // Fills the rings with solid color

        showlines: false // Hides the topographical borders for a smoother look
        },
        line: { width: 0 },
        ncontours: 20, // How smooth the gradient is
        opacity: 0.9,
        hoverinfo: 'none',
        showscale: false,

        name: 'Miss'
    };

    let plotdata = [goalPlot, missedPlot];


    layout = {
        xaxis: {
            showline: false,
            zeroline: true,
            range: [0, 500], // Lock the camera so it doesn't auto-zoom!
            showgrid: false   // (Optional) Hides the background grid lines
        },
        yaxis: {
            showline: false,
            zeroline: false,
            range: [0, 500],  // Lock the camera!
            showgrid: false
        },

        paper_bgcolor: 'transparent',
        plot_bgcolor: 'transparent',

        margin: {
            b:0, //bottom
            l:0, //left
            r:0, //right
            t:0 //top
        },

        scattergap: 1,
        scattermode: 'group',

        images: [
            {
                source: 'pic/Rink-half-sized.png',
                layer: 'below',
                xref: 'x',
                yref: 'y',
                xanchor: '0',    // Anchor the left edge of the image to X=0
                yanchor: 'bottom',  // Anchor the bottom edge of the image to Y=0
                sizex: 500,        // Stretch to 1000 units wide
                sizey: 500,         // Stretch to 500 units tall
                sizing: 'stretch'   // Forces the image to fit these exact dimensions
            }
        ]
    };

    Plotly.newPlot('test', plotdata, layout, {responsive: true, displayModeBar: false, staticPlot: true, displayNotifier: false, setBackground: 'black'});

    splash.classList.add('display-none');
}


async function SetplayerDropDown(ids) {

    playerdropdown.innerHTML = null;
    let firstOption = document.createElement('option');
    firstOption.value = 0;
    firstOption.textContent = 'choose a player';
    playerdropdown.append(firstOption);

   for (const element of ids) {
        let playerOption = document.createElement('option');
        playerOption.value = element;
        let name = await GetPlayerName(element);
        playerOption.textContent = name;
        playerdropdown.append(playerOption);
    };
}

async function SetTeamsDropdown(ids) {

    teamdropdown.innerHTML = null;
    let firstOption = document.createElement('option');
    firstOption.value = 0;
    firstOption.textContent = 'choose a Team';
    teamdropdown.append(firstOption);

   for (const element of ids) {
        let teamOption = document.createElement('option');
        teamOption.value = element;
        let name = await GetTeamName(element);
        if (name == null) {
            continue;
        }
        teamOption.textContent = name;
        teamdropdown.append(teamOption);
    };
}

async function playerdataupdated(shotdf) {

    if (parseInt(playerdropdown.value) == 0) {
        if (parseInt(teamdropdown.value) == 0) {
            teamDataupdated();
            return;
        }

        let madeShots = shotdf.query(shotdf['eventType'].eq('GOAL').and(shotdf['shootingTeamId'].eq(parseInt(teamdropdown.value))));
        let allteamShots = shotdf.query(shotdf['shootingTeamId'].eq(parseInt(teamdropdown.value)));
        UpdateGraph(madeShots, allteamShots);
        UpdateInfoText(allteamShots, madeShots);
        return;
    }

    console.log('chosen player id:',  playerdropdown.value)
    //playerdf = await df.query(df['shooterId'].eq(parseInt(dropdown.value)));

    let madeShots = shotdf.query(shotdf['eventType'].eq('GOAL').and(shotdf['shooterId'].eq(parseInt(playerdropdown.value))));

    let allPlayerShots = shotdf.query(shotdf['shooterId'].eq(parseInt(playerdropdown.value)));

    UpdateGraph(madeShots, allPlayerShots);

    UpdateInfoText(allPlayerShots, madeShots,parseInt(playerdropdown.value));
}

function UpdateGraph(madeShots, allShots) {

    let goalPlot = {
        x: madeShots['shotX'].values,
        y: madeShots['shotY'].values,
        mode: 'markers',
        marker: {
            size: 3,
            color: 'rgb(0,255,0)',
            opacity: 0.8,
        },
        type: 'scattergl',
        name: 'Goal'
    };


    let missedPlot = {
        x: allShots['shotX'].values,
        y: allShots['shotY'].values,
        type: 'histogram2dcontour',
        colorscale: Viridis,
        contours: {
        coloring: 'heatmap', // Fills the rings with solid color

        showlines: false // Hides the topographical borders for a smoother look
        },
        line: { width: 0 },
        ncontours: 20, // How smooth the gradient is
        opacity: 0.8,
        hoverinfo: 'none',
        showscale: false,

        name: 'Miss'
    };

    let plotdata = [goalPlot, missedPlot];

    Plotly.react('test', plotdata, layout);
}

    // goal on left x:60 y:250
    // goal on right x:940 y:250


function UpdateInfoText(shotdf, goaldf, playerid) {
    teaminfolist.innerHTML = null;
    playerinfolist.innerHTML = null;
    let shotnum = shotdf.shape[0];
    let goalnum = goaldf.shape[0];

    let shotx = shotdf['shotX'].values;
    let shoty = shotdf['shotY'].values;

    let allshotdistances = calcDistances(shotx, shoty);
    let meanshotdist = (allshotdistances.num / shotx.length);
    meanshotdist = unitToMeter(meanshotdist);


    let goalx = goaldf['shotX'].values;
    let goaly = goaldf['shotY'].values;

    let allgoaldistances = calcDistances(goalx, goaly);
    let meangoaldist = (allgoaldistances.num / goalx.length);
    meangoaldist = unitToMeter(meangoaldist);


    let medianshotdist = unitToMeter(calculateMedian(allshotdistances.arr));
    let mediangoaldist = unitToMeter(calculateMedian(allgoaldistances.arr));


    console.log('mean goal distance ', meangoaldist);
    console.log('mean shot distance ', meanshotdist);

    console.log('median shot distance ', medianshotdist);
    console.log('median goal distance ', mediangoaldist);

    console.log('all shots taken ', shotnum);
    console.log('all goals ', goalnum);

    let percGoals = (goalnum / shotnum) * 100;
    percGoals = percGoals.toFixed(1);

    let teaminfo = [`All shots taken: ${shotnum}`,
                    `Goals: ${goalnum}`,
                    `success procentage: ${percGoals}%`,
                    `Mean shot distance: ${meanshotdist} M`,
                    `Median shot distance: ${medianshotdist} M`,
                    `Mean Goal distance: ${meangoaldist} M`,
                    `Median Goal distance: ${mediangoaldist} M`
                ];

    for (const item of teaminfo) {
        const lielement = document.createElement('li');
        lielement.textContent = item;
        teaminfolist.appendChild(lielement);
    }

    if (playerid == null) {
        const lielement = document.createElement('li');
        lielement.textContent = 'choose a player to see info';
        playerinfolist.appendChild(lielement);
        return;
    }

    let currentplayerdf = playerdf.query(playerdf['playerId'].eq(playerid));


    let veloc = currentplayerdf['hardestShotVelocity'].values;
    let topSpeed = currentplayerdf['topSpeed'].values;
    let games = currentplayerdf['playedGames'].values;
    let role = currentplayerdf['role'].values
    let nationality = currentplayerdf['nationality'].values;
    let timeOnIceAvg = currentplayerdf['timeOnIceAvg'].values;
    let shifts = currentplayerdf['shifts'].values;
    let shiftsPerGame = currentplayerdf['countOnIceAvg'].values;
    let shitftTimeAvg = (timeOnIceAvg / shiftsPerGame);
    let distancePerMatch = currentplayerdf['distancePerMatch'].values;
    let evenStrengthPassPercentage = currentplayerdf['evenStrengthPassPercentage'].values;
    let powerplayPassPercentage = currentplayerdf['powerplayPassPercentage'].values;
    let expectedGoals = currentplayerdf['expectedGoals'].values;
    let pdo = currentplayerdf['pdo'].values



    let playerinfo = [`hardest shot: ${Math.round(veloc * 3.6)} KM/H`,
                        `top Speed: ${(topSpeed * 3.6).toFixed(1)} KM/H`,
                        `Games Played: ${games}`,
                        `Role: ${role}`,
                        `Nationality: ${nationality}`,
                        `average Time on ice per game: ${Math.round(timeOnIceAvg / 60)} Minutes`,
                        `average shifts per game: ${shiftsPerGame}`,
                        `average shift time: ${shitftTimeAvg.toFixed(1)} Seconds`,
                        `average distance per match: ${(distancePerMatch / 1000).toFixed(2)} KM`,
                        `Goals above Expected: ${(goalnum - expectedGoals).toFixed(1)}`,
                        `pdo: ${pdo}`,
                        `Pass percentage on even strength: ${evenStrengthPassPercentage}%`,
                        `Pass percentage on power play: ${powerplayPassPercentage}%`,
    ];

    for (const item of playerinfo) {
        const lielement = document.createElement('li');
        lielement.textContent = item;
        playerinfolist.appendChild(lielement);
    }

}

async function teamDataupdated() {
    console.log('chosen team id: ', teamdropdown.value);

    if (parseInt(teamdropdown.value) == 0) {
        SetplayerDropDown(alluniqplayerids);
        UpdateGraph(allgoals, shotdf);
        UpdateInfoText(shotdf, allgoals);
        return;
    }

    let ids = await shotdf.query(shotdf['shootingTeamId'].eq(parseInt(teamdropdown.value)));


    let uniqids = ids['shooterId'].unique().values

    console.log(uniqids);

    SetplayerDropDown(uniqids);

    let madeShots = shotdf.query(shotdf['eventType'].eq('GOAL').and(shotdf['shootingTeamId'].eq(parseInt(teamdropdown.value))));


    let allteamShots = shotdf.query(shotdf['shootingTeamId'].eq(parseInt(teamdropdown.value)));

    UpdateGraph(madeShots, allteamShots);
    UpdateInfoText(allteamShots, madeShots);

}

async function GetTeamName(id) {

    let namedf = teamdf.query(teamdf['internalId'].eq(parseInt(id)));

    let name = namedf['teamName'].values;
    return name
}

async function GetPlayerName(id) {
    let namedf = playerdf.query(playerdf['playerId'].eq(parseInt(id)));
    let fName = namedf['firstName'].values;
    if (fName.length == 0) {
        return;
    }
    let lName = namedf['lastName'].values;
    let num = namedf['jersey'].values;
    let team = namedf['teamName'].values;
    return(`${fName} ${lName} #${num} (${team})`);
}




//https://plotly.com/javascript/
/*
https://plotly.com/javascript/reference/

https://plotly.com/javascript/reference/layout/images/

https://plotly.com/javascript/images/

https://danfo.jsdata.org/  */
