

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



//---------- Handle File Selection (Coordinates-JSON)------------------------------------------------------>
function handleCoordsFile(evt) {
    console.log("handleCoordsFile");
    evt.stopPropagation();
    evt.preventDefault();

    var files = evt.dataTransfer.files; // FileList object.
    console.log(files);
    console.log("type number of files: " + files.length );
    if((files.length > 1) || (files.length == 0)){ //check if too many files are dropped or if dropped object is no file at all (for instance text)
        alert("Please drop only a single file");
        return;
    }
    if (files[0]) {
        console.log("type of file: " + files[0].type);
        var allowedFileTypes = ["application/json","text/csv"]; // allowed File types
        var isAllowedFileType = (allowedFileTypes.indexOf(files[0].type) > -1); //check if dropped file Type is in array of allowed file types
        if (!isAllowedFileType){
            alert("Please make sure you drop files of the allowed type\n(your type: " + files[0].type + "). \n\n Allowed file types are JSON and CSV");
            return;
        }
    }

    if (typeof(mapoch.currentFiles.Coords) !== "undefined") {
        var r = confirm("Override existing File?"); // ask User
        if (r == true) {
            console.log("Override File");
            // now clear all old options from Coords- and Match-ID-Selection
            var select = document.getElementById("xSelect");
            var select2 = document.getElementById("coordIDSelect");
            var select3 = document.getElementById("ySelect");
            var length = select.options.length; // the 2 selects should have same options
            for (i = 0; i < length; i++) {
                select.options[0] = null;
                select2.options[0] = null;
                select3.options[0] = null;
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
    mapoch.currentFiles.Coords = f.name;

    coords_json = {};
    var reader = new FileReader(); // to read the FileList object
    reader.onload = function(event) { // Reader ist asynchron, wenn reader mit operation fertig ist, soll das hier (JSON.parse) ausgeführt werden, sonst ist es noch null
        var columnNames = [];
        if (f.name.substr(f.name.length - 3) === "csv") { // check if filetiype is csv
            mapoch.currentFiles.CoordsFileType = "csv";
            columnNames = getColumnNames(reader.result);
            window.csv = reader.result; // temporary save reader.result into global variable, until geoJSON can be created with user-inputs
            populateSelection(columnNames, 1);
        } else if (f.name.substr(f.name.length - 4) === "json") {
            mapoch.currentFiles.CoordsFileType = "JSON";
            coords_json = JSON.parse(reader.result);
            populateSelection(columnNames, 1);
        } else {
            alert("Unrecognized Filetype. Please Check your input (only .csv or .json allowed)");
        }

        document.getElementById("hideCoordSelection").style.visibility = "visible";
        document.getElementById("choseFieldDiv1").style.visibility = "visible";
        document.getElementById("renderCoordinatesButton").style.visibility = "visible";
        document.getElementById("hideSelectionHolder").style.visibility = "visible";

        document.getElementById("renderCoordinatesButton").addEventListener('click', function() {
            add_zaehlstellen(coords_json);  // conversion from csv to json in add_zaehlstellen
        }, false);
    };
    reader.readAsText(f, "UTF-8");

    document.getElementById('list_coords').innerHTML = '<ul style="margin: 0px;">' + output.join('') + '</ul>';
}
