
// this file handles the dropped DATA file, as well as the conversion from csv or JSON to real a Javascript Object

// helper function to get column names from csv
function getColumnNames(csv) {
    var lines = csv.split(/[\r\n]+/);
    return lines[0].split(","); //returns array with column names
}


// helper function to convert data (.csv) to JSON
function csvToJSON(csv) { //csv = reader.result
    var lines = csv.split(/[\r\n]+/);
    //var result = [];
    var headers = lines[0].split(",");

    //calculate headers.length and lines.length one time only for performance reasons
    var linesLength = lines.length; // = number of zaehlstellen
    var headerLength = headers.length; // = number of dates the data is provided

    var splittedLinesArray = []; // split all the lines in advance, so they dont have to be split for every single value
    for (var k = 1; k < linesLength; k++) {
        var thisLine = lines[k].split(",");

        if (thisLine == "") { // if-clause, because csv could have empty lines at the end
            break;
        }

        splittedLinesArray.push(thisLine);
    }

    var obj_array = [];
    var dateName = headers[0];

    for (var i = 1; i < headerLength; i++) { // for every date, last one is empty (because csv has )
        var json_obj = {};
        json_obj[dateName] = headers[i]; // headers is dates (top row of csv)
        for (var j = 0; j < splittedLinesArray.length; j++) { // for every zaehlstelle...
            //console.log("j:  " + j);
            var currentZaehlstelle = splittedLinesArray[j][0]; // takes name of current zaehlstelle (very left column of csv)
            var currentValue = splittedLinesArray[j][i];
            json_obj[currentZaehlstelle] = parseInt(currentValue);
        }
        obj_array.push(json_obj);
    };
    return obj_array; //return data-JSON
}



//---------- Handle File Selection (Coordinates-JSON)------------------------------------------------------>
function handleDataFile(evt) {
    evt.stopPropagation();
    evt.preventDefault();

    var files = evt.dataTransfer.files; // FileList object.

    if (typeof(currentFiles.Coords) !== "undefined") {
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
    currentFiles.Coords = f.name;

    coords_json = {};
    var reader = new FileReader(); // to read the FileList object
    reader.onload = function(event) { // Reader ist asynchron, wenn reader mit operation fertig ist, soll das hier (JSON.parse) ausgeführt werden, sonst ist es noch null
        var columnNames = [];
        if (f.name.substr(f.name.length - 3) === "csv") { // check if filetiype is csv
            currentFiles.CoordsFileType = "csv";
            columnNames = getColumnNames(reader.result);
            window.csv = reader.result; // temporary save reader.result into global variable, until geoJSON can be created with user-inputs
            populateSelection(columnNames, 1);
        } else if (f.name.substr(f.name.length - 4) === "json") {
            currentFiles.CoordsFileType = "JSON";
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
            add_zaehlstellen(coords_json);
        }, false);
        //console.log('added Event Listener to apply button');
        //add_zaehlstellen(coords_json);
    };
    reader.readAsText(f, "UTF-8");

    document.getElementById('list_coords').innerHTML = '<ul style="margin: 0px;">' + output.join('') + '</ul>';
}
