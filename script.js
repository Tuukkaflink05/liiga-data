let dropdown = document.getElementById('players');

let df;
let layout;

async function loadData() {
    const data = await fetch('./json/playoffsshots2025-2025.json');
    const rawData = await data.json();

    df = new dfd.DataFrame(rawData);

    ids = await df['shooterId'].unique().values;

    SetDropDown(ids);


    let madeShots = await df.query(df['eventType'].eq('GOAL'));



    let missedShots = await df.query(df['eventType'].ne('GOAL'));

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


function SetDropDown(ids) {
    ids.forEach(element => {
        let playerOption = document.createElement('option');
        playerOption.value = element;
        playerOption.textContent = element;
        dropdown.append(playerOption);
    });
}

dropdown.addEventListener("change", dataupdated);

async function dataupdated() {
    console.log(parseInt(dropdown.value))



    //playerdf = await df.query(df['shooterId'].eq(parseInt(dropdown.value)));

    let madeShots = df.query(df['eventType'].eq('GOAL').and(df['shooterId'].eq(parseInt(dropdown.value))));


    let missedShots = df.query(df['eventType'].ne('GOAL').and(df['shooterId'].eq(parseInt(dropdown.value))));


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

loadData();


//https://plotly.com/javascript/
/*
https://plotly.com/javascript/reference/

https://plotly.com/javascript/reference/layout/images/

https://plotly.com/javascript/images/

https://danfo.jsdata.org/  */