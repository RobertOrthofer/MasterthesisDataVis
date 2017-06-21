// insert data array, returns piechart as canvas object
function makePieChart(dataArray){
    //var canvas = document.getElementById("can");
    var canvas = document.createElement('canvas');

    //https://stackoverflow.com/questions/2588181/canvas-is-stretched-when-using-css-but-normal-with-width-height-properties
    // these are the canvas height and width attributes (default 150/300) NOT the css attributes. setting the css attribute dynamically before drawing the circle will create distortion
    canvas.setAttribute('width','100');
    canvas.setAttribute('height','100');
    var ctx = canvas.getContext("2d");
    var lastend = - Math.PI / 2; //quarter circle in radians so piechart starts north
    var myColor = ['red', 'green', 'blue', 'yellow', 'orange']; // Colors of each slice

    var myTotal = 0;
    dataArray.forEach(function(value){
        myTotal += value;
    });

    var centerX = canvas.width / 2;
    var centerY = canvas.height / 2;
    for (var i = 0; i < data.length; i++) {
        ctx.fillStyle = myColor[i];
        ctx.beginPath();
        ctx.moveTo(centerX, centerY);
        // Arc Parameters: x, y, radius, startingAngle (radians), endingAngle (radians), antiClockwise (boolean)
        ctx.arc(centerX, centerY, centerY, lastend, lastend + (Math.PI * 2 * (dataArray[i] / myTotal)), false);
        ctx.lineTo(centerX, centerY);
        ctx.fill();
        lastend += Math.PI * 2 * (data[i] / myTotal);
    };
    return(canvas);
}


// ------------- handle File drop of Pie Chart Data -------------------------------------------------------->
function handleFileSelect3(evt) {
    evt.stopPropagation();
    evt.preventDefault();

    var files = evt.dataTransfer.files; // FileList object.

    if (typeof(currentFiles.PieChartData) !== "undefined") {
        var r = confirm("Override existing File?"); // ask User
        if (r == true) {
            console.log("Override File");
            // now clear all old options from Data-Selection (not needed for PieCharts?)
            /*zaehlstellen_data = [];
            var select = document.getElementById("dateSelect");
            var length = select.options.length;
            for (i = 0; i < length; i++) {
                select.options[0] = null;
            }*/
        } else {
            console.log("Do nothing");
            return;
        }
    }

    // files is a FileList of File objects. List some properties.
    var output = [];
    var f = files[0];
    output.push('<li><strong>', escape(f.name), '</strong>  - ',
        f.size, ' bytes, last modified: ',
        f.lastModifiedDate ? f.lastModifiedDate.toLocaleDateString() : 'n/a', '</li>');

    currentFiles.PieChartData = f.name;

    var reader = new FileReader(); // to read the FileList object
    reader.onload = function(event) { // Reader ist asynchron, wenn reader mit operation fertig ist, soll das hier (JSON.parse) ausgeführt werden, sonst ist es noch null
        if (f.name.substr(f.name.length - 3) === "csv") { // check if filetiype is csv
            PieChartData = csvToJSON(reader.result);
        } else {
            zaehlstellen_data = JSON.parse(reader.result); // global, better method?
            console.log(zaehlstellen_data);
        }

        document.getElementById("renderDataButton").style.visibility = "visible";
        document.getElementById("hideDataSelection").style.visibility = "visible";
        document.getElementById("choseFieldDiv2").style.visibility = "visible";
        document.getElementById("hideSelectionHolder").style.visibility = "visible";

        askFields2(zaehlstellen_data[0], 2); // only first feature is needed for property names

        document.getElementById("renderDataButton").addEventListener('click', function() {
            applyDate();
        }, false);
    };
    reader.readAsText(f);

    // global variable for selection
    selectedWeekdays = [0, 1, 2, 3, 4, 5, 6]; // select all weekdays before timeslider gets initialized
    oldSelectedStreetNames = [] // Array for street names, if same amount of points are selected, but different streetnames -> redraw chart completely
    document.getElementById('list').innerHTML = '<ul>' + output.join('') + '</ul>';
}
