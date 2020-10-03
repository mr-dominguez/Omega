var mymap = L.map('mapid').setView([39.15914977383163,-8.234252929687502], 9);
L.tileLayer('http://{s}.tile.osm.org/{z}/{x}/{y}.png', {
    attribution: 'Map data &copy; <a href="https://www.openstreetmap.org/">OpenStreetMap</a> contributors, <a href="https://creativecommons.org/licenses/by-sa/2.0/">CC-BY-SA</a>, Imagery © <a href="https://www.mapbox.com/">Mapbox</a>',
    maxZoom: 18,
    id: 'mapbox.streets',
    accessToken: 'pk.eyJ1IjoibWJlbGVtIiwiYSI6ImNqeGowN2gzazA3OGwzcHBsdmtma2t1bWQifQ.d8oQumRmcsoU-9ZKfcyTUA'
}).addTo(mymap);
var markers = [];
let xhr = new XMLHttpRequest();
xhr.open("GET", "http://omega.maretec.org/api/?file=Area", true);
xhr.setRequestHeader('Content-Type', 'text/json');
xhr.responseType = 'json';
xhr.onload = function() {
    if (xhr.status !== 200) return
    getJSONLocations();
    L.geoJSON(xhr.response).addTo(mymap);
};
xhr.send();

/*mymap.on('click', function(e){
    var coord = e.latlng;
    var lat = coord.lat;
    var lng = coord.lng;
    console.log("You clicked the map at latitude: " + lat + " and longitude: " + lng);
    });*/

function getJSONLocations(){
    let xhr = new XMLHttpRequest();
    xhr.open("GET", "http://omega.maretec.org/api/?file=Locations", true);
    xhr.setRequestHeader('Content-Type', 'text/json');
    xhr.responseType = 'json';
    xhr.onload = function() {
        putMarkers(xhr.response);
    };
    xhr.send();
}

function putMarkers(Barragens) {
    for(var i = 0; i < Barragens.Barragens.length; i++){
        var barragem = Barragens.Barragens[i];
        var circle = L.circle([barragem.Latitude, barragem.Longitude], {
            color: 'red',
            fillColor: 'red',
            fillOpacity: 0.5,
            radius: 4000,
            url: "http://omega.maretec.org/html/estaciones/barragem.html?barragem="+barragem.Folder,
            info: barragem
        }).addTo(mymap);
        circle.on('click', openPage);
        circle.bindPopup(barragem.Nome);
        circle.on('mouseover', function (e) {
            this.openPopup();
        });
        circle.on('mouseout', function (e) {
            this.closePopup();
        });
        markers.push(circle);
    }
}

function openPage() {
    if(this.options.info.Folder){
        window.open(this.options.url);
    }
    else{
        this.bindPopup("No data about "+this.options.info.Nome);
    }
}

mymap.on('zoomend', function() {
    var currentZoom = mymap.getZoom();
    var newRadius;
    switch (currentZoom) {
        case 9:
            newRadius = 4000;
            break;
        case 10:
            newRadius = 3300;
            break;
        case 11:
            newRadius = 2800;
            break;
        case 12:
            newRadius = 2200;
            break;
        case 13:
            newRadius = 1750;
            break;
        case 14:
            newRadius = 1250;
            break;
        case 15:
            newRadius = 800;
            break;
        case 16:
            newRadius = 400;
            break;
    }
    for(i=0; i<markers.length; i++) {
        markers[i].setRadius(newRadius);
    }
});