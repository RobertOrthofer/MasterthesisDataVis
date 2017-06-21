
// this file handles the dropped DATA file, as well as the conversion from csv or JSON to a real Javascript Object

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


// ------------- handle File drop of Data-JSON -------------------------------------------------------------->
function handleDataFile(evt) {
    console.log("handleDataFile");
    evt.stopPropagation();
    evt.preventDefault();

    var files = evt.dataTransfer.files; // FileList object.

    if (typeof(dataVis.currentFiles.Data) !== "undefined") {
        var r = confirm("Override existing File?"); // ask User
        if (r == true) {
            console.log("Override File");
            // now clear all old options from Data-Selection
            dataVis.zaehlstellen_data = [];
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

    dataVis.currentFiles.Data = f.name;

    var reader = new FileReader(); // to read the FileList object
    reader.onload = function(event) { // Reader ist asynchron, wenn reader mit operation fertig ist, soll das hier (JSON.parse) ausgeführt werden, sonst ist es noch null
        if (f.name.substr(f.name.length - 3) === "csv") { // check if filetiype is csv
            dataVis.zaehlstellen_data = csvToJSON(reader.result);
        } else {
            dataVis.zaehlstellen_data = JSON.parse(reader.result); // global, better method?
            console.log(dataVis.zaehlstellen_data);
        }

        document.getElementById("renderDataButton").style.visibility = "visible";
        document.getElementById("hideDataSelection").style.visibility = "visible";
        document.getElementById("choseFieldDiv2").style.visibility = "visible";
        document.getElementById("hideSelectionHolder").style.visibility = "visible";

        askFields(dataVis.zaehlstellen_data[0], 2); // only first feature is needed for property names

        document.getElementById("renderDataButton").addEventListener('click', function() {
            applyDate();
        }, false);
    };
    reader.readAsText(f);

    // global variable for selection
    selectedWeekdays = [0, 1, 2, 3, 4, 5, 6]; // select all weekdays before timeslider gets initialized
    oldSelectedStreetNames = [] // Array for street names, if same amount of points are selected, but different streetnames -> redraw chart completely
    document.getElementById('list_data').innerHTML = '<ul>' + output.join('') + '</ul>';
}
