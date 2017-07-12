


// this file handles the dropped Pie Chart file, as well as the conversion to a real Javascript Object

//---------- Handle Pie Chart File ------------------------------------------------------>
// handles the dropped Pie Chart Data File (only JSON at the moment), parses it, and puts it into global
// variable mapoch.PieChartData
function handlePiechartFile(evt) {
    evt.stopPropagation();
    evt.preventDefault();

    var files = evt.dataTransfer.files; // FileList object.

    //check if current Object is empty (no file dropped yet)
    if (Object.keys(mapoch.PieChartData).length !== 0) {
        var r = confirm("Override existing File?"); // ask User
        if (r == true) {
            console.log("Override File");
            // TO DO: Create selections
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
    mapoch.currentFiles.PieChart = f.name;

    var reader = new FileReader(); // to read the FileList object
    reader.onload = function(event) { // Reader ist asynchron, wenn reader mit operation fertig ist, soll das hier (JSON.parse) ausgeführt werden, sonst ist es noch null
        var columnNames = [];
        if (f.name.substr(f.name.length - 3) === "csv") { // check if filetiype is csv
            mapoch.currentFiles.CoordsFileType = "csv";
            columnNames = getColumnNames(reader.result);
            console.log("Pie Chart Data doesn't support CSV yet");
            window.csv = reader.result; // temporary save reader.result into global variable, until geoJSON can be created with user-inputs
        } else if (f.name.substr(f.name.length - 4) === "json") {
            mapoch.currentFiles.CoordsFileType = "JSON";
            mapoch.PieChartData = JSON.parse(reader.result);
            makeDateObjectsPieChart();
            addPieCharts();
        } else {
            alert("Unrecognized Filetype. Please Check your input (only .csv or .json allowed)");
        }

        /*document.getElementById("hideCoordSelection").style.visibility = "visible";
        document.getElementById("choseFieldDiv1").style.visibility = "visible";
        document.getElementById("renderCoordinatesButton").style.visibility = "visible";
        document.getElementById("hideSelectionHolder").style.visibility = "visible";*/

        /*document.getElementById("renderCoordinatesButton").addEventListener('click', function() {
            add_zaehlstellen(coords_json);
        }, false);*/
        //console.log('added Event Listener to apply button');
        //add_zaehlstellen(coords_json);
    };
    reader.readAsText(f, "UTF-8");

    document.getElementById('list_piechart').innerHTML = '<ul style="margin: 0px;">' + output.join('') + '</ul>';
    addPieCharts();
}

// helper function to convert dates in piechartdata into real javascript date objects
function makeDateObjectsPieChart() {
    for (i = 0; i < mapoch.PieChartData.length; i++) {
        var datestring = mapoch.PieChartData[i][selectedOptions.dateField];
        console.log(datestring);
        var thisYear = parseInt(datestring.substring(0, 4));
        var thisMonth = parseInt(datestring.substring(5, 7));
        var thisDay = parseInt(datestring.substring(8, 10));
        var thisDateComplete = new Date(thisYear, thisMonth - 1, thisDay); // JS-Date Month begins at 0
        mapoch.PieChartData[i][selectedOptions.dateField] = thisDateComplete;
    }
}


// adding Pie Charts to map, after Pie Chart Data was dropped (requires geometry layer first)
function addPieCharts(){

    // for each Object of the Pie Chart Data at the current time epoch, look into the geometry layer
    // for a feature with the name matching the keys of the pie chart data. create a pie chart at the centroid
    // of the polygon. Because MultiPolygon are possible (tyrol), scan for the largest polygon of each multipolygon,
    // and place the pie chart there



    console.log(mapoch.PieChartData);

    // get the time slider value as integer
    var thisDateInteger = document.getElementById("time_slider").value;
    // look up date in zaehlstellen_data corresponding to timeslider-value
    // to compare 2 dates, date.getTime() is required
    var thisDate = mapoch.zaehlstellen_data[thisDateInteger][selectedOptions.dateField].getTime();
    var correctEpochElement = {};
    mapoch.PieChartData.some(function(element){
        if(element[selectedOptions.dateField].getTime() == thisDate){
            console.log("found element with correct date");
            correctEpochElement = element;
        }
        else{
            console.log("not correct element");
        }
    })
    console.log(correctEpochElement);

    // for each key in the current element, which is not the date, make a pie chart
    // (keys are names to match by, e.g. county names)
    for (var key in mapoch.zaehlstellen_data[thisDateInteger]) {
        if (key == selectedOptions.dateField){
            continue
        }
        else{
            console.log(correctEpochElement[key]);

            // if not done already, map the attributes to colors, so even if the order is changed,
            // the colors will always be the same for the same attribut, in every Pie chart
            if(Object.keys(mapoch.PieChartColorMap).length === 0 && mapoch.PieChartColorMap.constructor === Object){
                mapColors(correctEpochElement[key]);
            }

            //createPieChart(correctEpochElement[key]);
            mapoch.PieChartCanvasElements[key] = createPieChart(correctEpochElement[key]);
        }
    };
    addChartsToMap(); // look for center of geometries and place pie charts there
}

//create a single pie chart from data Object
//returns pie chart as canvas element
function createPieChart(dataObject){
    console.log("creating pie chart element for: " + "asdasd");
    var canvas = document.createElement('canvas');

    //https://stackoverflow.com/questions/2588181/canvas-is-stretched-when-using-css-but-normal-with-width-height-properties
    // these are the canvas height and width attributes (default 150/300) NOT the css attributes. setting the css attribute dynamically before drawing the circle will create distortion
    canvas.setAttribute('width','100');
    canvas.setAttribute('height','100');
    var ctx = canvas.getContext("2d");
    var lastend = - Math.PI / 2; //quarter circle in radians so piechart starts north

    // calculate total sum of values
    var myTotal = 0;
    for (var key in dataObject) {
        myTotal += dataObject[key];
    };

    var centerX = canvas.width / 2;
    var centerY = canvas.height / 2;

    // get the key sorted by their values for the current object
    var sortedValuesKeys = sortValues(dataObject);

    for (var i = 0; i < sortedValuesKeys.length; i++) {
        console.log("i= " + i);
        ctx.fillStyle = mapoch.PieChartColorMap[sortedValuesKeys[i]]; // look up the color for the current key
        ctx.beginPath();
        ctx.moveTo(centerX, centerY);
        console.log("last end: " + lastend);
        // Arc Parameters: x, y, radius, startingAngle (radians), endingAngle (radians), antiClockwise (boolean)
        ctx.arc(centerX, centerY, centerY, lastend, lastend + (Math.PI * 2 * (dataObject[sortedValuesKeys[i]] / myTotal)), false);
        ctx.lineTo(centerX, centerY);
        ctx.fill();
        lastend += Math.PI * 2 * (dataObject[sortedValuesKeys[i]] / myTotal);
    };
    //document.body.append(canvas);
    return(canvas);
}

// function to add all pie charts to the correspinding features in the map
function addChartsToMap(){
    // iterate of all keys of mapoch.PieChartCanvasElements (==matchID)
    var mapFeatures = map.getLayers().getArray()[2].getSource().getFeatures();
    console.log(mapFeatures);
    //create empty array to store all ol.features
    var mapFeatureArray = [];

    Object.keys(mapoch.PieChartCanvasElements).forEach(function(key){  // for each key (=matchID),,,
        var length = mapFeatures.length;
        for(i=0; i<mapFeatures.length; i++){  // look for the corresponding geometry...
            if(mapFeatures[i].get("name") === key){
                console.log ("i: "+ i + "  " + mapFeatures[i].get("name") + "===" + key);
                var matchedFeature = mapFeatures[i];
                var centerPoint;
                if(matchedFeature.getGeometry().getType() === "Polygon"){
                    centerPoint = matchedFeature.getGeometry().getInteriorPoint();
                }
                else if (matchedFeature.getGeometry().getType() === "MultiPolygon") { // if MultiPolygon, get interor point of largest polygon
                    var allPolygons = matchedFeature.getGeometry().getPolygons();
                    var largestPolygon;
                    var largestPolygonArea = 0;
                    allPolygons.forEach(function(thisPolygon){
                        var thisArea = thisPolygon.getArea();
                        if (thisArea > largestPolygonArea){
                            largestPolygon = thisPolygon;
                            largestPolygonArea = thisArea;
                        };
                        centerPoint = largestPolygon.getInteriorPoint();
                    })
                }
                else{
                    console.log("geometryType " + matchedFeature.getGeometry().getType() + "not yet supported");
                }
                console.log(centerPoint);
                // TO DO: HTMLCanvasElement for ol.style.Icon
                //create a ol.feature as Point
                var iconFeature = new ol.Feature({
                    geometry: centerPoint,
                    name: 'pieChart'+key
                });
                //create canvas element as style
                var iconStyle = new ol.style.Style({
                    image: new ol.style.Icon(({
                        anchor: [50, 50],
                        anchorXUnits: 'pixels',
                        anchorYUnits: 'pixels',
                        img: mapoch.PieChartCanvasElements[key],
                        imgSize: [100, 100]
                    }))
                });
                iconFeature.setStyle(iconStyle);
                mapFeatureArray.push(iconFeature);
            }
        }
    })
    // if successful, create new vector layer and show the pie charts on the map
    if(mapFeatureArray.length > 0){
        var vectorSource = new ol.source.Vector({
            features: mapFeatureArray
        });

        var vectorLayer = new ol.layer.Vector({
            source: vectorSource,
            name: "chartLayer"
        });

        map.addLayer(vectorLayer);
    }

}


// Sort the data descending, so that the biggest slice of the Piechart is starting north,
// second highest is second, etc.
// insert unsorted objects
// returns sorted array of keys, sorted by value (highest value come first)
function sortValues(list){
    //var list = {"attr1": 111, "attr2": 64, "attr3": 51, "attr4": 77, "attr5": 10};
    // compare here:
    //https://www.w3schools.com/jsref/jsref_sort.asp
    keysSorted = Object.keys(list).sort(function(a,b){return list[b]-list[a]})
    return(keysSorted);
}

// helper function to map the attributes to colors
function mapColors(PieChartDataElement){
    console.log(PieChartDataElement);
    var PieChartColors = ['red', 'green', 'blue', 'yellow', 'orange', 'purple']; // Colors of each slice of the Pie Chart
    var i = 0;
    for (var key in PieChartDataElement) {
        mapoch.PieChartColorMap[key] = PieChartColors[i++];
    }
}
