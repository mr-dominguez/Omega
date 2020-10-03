var mymap = L.map('mapid').setView([39.0614977383163, -7.954252929687502], 11);
L.tileLayer('http://{s}.tile.osm.org/{z}/{x}/{y}.png', {
    attribution: 'Map data &copy; <a href="https://www.openstreetmap.org/">OpenStreetMap</a> contributors, <a href="https://creativecommons.org/licenses/by-sa/2.0/">CC-BY-SA</a>, Imagery © <a href="https://www.mapbox.com/">Mapbox</a>',
    maxZoom: 18,
    id: 'mapbox.streets',
    accessToken: 'pk.eyJ1IjoibXJkb21pbmd1ZXo5OSIsImEiOiJja2V2OG1wY2kwdzMwMzRsaGo1ajlybWpjIn0.LiOx3YjF_VejmcdzqezDEg'
}).addTo(mymap);

var redIcon = new L.Icon({
    iconUrl: 'https://cdn.rawgit.com/pointhi/leaflet-color-markers/master/img/marker-icon-2x-red.png',
    shadowUrl: 'https://cdnjs.cloudflare.com/ajax/libs/leaflet/0.7.7/images/marker-shadow.png',
    iconSize: [25, 41],
    iconAnchor: [12, 41],
    popupAnchor: [1, -34],
    shadowSize: [41, 41]
  });

onload = function() {

     /* get both layers and add them to the map 
        only config needed is transparent being true*/
    var maranhaoLayer = L.tileLayer.wms('http://irrigasysgeo.maretec.org/geoserver/omega/wms?service=WMS', {
        format: 'image/png',
        transparent: true,
        layers: 'Maranhao'
    }).addTo(mymap);
    var montargilLayer = L.tileLayer.wms('http://irrigasysgeo.maretec.org/geoserver/omega/wms?service=WMS', {
        format: 'image/png',
        transparent: true,
        layers: 'Montargil'
    }).addTo(mymap);
    
    let xhr = new XMLHttpRequest();
    xhr.open("GET", "http://omega.maretec.org/api/?file=sateliteInfo", true);
    xhr.setRequestHeader('Content-Type', 'text/json');
    xhr.responseType = 'json';
    xhr.onload = function() {
        if (xhr.status !== 200) return
        loadSateliteInfo(xhr.response);
    };
    xhr.send();    
};


function loadSateliteInfo(sateliteInfo) {
    maranhaoInfo = sateliteInfo["maranhao"].replace('(', "").replace(')', "").split(",");
    maranhaoDate = maranhaoInfo[0].substr(-7, 2) 
                    + "-"
                    + maranhaoInfo[0].substr(-9, 2)
                    + "-"
                    + maranhaoInfo[0].substr(-13, 4);
    maranhaoText = '<span>Área: ' 
                    + maranhaoInfo[1].substring(0, 7)
                    + ' (ha)<br>'
                    + 'Volume: '
                    + maranhaoInfo[2].substring(0, 7)
                    + ' (10<sup>6</sup> m<sup>3</sup>)<br>'
                    + 'Altura: '
                    + maranhaoInfo[3].substring(0, 7)
                    + ' (m)<br><br>'
                    + maranhaoDate + '</span>';
    var maranhaoMarker = L.marker([39.048498, -7.930542], {icon: redIcon}).addTo(mymap).bindPopup(maranhaoText);
    
    montargilInfo = sateliteInfo["montargil"].replace("(", "").replace(")", "").split(",");
    montargilDate = montargilInfo[0].substr(-7, 2) 
                    + "-"
                    + montargilInfo[0].substr(-9, 2)
                    + "-"
                    + montargilInfo[0].substr(-13, 4);
    montargilText = '<span>Área: ' 
                    + montargilInfo[1].substring(0, 7)
                    + ' (ha)<br>'
                    + 'Volume: '
                    + montargilInfo[2].substring(0, 7)
                    + ' (10<sup>6</sup> m<sup>3</sup>)<br>'
                    + 'Altura: '
                    + montargilInfo[3].substring(0, 7)
                    + ' (m)<br><br>'
                    + montargilDate + '</span>';
    var montargilMarker = L.marker([39.089061, -8.144952], {icon: redIcon}).addTo(mymap).bindPopup(montargilText);
}


