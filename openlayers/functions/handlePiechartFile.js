


// this file handles the dropped Pie Chart file, as well as the conversion to a real Javascript Object

//---------- Handle Pie Chart File ------------------------------------------------------>
function handlePiechartFile(evt) {
    evt.stopPropagation();
    evt.preventDefault();

    var files = evt.dataTransfer.files; // FileList object.

    if (typeof(dataVis.currentFiles.dataVis.PieChartData) !== "undefined") {
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
    dataVis.currentFiles.PieChart = f.name;

    PieChartJson = {};
    var reader = new FileReader(); // to read the FileList object
    reader.onload = function(event) { // Reader ist asynchron, wenn reader mit operation fertig ist, soll das hier (JSON.parse) ausgeführt werden, sonst ist es noch null
        var columnNames = [];
        if (f.name.substr(f.name.length - 3) === "csv") { // check if filetiype is csv
            dataVis.currentFiles.CoordsFileType = "csv";
            columnNames = getColumnNames(reader.result);
            window.csv = reader.result; // temporary save reader.result into global variable, until geoJSON can be created with user-inputs
        } else if (f.name.substr(f.name.length - 4) === "json") {
            dataVis.currentFiles.CoordsFileType = "JSON";
            PieChartJson = JSON.parse(reader.result);
            debugger
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
