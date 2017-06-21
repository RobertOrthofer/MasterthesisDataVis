

// helper function to convert .csv to geoJSON
function csvToGeoJSON() { //csv = reader.result
    var lines = csv.split(/[\r\n]+/); // split for windows and mac csv (newline or carriage return)
    delete window.csv; // reader.result from drag&drop not needed anymore
    var headers = lines[0].split(","); //not needed?
    var matchID = document.getElementById("coordIDSelect").value;
    var xColumn = document.getElementById("xSelect").value;
    var yColumn = document.getElementById("ySelect").value;

    // get the positions of the seleted columns in the header
    var positionMatchID = headers.indexOf(matchID);
    var positionX = headers.indexOf(xColumn);
    var positionY = headers.indexOf(yColumn);

    var obj_array = []
    for (var i = 1; i < lines.length - 1; i++) {
        var json_obj = {
            "type": "Feature"
        };
        var currentline = lines[i].split(",");
        //for(var j=0;j<headers.length;j++){
        json_obj["geometry"] = {
            "type": "Point",
            "coordinates": [parseFloat(currentline[positionX]), parseFloat(currentline[positionY])]
        };
        json_obj["properties"] = {};
        json_obj["properties"][matchID] = currentline[positionMatchID]; // get the name of zaehlstellen variable
        obj_array.push(json_obj);
    };

    var complete_geojson = {
            "type": "FeatureCollection",
            "features": obj_array // all objects of the csv
        }
        //	alert(complete_geojson);
    return complete_geojson; //return geoJSON
}



// ------------- handle File drop of Data-JSON -------------------------------------------------------------->
function handleCoordsFile(evt) {
    evt.stopPropagation();
    evt.preventDefault();

    var files = evt.dataTransfer.files; // FileList object.

    if (typeof(currentFiles.Data) !== "undefined") {
        var r = confirm("Override existing File?"); // ask User
        if (r == true) {
            console.log("Override File");
            // now clear all old options from Data-Selection
            zaehlstellen_data = [];
            var select = document.getElementById("dateSelect");
            var length = select.options.length;
            for (i = 0; i < length; i++) {
                select.options[0] = null;
            }
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

    currentFiles.Data = f.name;

    var reader = new FileReader(); // to read the FileList object
    reader.onload = function(event) { // Reader ist asynchron, wenn reader mit operation fertig ist, soll das hier (JSON.parse) ausgeführt werden, sonst ist es noch null
        if (f.name.substr(f.name.length - 3) === "csv") { // check if filetiype is csv
            zaehlstellen_data = csvToJSON(reader.result);
        } else {
            zaehlstellen_data = JSON.parse(reader.result); // global, better method?
            console.log(zaehlstellen_data);
        }

        document.getElementById("renderDataButton").style.visibility = "visible";
        document.getElementById("hideDataSelection").style.visibility = "visible";
        document.getElementById("choseFieldDiv2").style.visibility = "visible";
        document.getElementById("hideSelectionHolder").style.visibility = "visible";

        populateSelection(zaehlstellen_data[0], 2); // only first feature is needed for property names

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
