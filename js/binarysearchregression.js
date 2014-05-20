/******************\
|   Binary Search  |
| with Regression  |
| @author Anthony  |
| @version 0.2.1   |
| @date 2014/05/17 |
| @edit 2014/05/19 |
\******************/

/**********
 * config */
var dims = [800, 600];
var maxGuesses = 75; //very unlikely to reach 75

/*************
 * constants */

/*********************
 * working variables */
var canvas;
var ctx;
var vals;
var colors;

var goal;
var low;
var high;
var currentIdx;
var guesses;

//newton's method
var derivatives;
var smoothedDerivatives;

//string descent
var p1, p2;

/******************
 * work functions */
function initBinSearchRegression() {
    $s('#change-dist-btn').addEventListener('click', function() {
        setupVariables();
        updateCanvas();
    });

    $s('#step-btn').addEventListener('click', function() {
        handleStep(true);
    });

    canvas = $s('#canvas');
    canvas.width = dims[0];
    canvas.height = dims[1];
    $s('#canvas-container').style.width = dims[0]+'px';
    ctx = canvas.getContext('2d');
    
    setupVariables(); //variables that need to be set again and again
    updateCanvas();
}

function setupVariables() {
    //decide what the distribution function is
    var distributionFunction = [
        function() { return dims[1]*Math.random(); }, //random float
        function() { //normal random float
            var r = Math.random;
            return dims[1]*(r()+r()+r())/3;
        },
    ][$s('#dist-type').value];

    //set up the values and their colors
    vals = [], colors = [];
    for (var ai = 0; ai < dims[0]; ai++) {
        vals.push(distributionFunction());
        colors.push(getRandColor(0.8, 20, 256)); //random -> sorting isn't needed
    }
    vals.sort(function greater(a, b) { return a - b; });
    
    //compute the derivatives
    derivatives = [];
    for (var ai = 0; ai < dims[0]-1; ai++) {
        derivatives.push(vals[ai+1]-vals[ai]);
    }
    derivatives[dims[0]-1] = derivatives[dims[0]-2];

    //smooths the derivatives by averaging each value with two neighbors
    var neighborDist = 7;
    smoothedDerivatives = [];
    for (var ai = 0; ai < dims[0]; ai++) {
        var rightIdx = Math.min(ai+neighborDist, dims[0]-1);
        var leftIdx = Math.max(ai-neighborDist, 0);
        var smooth = (vals[rightIdx]-vals[leftIdx])/(2*neighborDist);
        smoothedDerivatives.push(smooth);
    }

    //initial p1, p2
    p1 = 0, p2 = dims[0];
    
    //assign the rest of the variables
    goal = vals[getRandInt(0, dims[0])];
    low = 0; //lower bound on the index (inclusive)
    high = dims[0]-1; //upper bound on the index (inclusive)
    currentIdx = -1; //no guess yet
    guesses = 0;
}

function handleStep(notify) {
    currentIdx = getNewIndex();
    if (notify) updateCanvas();

    var ret = -1;
    if (vals[currentIdx] === goal || guesses > maxGuesses) {
        if (notify) {
            var msg = 'Found in '+guesses+' guesses.';
            console.log(msg), alert(msg);
            updateCanvas();
        }
        ret = guesses;
        setupVariables();
    } else if (vals[currentIdx] > goal) {
        high = currentIdx-1;
    } else {
        low = currentIdx+1;
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
    function chooseWithStringDescent(l, h) {
        var gvvl = goal/vals[vals.length-1];
        if (currentIdx < 0) {
            return Math.round(gvvl*(p2-p1));
        } else {
            if (vals[currentIdx] > goal) {
                p2 = Math.min(currentIdx, p2-1);
            } else {
                p1 = Math.max(currentIdx, p1+1);
            }
            
            return Math.round(p1+gvvl*(p2-p1));
        }
    }
    function chooseWithNewtonsString(l, h) {
        if (currentIdx < 0) return chooseWithStringDescent(l, h);
        else return chooseWithNewtonsMethod(l, h);
    }

    var choose = [
        chooseWithBinarySearch, chooseWithNewtonsMethod,
        chooseWithStringDescent, chooseWithNewtonsString
    ];
    var which = $s('#which').value;
    guesses++;
    return Math.floor(choose[which](low, high));
}

function updateCanvas() {
    clearCanvas();
    drawVals(); //the dots
    drawWalls(); //grey out the areas no longer in the search space
    drawCurrentGuess(); //red dot representing the current guess
    drawGoalLine(); //red line intersecting the list at the goal point
}

function drawVals() {
    for (var ai = 0; ai < vals.length; ai++) {
        drawPoint([ai, dims[1]-vals[ai]], 3, colors[ai]);
    }
}

function drawWalls() {
    if (low >= 0 && high <= dims[0]) {
        ctx.fillStyle = 'rgba(0, 0, 0, 0.1)';
        ctx.fillRect(0, 0, low, canvas.height);
        ctx.fillRect(high+1, 0, dims[0], canvas.height);
    }
}

function drawCurrentGuess() {
    if (currentIdx >= 0) {
        var loc = [currentIdx, dims[1]-vals[currentIdx]];
        drawPoint(loc, 8, 'rgba(255, 0, 0, 0.6)');
    }
}

function drawGoalLine() {
    drawLine(
        [0, dims[1]-goal], [dims[0], dims[1]-goal],
        'rgba(255, 0, 0, 0.6)', 1, false
    );
}

function testSearchMethod(n) {
    setupVariables(); //equal start, shouldn't be included in the time
    
    var s = +new Date();
    var totalSteps = 0, ai = n;
    while (ai > 0) {
        var res = handleStep(false);
        if (res > -1) {
            totalSteps += res
            ai--;
        }
    }

    //average number of steps per search and the time
    return [totalSteps/n, (+new Date()-s)+'ms']; 
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
    return Math.floor(low + Math.random()*(high-low));
}

function getNormalRandInt(low, high) { //output is in [low, high)
    var normalRandom = Math.random()+Math.random()+Math.random();
    return Math.floor(low + normalRandom*(high-low)/3);
}

function round(n, places) {
    var mult = Math.pow(10, places);
    return Math.round(mult*n)/mult;
}

/***********
 * objects */

window.addEventListener('load', initBinSearchRegression);