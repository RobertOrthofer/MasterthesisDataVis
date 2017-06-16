// this file handles all DOM Events, like hiding and showing Menues


//------------hiding or showing the drop zones, very top-right button------------------------------------------------
function hideDropZone(){
    console.log("hide/show Drop Zones ");
    // get the real computed height of the drop-zone-div, then translate the drop-zone-div and the div below ()
    var dropZonesHeight = document.getElementById("drop_zone_holder").offsetHeight;
    console.log("offsetHeight: "+dropZonesHeight);
    // calculating direction of div (up or down)
    if (document.getElementById("hideDropZone").innerHTML == "▲") {
        console.log("hide Drop Zones");
        document.getElementById("hideDropZone").innerHTML = "▼";
        document.getElementById('drop_zone_holder').style.transform = "translateY(-"+ dropZonesHeight +"px)";
        document.getElementById('menuBelowDropZones').style.transform = "translateY(-"+ dropZonesHeight +"px)";
        //document.getElementById("menuBelowSelection").style.transform = "translateY(-60px)";
    } else {
        console.log("show Drop Zones");
        document.getElementById("hideDropZone").innerHTML = "▲";
        //document.getElementById('drop_zone_holder').style.transform = "translateY(0)";
        document.getElementById('drop_zone_holder').style.transform = "translateY(0px)";
        document.getElementById('menuBelowDropZones').style.transform = "translateY(0px)";
    }
}


//------------- show/hide current Selection-DIV (ID = id of clicked button)------------------------------------------------------
function showCoordsSelection() {
    // if other selection is open, close it
    if (selectionStatus.date == true) {
        showDateSelection();
    };

    console.log("hide/show Coordinate Selection ");

    // calculating direction of div (up or down)
    if (selectionStatus.coords == false) {
        document.getElementById("hideCoordSelection").innerHTML = "△";
        document.getElementById("hideCoordSelection").style.backgroundColor = "#4A74AA";
        document.getElementById('choseFieldDiv1').style.transform = "translateY(102px)";
        document.getElementById("menuBelowSelection").style.transform = "translateY(-60px)";
        selectionStatus.coords = true;
    } else {
        document.getElementById("hideCoordSelection").innerHTML = "▽";
        document.getElementById("hideCoordSelection").style.backgroundColor = "#A4C4E8";
        document.getElementById('choseFieldDiv1').style.transform = "translateY(-83px)";
        document.getElementById("menuBelowSelection").style.transform = "translateY(-248px)";
        selectionStatus.coords = false;
    }
}

function showDateSelection() {
    // if other selection is open, close it
    if (selectionStatus.coords == true) {
        showCoordsSelection();
    };

    console.log("hide/show Data Selection ");

    // calculating direction of div (up or down)
    if (selectionStatus.date == false) {
        document.getElementById("hideDataSelection").innerHTML = "△";
        document.getElementById("hideDataSelection").style.backgroundColor = "#4A74AA";
        //document.getElementById('choseFieldDiv2').style.transform = "translateY(23px)";
        //document.getElementById("menuBelowSelection").style.transform = "translateY(-140px)";
        document.getElementById('choseFieldDiv2').style.transform = "translateY(-17px)";
        document.getElementById("menuBelowSelection").style.transform = "translateY(-180px)";
        selectionStatus.date = true;
    } else {
        document.getElementById("hideDataSelection").innerHTML = "▽";
        document.getElementById("hideDataSelection").style.backgroundColor = "#A4C4E8";
        document.getElementById('choseFieldDiv2').style.transform = "translateY(-84px)";
        document.getElementById("menuBelowSelection").style.transform = "translateY(-247px)";
        selectionStatus.date = false;
    }
}
