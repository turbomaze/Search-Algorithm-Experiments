/******************\
|   Binary Search  |
| with Regression  |
| @author Anthony  |
| @version 0.1     |
| @date 2014/05/17 |
| @edit 2014/05/18 |
\******************/

/**********
 * config */
var dims = [800, 600];

/*************
 * constants */

/*********************
 * working variables */
var canvas;
var ctx;
var vals;
var colors;
var derivatives;
var smoothedDerivatives;

var goal;
var low;
var high;
var currentIdx;
var guesses;

/******************
 * work functions */
function initBinSearchRegression() {
    $s('#step-btn').addEventListener('click', function() {
        handleStep(true);
    });

    canvas = $s('#canvas');
    canvas.width = dims[0];
    canvas.height = dims[1];
    ctx = canvas.getContext('2d');
    
    setupVariables();
    
    updateCanvas();
}

function setupVariables() {
    //set up the values and their colors
    vals = [];
    colors = [];
    for (var ai = 0; ai < dims[0]; ai++) {
        vals.push(getRandInt(0, dims[1]));
        colors.push(getRandColor(0.8, 80, 240)); //random -> sorting isn't needed
    }
    vals.sort(function greater(a, b) { return a - b; });
    
    //compute the derivatives
    derivatives = [];
    for (var ai = 0; ai < dims[0]-1; ai++) {
        derivatives.push(vals[ai+1]-vals[ai]);
    }
    derivatives[dims[0]-1] = derivatives[dims[0]-2];

    //smooths the derivatives by averaging each value with its two neighbors
    smoothedDerivatives = [];
    for (var ai = 1; ai < dims[0]-1; ai++) {
        var smooth = (derivatives[ai-1]+derivatives[ai]+derivatives[ai+1])/3;
        smoothedDerivatives.push(smooth);
    }
    smoothedDerivatives[0] = smoothedDerivatives[1];
    smoothedDerivatives[dims[0]-1] = smoothedDerivatives[dims[0]-2];
    
    goal = vals[getRandInt(0, dims[1])]; //whatever the 693rd value is
    low = 0; //lower bound on the index
    high = dims[0]; //upper bound on the index
    currentIdx = -1; //no guess yet
    guesses = 0;
}

function handleStep(notify) {
    currentIdx = getNewIndex();
    if (notify) updateCanvas();

    var ret = -1;
    var maxGuesses = 50;
    if (vals[currentIdx] > goal) {
        high = currentIdx;
    } else if (vals[currentIdx] === goal || guesses > maxGuesses) {
        ret = guesses;
        if (notify) {
            var msg = 'Found in '+guesses+' guesses.';
            console.log(msg), alert(msg);
            updateCanvas();
        }
        setupVariables();
    } else {
        low = currentIdx;
    }
    
    return ret;
}

function getNewIndex() { //uses the global variables
    function chooseWithBinarySearch(l, h) {
        return (l+h)/2;
    }
    function chooseWithNewtonsMethod(l, h) {
        if (currentIdx < 0) return (l+h)/2;
        else {
            function f(g0) { return vals[g0] - goal; }
            function fp(g0) { return smoothedDerivatives[g0]; }
            var ret = currentIdx - f(currentIdx)/fp(currentIdx);
            ret = Math.max(Math.min(Math.round(ret), high), low);
            return ret;
        }
    }

    var choose = [chooseWithBinarySearch, chooseWithNewtonsMethod];
    var which = $s('#which').value;
    guesses++;
    return Math.floor(choose[which](low, high));
}

function updateCanvas() {
    clearCanvas();
    drawVals();
    drawCurrentGuess();
    drawGoalLine();
}

function drawVals() {
    for (var ai = 0; ai < vals.length; ai++) {
        drawPoint([ai, dims[1]-vals[ai]], 3, colors[ai]);
    }
}

function drawCurrentGuess() {
    if (currentIdx >= 0) {
        drawPoint(
            [currentIdx, dims[1]-vals[currentIdx]],
            8, 'rgba(255, 0, 0, 0.6)'
        );
    }
}

function drawGoalLine() {
    drawLine(
        [0, dims[1]-goal], [dims[0], dims[1]-goal],
        'rgba(255, 0, 0, 0.6)', 1, false
    );
}

function testSearchMethod(n) {
    var totalSteps = 0;
    var ai = n;
    while (ai > 0) {
        totalSteps += 1;
        var res = handleStep(false);
        if (res > -1) ai--;
    }
    return totalSteps/n; //average number of steps per search
}

/********************
 * helper functions */
function drawLine(start, end, color, thickness, dotted) {
    thickness = thickness || 3;
    dotted = dotted || false;
    ctx.strokeStyle = color || 'rgba(0, 0, 0, 1)';
    ctx.lineWidth = thickness;
    ctx.beginPath();
        if (dotted) ctx.setLineDash(dotted);
        else ctx.setLineDash([0]);
    ctx.moveTo(start[0], start[1]);
    ctx.lineTo(end[0], end[1]);
    ctx.closePath();
    ctx.stroke();
}

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

function getRandColor(opacity, low, high) {
    low = arguments.length < 2 ? 0 : low;
    high = arguments.length < 3 ? 256 : high;
    var r = getRandInt(low, high),
        g = getRandInt(low, high),
        b = getRandInt(low, high);
    return 'rgba('+r+', '+g+', '+b+', '+opacity+')';
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