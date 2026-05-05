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
            range: [0, 1023.5], // Lock the camera so it doesn't auto-zoom!
            showgrid: false   // (Optional) Hides the background grid lines
        },
        yaxis: {
            showline: false,
            zeroline: false,
            range: [0, 513],  // Lock the camera!
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

    Plotly.newPlot('test', plotdata, layout, {responsive: true, displayModeBar: false, staticPlot: true, displayNotifier: false, setBackground: 'black'});

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



var data = [
  {
    AboutDevTypeText: '<span>INITIALIZING DATA NEXUS...<br/>LOADING KERNEL_V.7.2.1... [OK]<br/>ESTABLISHING SECURE CONNECTION TO DATA LAKE... [OK]<br/>TYPING BULLSHIT... [OK]</span><br/><br/><span>SYSTEM CHECK: 4096 PETAFLOPS [OK]<br/>QUANTUM THREADING: ALIGNED<br/>VISUALIZATION ENGINE: ONLINE<br/>ANOMALY DETECTION: ACTIVE</span><br/><br/><span>----------------------------------------'
  }
];

var allElements = document.getElementsByClassName("typeing");
for (var j = 0; j < allElements.length; j++) {
  var currentElementId = allElements[j].id;
  var currentElementIdContent = data[0][currentElementId];
  var element = document.getElementById(currentElementId);
  var devTypeText = currentElementIdContent;

  // type code
  var i = 0, isTag, text;
  (function type() {
    text = devTypeText.slice(0, ++i);
    console.log(text);
    if (text === devTypeText) {
        splash.classList.add('display-none');
        return;
    };
    element.innerHTML = text;
    var char = text.slice(-1);
    if (char === "<") isTag = true;
    if (char === ">") isTag = false;
    if (isTag) return type();
    setTimeout(type,6.7);
  })();
}


let Viridis = [
    [0,                    'rgba(68, 1, 84, 0)'],
    [0.06274509803921569,  'rgba(72, 24, 106, 0.02)'],
    [0.12549019607843137,  'rgba(71, 45, 123, 0.05)'],
    [0.18823529411764706,  'rgba(66, 64, 134, 0.09)'],
    [0.25098039215686274,  'rgba(59, 82, 139, 0.14)'],
    [0.3137254901960784,   'rgba(51, 99, 141, 0.20)'],
    [0.3764705882352941,   'rgba(44, 114, 142, 0.27)'],
    [0.4392156862745098,   'rgba(38, 130, 142, 0.35)'],
    [0.5019607843137255,   'rgba(33, 145, 140, 0.43)'],
    [0.5647058823529412,   'rgba(31, 160, 136, 0.52)'],
    [0.6274509803921569,   'rgba(40, 174, 128, 0.61)'],
    [0.6901960784313725,   'rgba(63, 188, 115, 0.70)'],
    [0.7529411764705882,   'rgba(94, 201, 98, 0.78)'],
    [0.8156862745098039,   'rgba(132, 212, 75, 0.86)'],
    [0.8784313725490196,   'rgba(173, 220, 48, 0.92)'],
    [0.9411764705882353,   'rgba(216, 226, 25, 0.97)'],
    [1,                    'rgba(253, 231, 37, 1.0)'],
];