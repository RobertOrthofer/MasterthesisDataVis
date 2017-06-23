


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
}


// adding Pie Charts to map, after Pie Chart Data was dropped (requires geometry layer first)
function addPieCharts(){

    // for each Object of the Pie Chart Data at the current time epoch, look into the geometry layer
    // for a feature with the name matching the keys of the pie chart data. create a pie chart at the centroid
    // of the polygon. Because MultiPolygon are possible (tyrol), scan for the largest polygon of each multipolygon,
    // and place the pie chart there

    // get the time slider value as integer, only works when same date
    var x = document.getElementById("time_slider").value;
    var thisDate = parseInt(x) + parseInt(step); // thisDate = integer of Timestep (e.g. 0 = first Date in Data)

    console.log(mapoch.PieChartData);
    for (i = 0; i < geometryLayer.getSource().getFeatures().length; i++) { // for every Point (zaehlstelle)...
        var pointExtent = geometryLayer.getSource().getFeatures()[i].getGeometry().getExtent();
        if (polygonGeometry.intersectsExtent(pointExtent) == true) { //returns true when Polygon intersects with Extent of Point (= Point itself)
            selectedFeatures.push(geometryLayer.getSource().getFeatures()[i]);
        }
    }
}
