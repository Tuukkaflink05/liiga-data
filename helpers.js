export function unitToMeter(unit) {
    return ((unit / 1000) * 60).toFixed(1);
}

export function mirrorShots(xarr,yarr) {

    let newY = [];
    let newX = [];

    for (let i = 0; i < yarr.length; i++) {

        if (xarr[i] > 500) {
            newY.push(yarr[i]);
            newX.push(1000 - xarr[i]);
        } else {
            newY.push(500 - yarr[i]);
            newX.push(xarr[i]);
        }
    }
    return {x: newX, y: newY};
}

export function calculateMedian(arr) {

    arr.sort((a, b) => a - b);

    const length = arr.length;
    const middle = Math.floor(length / 2);

    // Check if the array length is even or odd
    if (length % 2 === 0) {

        // If even, return the average of middle two elements
        return (arr[middle - 1] + arr[middle]) / 2;
    } else {

        // If odd, return the middle element
        return arr[middle];
    }
}

export function calcDistances(shotx, shoty) {
    let alldistancesnum = 0;
    let alldistancesarr = [];

    for (let i = 0; i < shotx.length; i++) {

        if (shotx[i] <= 500) {
            let distance = Math.sqrt(Math.pow(60 - shotx[i], 2) + Math.pow(250 - shoty[i], 2));
            alldistancesnum += distance;
            alldistancesarr.push(distance);
        } else {
            let distance = Math.sqrt(Math.pow(940 - shotx[i], 2) + Math.pow(250 - shoty[i], 2));
            alldistancesnum += distance;
            alldistancesarr.push(distance);
        }
    }
    return {num: alldistancesnum, arr: alldistancesarr};
}

