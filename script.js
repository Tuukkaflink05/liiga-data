// global variables.
let playerdropdown = document.getElementById('players');
playerdropdown.addEventListener("change", playerdataupdated);

let teamdropdown = document.getElementById('teams');
teamdropdown.addEventListener('change', teamDataupdated);


let shotdf;
let playerdf;
let layout;

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

    ids = await shotdf['shooterId'].unique().values;

    SetplayerDropDown(ids);


    let madeShots = await shotdf.query(shotdf['eventType'].eq('GOAL'));



    let missedShots = await shotdf.query(shotdf['eventType'].ne('GOAL'));

    let goalPlot = {
        x: madeShots['shotX'].values,
        y: madeShots['shotY'].values,
        mode: 'markers',
        marker: {
            size: 5,
            color: 'green',
        },
        type: 'scatter',
        name: 'Goal'
    };


    let missedPlot = {
        x: missedShots['shotX'].values,
        y: missedShots['shotY'].values,
        mode: 'markers',
        marker: {
            size: 2,
            color: 'red',
        },
        type: 'scatter',
        name: 'Miss'
    };

    let plotdata = [goalPlot, missedPlot];


    layout = {
        xaxis: {
            showline: false,
            zeroline: false,
            range: [0, 1000], // Lock the camera so it doesn't auto-zoom!
            showgrid: false   // (Optional) Hides the background grid lines
        },
        yaxis: {
            showline: false,
            zeroline: false,
            range: [0, 500],  // Lock the camera!
            showgrid: false
        },

        images: [
            {
                source: 'pic/Rink-trans-sized.png',
                layer: 'below',
                xref: 'x',
                yref: 'y',
                xanchor: 'left',    // Anchor the left edge of the image to X=0
                yanchor: 'bottom',  // Anchor the bottom edge of the image to Y=0
                sizex: 1000,        // Stretch to 1000 units wide
                sizey: 500,         // Stretch to 500 units tall
                sizing: 'stretch'   // Forces the image to fit these exact dimensions
            }
        ]
    };

    Plotly.newPlot('test', plotdata, layout, {responsive: true});

}


async function SetplayerDropDown(ids) {

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

async function SetTeamsDropdown(teamid, teamname) {

    console.log(teamid.length == teamname.length);
    for (i = 0; i < teamid.length; i++) {
        let teamOption = document.createElement('option');
        teamOption.value = teamid[i];
        teamOption.textContent = teamname[i];
        teamdropdown.append(teamOption);
    }

}

async function GetPlayerName(id) {
    let namedf = playerdf.query(playerdf['playerId'].eq(parseInt(id)));
    let fName = namedf['firstName'].values;
    if (fName.length == 0) {
        return;
    }
    let lName = namedf['lastName'].values;
    return(fName +  ' ' + lName);
}



async function playerdataupdated() {
    console.log('chosen player id:',  playerdropdown.value)
    //playerdf = await df.query(df['shooterId'].eq(parseInt(dropdown.value)));

    let madeShots = shotdf.query(shotdf['eventType'].eq('GOAL').and(shotdf['shooterId'].eq(parseInt(playerdropdown.value))));


    let missedShots = shotdf.query(shotdf['eventType'].ne('GOAL').and(shotdf['shooterId'].eq(parseInt(playerdropdown.value))));


    let goalPlot = {
        x: madeShots['shotX'].values,
        y: madeShots['shotY'].values,
        mode: 'markers',
        marker: {
            size: 3,
            color: 'green',
        },
        type: 'scatter',
        name: 'Goal'
    };


    let missedPlot = {
        x: missedShots['shotX'].values,
        y: missedShots['shotY'].values,
        mode: 'markers',
        marker: {
            size: 2,
            color: 'red',
        },
        type: 'scatter',
        name: 'Miss'
    };

    let plotdata = [goalPlot, missedPlot];

    Plotly.react('test', plotdata,layout);
}

async function teamDataupdated() {
    console.log('chosen team id: ', teamdropdown.value);
}

loadData();


//https://plotly.com/javascript/
/*
https://plotly.com/javascript/reference/

https://plotly.com/javascript/reference/layout/images/

https://plotly.com/javascript/images/

https://danfo.jsdata.org/  */