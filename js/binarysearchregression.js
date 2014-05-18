/******************\
|   Binary Search  |
| with Regression  |
| @author Anthony  |
| @version 0.1     |
| @date 2014/05/17 |
| @edit 2014/05/17 |
\******************/

/**********
 * config */
var dim = [800, 600];

/*************
 * constants */

/*********************
 * working variables */
var canvas;
var ctx;
var vals;

var goal;
var low;
var high;
var currentIdx;
var guesses;

/******************
 * work functions */
function initBinSearchRegression() {
    canvas = $s('#canvas');
    canvas.width = dim[0];
    canvas.height = dim[1];
    ctx = canvas.getContext('2d');
    
    setupVariables();

    $s('#step-btn').addEventListener('click', function() {
        handleStep(true);
    });

    drawVals();
}

function setupVariables() {
    vals = [];
    for (var ai = 0; ai < dim[0]; ai++) {
        vals.push(getRandInt(0, dim[1]));
    }
    vals.sort(function greater(a, b) { return a - b; });
    
    goal = vals[getRandInt(0, dim[1])]; //whatever the 693rd value is
    low = 0; //lower bound on the index
    high = dim[0]; //upper bound on the index
    currentIdx = -1; //no guess yet
    guesses = 0;
}

function handleStep(notify) {
    currentIdx = getNewIndex();
    drawVals();
    var ret = -1;
    if (vals[currentIdx] > goal) high = currentIdx;
    else if (vals[currentIdx] === goal) {
        ret = guesses;
        var msg = 'Found in '+guesses+' guesses.';
        if (notify) console.log(msg), alert(msg);
        setupVariables();
        drawVals();
    } else low = currentIdx;

    return ret;
}

function getNewIndex() { //uses the global variables
    function choose(l, h) {
        
        return (l+h)/2;
    }

    guesses++;
    return Math.floor(choose(low, high));
}

function drawVals() {
    clearCanvas();
    for (var ai = 0; ai < vals.length; ai++) {
        drawPoint([ai, dim[1]-vals[ai]], 2);
    }
    drawCurrentGuess();
}

function drawCurrentGuess() {
    if (currentIdx < 0) return;
    drawPoint([currentIdx, dim[1]-vals[currentIdx]], 6, 'rgba(255, 0, 0, 0.9)');
}

/********************
 * helper functions */
function drawPoint(pos, r, color) {
    ctx.fillStyle = color || 'rgba(0, 0, 0, 0.3)';
    ctx.beginPath();
    ctx.arc(pos[0], pos[1], r, 0, 2*Math.PI, true);
    ctx.closePath();
    ctx.fill();
}

function clearCanvas() {
    ctx.fillStyle = '#FFFFFF';
    ctx.fillRect(0, 0, canvas.width, canvas.height);
}

function $s(id) { //for convenience
    if (id.charAt(0) !== '#') return false;
    return document.getElementById(id.substring(1));
}

function getRandInt(low, high) { //output is in [low, high)
    return Math.floor(low + 0.5*(Math.random()+Math.random())*(high-low));
}

function round(n, places) {
    var mult = Math.pow(10, places);
    return Math.round(mult*n)/mult;
}

/***********
 * objects */

window.addEventListener('load', initBinSearchRegression);