var mymap = L.map('mapid').setView([39.1114977383163,-7.854252929687502], 10);
L.tileLayer('http://{s}.tile.osm.org/{z}/{x}/{y}.png', {
    attribution: 'Map data &copy; <a href="https://www.openstreetmap.org/">OpenStreetMap</a> contributors, <a href="https://creativecommons.org/licenses/by-sa/2.0/">CC-BY-SA</a>, Imagery © <a href="https://www.mapbox.com/">Mapbox</a>',
    maxZoom: 18,
    id: 'mapbox.streets',
    accessToken: 'pk.eyJ1IjoibWJlbGVtIiwiYSI6ImNqeGowN2gzazA3OGwzcHBsdmtma2t1bWQifQ.d8oQumRmcsoU-9ZKfcyTUA'
}).addTo(mymap);
var markers = [];
onload = function() {
    getMontargilShape();
    getMontargilLimits();
    getMaranhaoShape();
    getMaranhaoLimits();
    getJSONLocations();
};


// requests the montargil shape json and adds it to map
function getMontargilShape() {
    let xhr = new XMLHttpRequest();
    xhr.open("GET", "http://omega.maretec.org/api/?file=montargilShapefile", true);
    xhr.setRequestHeader('Content-Type', 'text/json');
    xhr.responseType = 'json';
    xhr.onload = function() {
        console.log(xhr.status);
        if (xhr.status !== 200) return
        var montargilShape = L.geoJSON(xhr.response)
        montargilShape.setStyle({color: '#fb2665', opacity: '0.3'})
        montargilShape.addTo(mymap);
    };
    xhr.send();
}


// requests the montargil delineation json and adds it to map
function getMontargilLimits() {
    let xhr = new XMLHttpRequest();
    xhr.open("GET", "http://omega.maretec.org/api/?file=montargilDelineation", true);
    xhr.setRequestHeader('Content-Type', 'text/json');
    xhr.responseType = 'json';
    xhr.onload = function() {
        console.log(xhr.status);
        if (xhr.status !== 200) return
        var montargilLimits = L.geoJSON(xhr.response)
        montargilLimits.setStyle({color: '#fb2665', opacity: '1'})
        montargilLimits.addTo(mymap);
    };
    xhr.send();
}


// requests the montargil shape json and adds it to map
function getMaranhaoShape() {
    let xhr = new XMLHttpRequest();
    xhr.open("GET", "http://omega.maretec.org/api/?file=maranhaoShapefile", true);
    xhr.setRequestHeader('Content-Type', 'text/json');
    xhr.responseType = 'json';
    xhr.onload = function() {
        console.log(xhr.status);
        if (xhr.status !== 200) return
        var maranhaoShape = L.geoJSON(xhr.response)
        maranhaoShape.setStyle({color: '#2aa390', opacity: '0.3'})
        maranhaoShape.addTo(mymap);
    };
    xhr.send();
}


// requests the maranhao delineation json and adds it to map
function getMaranhaoLimits() {
    let xhr = new XMLHttpRequest();
    xhr.open("GET", "http://omega.maretec.org/api/?file=maranhaoDelineation", true);
    xhr.setRequestHeader('Content-Type', 'text/json');
    xhr.responseType = 'json';
    xhr.onload = function() {
        console.log(xhr.status);
        if (xhr.status !== 200) return
        var maranhaoLimits = L.geoJSON(xhr.response)
        maranhaoLimits.setStyle({color: '#2aa390', opacity: '1'})
        maranhaoLimits.addTo(mymap);
    };
    xhr.send();
}


// requests json containing markers' data
function getJSONLocations(){
    let xhr = new XMLHttpRequest();
    xhr.open("GET", "http://omega.maretec.org/api/?file=LocationsCaudais", true);
    xhr.setRequestHeader('Content-Type', 'text/json');
    xhr.responseType = 'json';
    xhr.onload = function() {
        putMarkers(xhr.response);
    };
    xhr.send();
}


// iterates through json and creates markers
function putMarkers(Caudais) {
    for(var i = 0; i < Caudais.Caudais.length; i++){
        var caudal = Caudais.Caudais[i];
        var circle = L.circle([caudal.Latitude, caudal.Longitude], {
            color: i == 0 ? '#2aa390' : '#fb2665',
            fillColor: 'white',
            fillOpacity: 0.6,
            radius: 4000,
            url: "http://omega.maretec.org/html/caudais/caudais.html?caudal="+caudal.Folder,
            info: caudal
        }).addTo(mymap);
        circle.on('click', openPage);
        var popupText = caudal.Nome;
        circle.bindPopup(popupText);
        circle.on('mouseover', function (e) {
            this.openPopup();
        });
        circle.on('mouseout', function (e) {
            this.closePopup();
        });
        markers.push(circle);
    }
}


// opens page associated with marker clicked
function openPage() {
    if(this.options.info.Folder){
        window.open(this.options.url);
        console.log("abriu pagina");
    }
    else {
        this.bindPopup("No data about "+this.options.info.Nome);
    }
}

// changes marker size based on zoom level
mymap.on('zoomend', function() {
    var currentZoom = mymap.getZoom();
    var newRadius;
    var changed = false;
    switch (currentZoom) {
        case 8:
            newRadius = 5000;
            changed = true;
            break;
        case 9:
            newRadius = 4000;
            changed = true;
            break;
        case 10:
            newRadius = 3000;
            changed = true;
            break;
        case 11:
            newRadius = 2500;
            changed = true;
            break;
        case 12:
            newRadius = 2000;
            changed = true;
            break;
        case 13:
            newRadius = 1500;
            changed = true;
            break;
        case 14:
            newRadius = 1000;
            changed = true;
            break;
        case 15:
            newRadius = 500;
            changed = true;
            break;
        case 16:
            newRadius = 100;
            changed = true;
            break;
    }
    if (changed) {
        for(i=0; i<markers.length; i++)
            markers[i].setRadius(newRadius);
    }
});