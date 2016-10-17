var DELAY = 1000; // delay in ms to add new data points
var BALANCE_INTERVAL = 5 * 1000;
var UPDATE_INTERVAL = 5 * 1000;
var TOTAL_MAX = 100;

var strategy = document.getElementById('strategy');

// create a graph2d with an (currently empty) dataset
var container = document.getElementById('visualization');
var dataset = new vis.DataSet();
var groups = new vis.DataSet();

for (i = 1; i <= 4; i++) {
    groups.add({
        id: i,
        content: "consumer" + i
    });
    groups.add({
        id: i + 4,
        content: "rate" + i,
        options: {
            excludeFromStacking: true
        }
    });
}

var options = {
    start: vis.moment().add(-30, 'seconds'), // changed so its faster
    end: vis.moment(),
    dataAxis: {
    left: {
        range: {
        min:0, max: 100
        }
    }
    },
    drawPoints: {
    style: 'circle' // square, circle
    },
    shaded: {
    orientation: 'bottom' // top, bottom
    },
    legend: true,
    stack: true
};
var graph2d = new vis.Graph2d(container, dataset, groups, options);

// a function to generate data points
// function y(x) {
//     return (Math.sin(x / 2) + Math.cos(x / 4)) * 5;
// }

function renderStep() {
    // move the window (you can think of different strategies).
    var now = vis.moment();
    var range = graph2d.getWindow();
    var interval = range.end - range.start;
    switch (strategy.value) {
    case 'continuous':
        // continuously move the window
        graph2d.setWindow(now - interval, now, {animation: false});
        requestAnimationFrame(renderStep);
        break;

    case 'discrete':
        graph2d.setWindow(now - interval, now, {animation: false});
        setTimeout(renderStep, DELAY);
        break;

    default: // 'static'
        // move the window 90% to the left when now is larger than the end of the window
        if (now > range.end) {
        graph2d.setWindow(now - 0.1 * interval, now + 0.9 * interval);
        }
        setTimeout(renderStep, DELAY);
        break;
    }
}
renderStep();

var maxRates = {
    'consumer1': 10,
    'consumer2': 50,
    'consumer3': 10,
    'consumer4': 30
};
var rateHistory = {
    'consumer1': [1.0, 1.0, 1.0],
    'consumer2': [0.2, 0.2, 0.2],
    'consumer3': [0.7, 0.5, 0.1],
    'consumer4': [0.1, 0.2, 0.5]
};

function balance() {
    var now = vis.moment();
    maxRates = calculate();
    console.log(maxRates);

    for (i = 1; i <= Object.keys(maxRates).length; ++i) {
        dataset.add({
            x: now,
            y: maxRates['consumer' + i],
            group: i
        });
        dataset.add({
            x: now,
            y: rateHistory['consumer' + i][0],
            group: i + 4
        });
    }

    // remove all data points which are no longer visible
    var range = graph2d.getWindow();
    var interval = range.end - range.start;
    var oldIds = dataset.getIds({
        filter: function (item) {
            return item.x < range.start - interval;
        }
    });
    dataset.remove(oldIds);

    setTimeout(balance, BALANCE_INTERVAL);
}
balance();

function calculate() {
    var newMaxRates = {};

    for (consumer in maxRates) {
        console.log(consumer);
        newMaxRates[consumer] = TOTAL_MAX / Object.keys(maxRates).length;
    }

    return newMaxRates;
}

function updateHistory() {
    for (i = 1; i <= Object.keys(rateHistory).length; ++i) {
        var currentRate = document.getElementById("consumer" + i + "rate").value;
        rateHistory['consumer' + i] = rateHistory['consumer' + i].slice(0, 2);
        rateHistory['consumer' + i].unshift(currentRate);
    }

    setTimeout(updateHistory, UPDATE_INTERVAL);
}
updateHistory();
