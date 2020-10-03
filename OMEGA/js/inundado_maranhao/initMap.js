var mymap = L.map('mapid').setView([39.0714977383163, -7.874252929687502], 12);
L.tileLayer('http://{s}.tile.osm.org/{z}/{x}/{y}.png', {
    attribution: 'Map data &copy; <a href="https://www.openstreetmap.org/">OpenStreetMap</a> contributors, <a href="https://creativecommons.org/licenses/by-sa/2.0/">CC-BY-SA</a>, Imagery © <a href="https://www.mapbox.com/">Mapbox</a>',
    maxZoom: 18,
    id: 'mapbox.streets',
    accessToken: 'pk.eyJ1IjoibWJlbGVtIiwiYSI6ImNqeGowN2gzazA3OGwzcHBsdmtma2t1bWQifQ.d8oQumRmcsoU-9ZKfcyTUA'
}).addTo(mymap);

var maranhaoLayer = null;

onload = function() {
    updateLayer(130);
    createSliderUI();
}

function createSliderUI() {
    var sliderControl = L.control({ position: 'topright'} );

    sliderControl.onAdd = function(mymap) {
        var slider = L.DomUtil.create('input', 'range-slider');
        L.DomEvent.addListener(slider, 'mousedown', function(e) { 
            L.DomEvent.stopPropagation(e); 
        });
        L.DomEvent.addListener(slider, 'mouseover', function(e) {
            mymap.dragging.disable();
        });
        L.DomEvent.addListener(slider, 'mouseout', function(e) {
            mymap.dragging.enable();
        });

        $(slider)
                .attr({'type':'range',
                        'max': 130,
                        'min': 90,
                        'step': -1,
                        'value': 130})
                .on('input change', function() {
                updateLayer($(this).val());
                    $('.temporal-legend').text(this.value + 'm');
        });
        return slider;
    }

    sliderControl.addTo(mymap);
    createTemporalLegend();
}


function createTemporalLegend() {
    var temporalLegend = L.control({ position: 'topright' });

    temporalLegend.onAdd = function(mymap) {
        var output = L.DomUtil.create('output', 'temporal-legend');
        $(output).text('130m')
        return output;
    }

    temporalLegend.addTo(mymap);
}


function updateLayer(height) {
    var layerName;
    
    if (height == 130 || height == 120 || height == 110 || height == 100 || height == 90) {
        layerName = 'maranhao_' + String((height - 130) * -1) + 'm';
    } else {
        layerName = 'maranhao_' + String(height) + "m";
    }

    if (maranhaoLayer) {
        maranhaoLayer.removeFrom(mymap);
    }

    maranhaoLayer = L.tileLayer.wms('http://irrigasysgeo.maretec.org/geoserver/omega/wms?service=WMS', {
    format: 'image/png',
    transparent: true,
    layers: layerName
    }).addTo(mymap);
}