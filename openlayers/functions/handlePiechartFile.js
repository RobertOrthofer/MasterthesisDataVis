


// this file handles the dropped Pie Chart file, as well as the conversion to a real Javascript Object

//---------- Handle Pie Chart File ------------------------------------------------------>
// handles the dropped Pie Chart Data File (only JSON at the moment), parses it, and puts it into global
// variable mapoch.PieChartData
function handlePiechartFile(evt) {
    evt.stopPropagation();
    evt.preventDefault();

    var files = evt.dataTransfer.files; // FileList object.

    console.log(files);
    console.log("type number of files: " + files.length );
    if((files.length > 1) || (files.length == 0)){ //check if too many files are dropped or if dropped object is no file at all (for instance text)
        alert("Please drop only a single file");
        return;
    }
    var file = files[0];

    if (file) {
        console.log("type of file: " + file.type);
        if (file.type !== "application/json" && file.name.substr(file.name.length - 4) !== "json") {
            alert("Please make sure you drop files of the allowed type\n(your type: " + files[0].type + "). \n\n Allowed file types are JSON and CSV");
            return;
        }
    }

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

    output.push('<li><strong>', escape(file.name), '</strong>  - ',
        file.size, ' bytes, last modified: ',
        file.lastModifiedDate ? file.lastModifiedDate.toLocaleDateString() : 'n/a', '</li>');
    mapoch.currentFiles.PieChart = file.name;

    var reader = new FileReader(); // to read the FileList object
    reader.onload = function(event) { // Reader ist asynchron, wenn reader mit operation fertig ist, soll das hier (JSON.parse) ausgeführt werden, sonst ist es noch null
        var columnNames = [];
        if (file.name.substr(file.name.length - 3) === "csv") { // check if filetiype is csv
            mapoch.currentFiles.CoordsFileType = "csv";
            columnNames = getColumnNames(reader.result);
            console.log("Pie Chart Data doesn't support CSV yet");
            window.csv = reader.result; // temporary save reader.result into global variable, until geoJSON can be created with user-inputs
        } else if (file.name.substr(file.name.length - 4) === "json") {
            mapoch.currentFiles.CoordsFileType = "JSON";
            mapoch.PieChartData = JSON.parse(reader.result);
            makeDateObjectsPieChart();
            addPieCharts();
        } else {
            alert("Unrecognized Filetype. Please Check your input (only .csv or .json allowed)");
        }
    };
    reader.readAsText(file, "UTF-8");

    document.getElementById('list_piechart').innerHTML = '<ul style="margin: 0px;">' + output.join('') + '</ul>';
    addPieCharts();
}

// helper function to convert dates in piechartdata into real javascript date objects
function makeDateObjectsPieChart() {
    for (i = 0; i < mapoch.PieChartData.length; i++) {
        var datestring = mapoch.PieChartData[i][mapoch.selectedOptions.dateField];
        console.log(datestring);
        var thisYear = parseInt(datestring.substring(0, 4));
        var thisMonth = parseInt(datestring.substring(5, 7));
        var thisDay = parseInt(datestring.substring(8, 10));
        var thisDateComplete = new Date(thisYear, thisMonth - 1, thisDay); // JS-Date Month begins at 0
        mapoch.PieChartData[i][mapoch.selectedOptions.dateField] = thisDateComplete;
    }
}


