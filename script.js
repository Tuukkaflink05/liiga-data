// global variables.
let playerdropdown = document.getElementById('players');
playerdropdown.addEventListener("change", () => {
    playerdataupdated(shotdf);
});

let teamdropdown = document.getElementById('teams');
teamdropdown.addEventListener('change', teamDataupdated);


const splash = document.querySelector('.splash')
window.addEventListener('PartLoaded', () => {

    console.log('part event loaded cathced');
    splash.classList.add('display-none')

});


const PartLoadedEvent = new Event('PartLoaded');

let shotdf;
let playerdf;
let layout;
let allgoals;
let allmisses;
let alluniqids;

async function loadData() {
    const playoffshotdata = await fetch('./json/playoffsshots2025-2025.json');
    const runkosarjashotdata = await fetch('./json/runkosarjashots2025-2025.json');
    const playerdata = await fetch('./json/players-nodup-2025-2025.json');
    const teamdata = await fetch('./json/teams-2025-2025.json')

    const rawplayoffdata = await playoffshotdata.json();
    const rawrunkosarjadata = await runkosarjashotdata.json();
    const rawplayerdata = await playerdata.json();
    const rawteamdata = await teamdata.json();

    const combinedrawdata = [...rawplayoffdata, ...rawrunkosarjadata];


    shotdf = new dfd.DataFrame(combinedrawdata);
    playerdf = new dfd.DataFrame(rawplayerdata);
    teamdf = new dfd.DataFrame(rawteamdata);

    SetTeamsDropdown(teamdf['internalId'].values, teamdf['teamName'].values);

    console.log(shotdf.shape);

    alluniqids = await shotdf['shooterId'].unique().values;

    SetplayerDropDown(alluniqids);

    allgoals = await shotdf.query(shotdf['eventType'].eq('GOAL'));

    allmisses = await shotdf.query(shotdf['eventType'].ne('GOAL'));

    let goalPlot = {
        x: allgoals['shotX'].values,
        y: allgoals['shotY'].values,
        mode: 'markers',
        marker: {
            size: 2,
            color: 'green',
        },
        type: 'scattergl',
        opacity: 0.6,
        name: 'Goal'
    };


    let missedPlot = {
        x: shotdf['shotX'].values,
        y: shotdf['shotY'].values,
        type: 'histogram2dcontour',
        colorscale: [
            [0, 'rgba(0,0,0,0)'],
            [0.5, 'rgba(255, 255,0,0.5)'],
            [1, 'rgba(255,0,0,1)']
        ],
        contours: {
        coloring: 'heatmap', // Fills the rings with solid color

        showlines: false // Hides the topographical borders for a smoother look
        },
        line: { width: 0 },
        ncontours: 20, // How smooth the gradient is
        opacity: 0.6,
        hoverinfo: 'none',
        showscale: false,

        name: 'Miss'
    };

    let plotdata = [goalPlot, missedPlot];


    layout = {
        xaxis: {
            showline: false,
            zeroline: true,
            range: [0, 1023.5], // Lock the camera so it doesn't auto-zoom!
            showgrid: false   // (Optional) Hides the background grid lines
        },
        yaxis: {
            showline: false,
            zeroline: false,
            range: [0, 513],  // Lock the camera!
            showgrid: false
        },

        images: [
            {
                source: 'pic/Rink-trans-sized.png',
                layer: 'below',
                xref: 'x',
                yref: 'y',
                xanchor: '50',    // Anchor the left edge of the image to X=0
                yanchor: 'bottom',  // Anchor the bottom edge of the image to Y=0
                sizex: 1023.5,        // Stretch to 1000 units wide
                sizey: 513,         // Stretch to 500 units tall
                sizing: 'stretch'   // Forces the image to fit these exact dimensions
            }
        ]
    };

    Plotly.newPlot('test', plotdata, layout, {responsive: true});

    window.dispatchEvent(PartLoadedEvent);
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
        if (name == null) {
            continue;
        }
        playerOption.textContent = name;
        playerdropdown.append(playerOption);
    };
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

async function SetTeamsDropdown(teamid, teamname) {

    console.log(teamid.length == teamname.length);
    for (i = 0; i < teamid.length; i++) {
        let teamOption = document.createElement('option');
        teamOption.value = teamid[i];
        teamOption.textContent = teamname[i];
        teamdropdown.append(teamOption);
    }
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
        return;
    }

    console.log('chosen player id:',  playerdropdown.value)
    //playerdf = await df.query(df['shooterId'].eq(parseInt(dropdown.value)));

    let madeShots = shotdf.query(shotdf['eventType'].eq('GOAL').and(shotdf['shooterId'].eq(parseInt(playerdropdown.value))));

    let allPlayerShots = shotdf.query(shotdf['shooterId'].eq(parseInt(playerdropdown.value)));

    UpdateGraph(madeShots, allPlayerShots);
}

function UpdateGraph(madeShots, allShots) {

    let goalPlot = {
        x: madeShots['shotX'].values,
        y: madeShots['shotY'].values,
        mode: 'markers',
        marker: {
            size: 3,
            color: 'green',
        },
        type: 'scattergl',
        name: 'Goal'
    };


    let missedPlot = {
        x: allShots['shotX'].values,
        y: allShots['shotY'].values,
        type: 'histogram2dcontour',
        colorscale: [
            [0, 'rgba(0,0,0,0)'],
            [0.5, 'rgba(255, 255,0,0.5)'],
            [1, 'rgba(255,0,0,1)']
        ],
        contours: {
        coloring: 'heatmap', // Fills the rings with solid color

        showlines: false // Hides the topographical borders for a smoother look
        },
        line: { width: 0 },
        ncontours: 20, // How smooth the gradient is
        opacity: 0.6,
        hoverinfo: 'none',
        showscale: false,

        name: 'Miss'
    };


    let plotdata = [goalPlot, missedPlot];

    Plotly.react('test', plotdata, layout);
}

async function teamDataupdated() {
    console.log('chosen team id: ', teamdropdown.value);

    if (parseInt(teamdropdown.value) == 0) {
        SetplayerDropDown(alluniqids);
        UpdateGraph(allgoals, allmisses);
        return;
    }

    let ids = await shotdf.query(shotdf['shootingTeamId'].eq(parseInt(teamdropdown.value)));

    ids = ids['shooterId'].unique().values

    console.log(ids);

    SetplayerDropDown(ids);

    let madeShots = shotdf.query(shotdf['eventType'].eq('GOAL').and(shotdf['shootingTeamId'].eq(parseInt(teamdropdown.value))));


    let allteamShots = shotdf.query(shotdf['shootingTeamId'].eq(parseInt(teamdropdown.value)));

    UpdateGraph(madeShots, allteamShots);

}

loadData();


//https://plotly.com/javascript/
/*
https://plotly.com/javascript/reference/

https://plotly.com/javascript/reference/layout/images/

https://plotly.com/javascript/images/

https://danfo.jsdata.org/  */