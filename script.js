async function loadData() {
    const data = await fetch('./json/playoffsshots2025-2025.json');
    const rawData = await data.json();

    df = new dfd.DataFrame(rawData);

    madeShots = await df.query(df['eventType'].eq('GOAL'));

    missedShots = await df.query(df['eventType'].ne('GOAL'));

    console.log(madeShots);


    var goalPlot = {
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


    var missedPlot = {
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

    var plotdata = [goalPlot, missedPlot];


    var layout = {
        xaxis: {
            showline: false,
            zeroline: false
        },
        yaxis: {
            showline: false,
            zeroline: false
        },
        images: [
            {
                source: 'pic/Rink-trans.png',
                sizex: 1,
                sizey: 1,
                sizing: 'fill',
                

            }
        ],
    }



    Plotly.newPlot('test', plotdata, layout, {responsive: true});

    const ctx = document.getElementById('myChart');



}



loadData();