// adding Pie Charts to map, after Pie Chart Data was dropped (requires geometry layer first)
function addPieCharts(){

    // for each Object of the Pie Chart Data at the current time epoch, look into the geometry layer
    // for a feature with the name matching the keys of the pie chart data. create a pie chart at the centroid
    // of the polygon. Because MultiPolygon are possible (tyrol), scan for the largest polygon of each multipolygon,
    // and place the pie chart there



    //console.log(mapoch.PieChartData);
    //if there is no PieChartData, step out
    if(Object.keys(mapoch.PieChartData).length === 0 && mapoch.PieChartData.constructor === Object){
        //console.log("no pie chart data available");
        return;
    }

    //if there are already pie charts on the map, delete the piechart layer
    if(getLayerByName('chartLayer')){
        console.log("delete chartLayer");
        var chartLayer = getLayerByName('chartLayer');
        map.removeLayer(chartLayer);
    }

    // get the time slider value as integer
    var thisDateInteger = document.getElementById("time_slider").value;
    // look up date in zaehlstellen_data corresponding to timeslider-value
    // to compare 2 dates, date.getTime() is required
    var thisDate = mapoch.zaehlstellen_data[thisDateInteger][mapoch.selectedOptions.dateField].getTime();
    var correctEpochElement = {};
    mapoch.PieChartData.some(function(element){
        if(element[mapoch.selectedOptions.dateField].getTime() == thisDate){
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
        if (key == mapoch.selectedOptions.dateField){
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
    console.log("creating pie chart element");
    var canvas = document.createElement('canvas');

    //https://stackoverflow.com/questions/2588181/canvas-is-stretched-when-using-css-but-normal-with-width-height-properties
    // these are the canvas height and width attributes (default 150/300) NOT the css attributes. setting the css attribute dynamically before drawing the circle will create distortion
    canvas.setAttribute('width','115');
    canvas.setAttribute('height','115');
    var ctx = canvas.getContext("2d");
    var lastend = - Math.PI / 2; //quarter circle in radians so piechart starts north

    // calculate total sum of values
    var myTotal = 0;
    for (var key in dataObject) {
        myTotal += dataObject[key];
    };

    // hardcoded center, canvas is larger because of shadow
    var centerX = 50;
    var centerY = 50;

    //draw a dropshadow so the charts are "floating" above the map
    ctx.save(); // save style of context, so that drop shadow is not applied on every single element
    ctx.shadowColor = "#555555";
    ctx.shadowBlur = 20;
    ctx.shadowOffsetX = 5;
    ctx.shadowOffsetY = 5;
    ctx.fillStyle = "white";
    ctx.beginPath();
    ctx.arc(centerX, centerY, centerY,0,2*Math.PI);
    ctx.closePath();
    ctx.fill();
    // restore the saved canvas state
    ctx.restore();

    // get the key sorted by their values for the current object
    var sortedValuesKeys = sortValues(dataObject);

    for (var i = 0; i < sortedValuesKeys.length; i++) {
        ctx.fillStyle = mapoch.PieChartColorMap[sortedValuesKeys[i]]; // look up the color for the current key
        ctx.beginPath();
        ctx.moveTo(centerX, centerY);
        console.log("last end: " + lastend);
        // Arc Parameters: x, y, radius, startingAngle (radians), endingAngle (radians), antiClockwise (boolean)
        ctx.arc(centerX, centerY, centerY, lastend, lastend + (Math.PI * 2 * (dataObject[sortedValuesKeys[i]] / myTotal)), false);
        ctx.lineTo(centerX, centerY);
        ctx.fill();
        //make a thin line between every segment (performance?)
        ctx.moveTo(centerX, centerY);
        ctx.lineWidth="1";
        ctx.strokeStyle="#3c3c3c";
        ctx.lineTo(centerX + 50 * Math.cos(lastend), centerY + 50 * Math.sin(lastend));
        ctx.stroke();
        //update last end
        lastend += Math.PI * 2 * (dataObject[sortedValuesKeys[i]] / myTotal);
    };
    //when done, create a 360′ arc as a border
    ctx.beginPath();
    ctx.lineWidth="2";
    ctx.strokeStyle="#3c3c3c";
    ctx.arc(centerX, centerY, centerY-1,0,2*Math.PI);
    ctx.stroke();

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
                        imgSize: [115, 115]
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
    //colors taken from this artikle:
    //http://www.mulinblog.com/a-color-palette-optimized-for-data-visualization/
    //original source: Stephen Few’s book, Show Me the Numbers
    //http://castor.tugraz.at/F/7YY47NQH8A3D2HS8PTK3TV54XXB8VSJ879XKKUQHKYTD2VKUAF-63076?func=item-global&doc_library=TUG01&doc_number=000508124&year=&volume=&sub_library=
    // gray is lighter to enable black labels
    var PieChartColors = ['#676767', '#5DA5DA', '#FAA43A', '#60BD68', '#F17CB0', '#B2912F','#B276B2','#DECF3F','#F15854']; // Colors of each slice of the Pie Chart
    var i = 0;
    for (var key in PieChartDataElement) {
        mapoch.PieChartColorMap[key] = PieChartColors[i++];
    }
    //now that the colors are fixed, create the legend
    createPieChartLegend();
}

//create a single labeled pie chart as the legend
function createPieChartLegend(){
    //
	var lastend = -Math.PI/2;
	//var pieColor = ["#ECD078","#D95B43","#C02942","#542437","#53777A"];
	//var pieData = [10,30,20,60,40];
    var labels = Object.keys(mapoch.PieChartColorMap);
    // calculate equaly sized slizes
    var sliceSize = (2*Math.PI) / labels.length;

	var canvas = document.createElement('canvas');
    canvas.setAttribute('width','180');
    canvas.setAttribute('height','180');
	var ctx = canvas.getContext("2d");

	ctx.clearRect(0, 0, canvas.width, canvas.height);

	var centerX = ctx.canvas.width/2;
	var centerY = ctx.canvas.height/2;
    var pieChartRadius = 48;
	var labelRadius = pieChartRadius/0.9; //radius for label placement

    // create border first, so that the shadow of the labels work properly
    ctx.beginPath();
    ctx.lineWidth="2";
    ctx.strokeStyle="#3c3c3c";
    ctx.arc(centerX, centerY, pieChartRadius+1,0,2*Math.PI);
    ctx.stroke();

	labels.forEach(function(currentLabel){
        console.log("current Label: " + currentLabel);
		ctx.fillStyle = mapoch.PieChartColorMap[currentLabel];
        console.log("fill style: " + ctx.fillStyle);
		ctx.beginPath();
		ctx.moveTo(centerX,centerY);
		ctx.arc(centerX,centerY,pieChartRadius,lastend,lastend+sliceSize,false);

		ctx.lineTo(centerX,centerY);
		ctx.fill();

        // line between segments
        //make a thin line between every segment (performance?)
        ctx.moveTo(centerX, centerY);
        ctx.lineWidth="1";
        ctx.strokeStyle="#3c3c3c";
        ctx.lineTo(centerX + pieChartRadius * Math.cos(lastend), centerY + pieChartRadius * Math.sin(lastend));
        ctx.stroke();

		//Labels on pie slices (fully transparent circle within outer pie circle, to get middle of pie slice)
        ctx.save();
        var endAngle = lastend + sliceSize;
		var setX = centerX + Math.cos(endAngle-sliceSize/2) * labelRadius;
		var setY = centerY + Math.sin(endAngle-sliceSize/2) * labelRadius;
		ctx.fillStyle = "#000000";
        //ctx.shadowColor = "white";
        //ctx.shadowOffsetX = 0;
        //ctx.shadowOffsetY = 0;
        //ctx.shadowBlur = 8;
		ctx.font = 'bold 16px Verdana';
        ctx.textAlign="center";
        ctx.lineWidth = 4;
        ctx.strokeStyle = "#ffffff";
        ctx.globalAlpha = 0.3; // make outline of text a little transparent
        ctx.strokeText(currentLabel, setX, setY); // make outline before filled text, because the stroke is on inside and outside.
        //inside stroke will be covered by text
        ctx.globalAlpha = 1; // make text non-transparent
        ctx.fillText(currentLabel,setX,setY);
        ctx.restore();

		lastend += sliceSize;
    });

    var legendContainer = document.getElementById("size_legend");
    legendContainer.innerHTML = "";
    legendContainer.append(canvas);
    legendContainer.style.display = "table-cell"; // was "none" because polygon has no circle-size-legend
    legendContainer.style.verticalAlign = 'top' // for some reason doesn't work in css-sheet
}
