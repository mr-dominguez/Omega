//array of all albufeiras
var Albufeiras = [];
//avoid callback problems;
var myIndex = 0;
var lastWeek;
var isMobile;

$(document).ready(function () {
    isMobile = detectmob();
    setAlbufeiras();
    //load google charts
    google.load('visualization',
    '1.1',
    { 'packages': ['corechart', 'controls'] });
    $("#sidebar").mCustomScrollbar({
        theme: "minimal"
    });

    $('#dismiss, .overlay').on('click', function () {
        $('#sidebar').removeClass('active');
        $('.overlay').removeClass('active');
    });

    $('#sidebarCollapse').on('click', function () {
        $('#sidebar').addClass('active');
        $('.overlay').addClass('active');
        $('.collapse.in').toggleClass('in');
        $('a[aria-expanded=true]').attr('aria-expanded', 'false');
    });
  
    $('input#myInput').on('keyup touchend', function() {
        var value = $('input#myInput').val().toLowerCase();
        $(".toggle").hide();
        var match = $(".toggle .albufeiraName").filter(function() {
          return ($(this).text().toLowerCase().indexOf(value) !== -1);
        });
        for(var i = 0; i < match.length; i++) {
          match.closest('.toggle').show();
        } 
    })
});



//get the name of albufeiras and displayed them on side menu
function setAlbufeiras() {
    let xhr = new XMLHttpRequest();
    xhr.open("GET", "http://omega.maretec.org/api/?file=data", true);
    xhr.setRequestHeader('Content-Type', 'text/json');
    xhr.responseType = 'json';
    xhr.onload = function() {
        if (xhr.status !== 200) return
        var albufeirasJSON = xhr.response;
        let xhr2 = new XMLHttpRequest();
        xhr2.open("GET", "http://omega.maretec.org/api/?file=volumesData", true);
        xhr2.setRequestHeader('Content-Type', 'text/json');
        xhr2.responseType = 'json';
        xhr2.onload = function() {
            if (xhr2.status !== 200) return
            prepareData(albufeirasJSON, xhr2.response)
        };
        xhr2.send();
        };
    xhr.send();

}

function prepareData(albufeirasJSON, volumesData) {
    //console.log(albufeirasJSON)
    console.log(volumesData)
    for(let i=0;i<albufeirasJSON["volumes"]["albufeiras"].length;i++) {
        //console.log(albufeirasJSON["volumes"]["albufeiras"][i])
        var albufeira = new Albufeira(albufeirasJSON.volumes.albufeiras[i].barragem, albufeirasJSON.volumes.albufeiras[i].barragem,
            albufeirasJSON.volumes.albufeiras[i].aproveitamento, albufeirasJSON.volumes.albufeiras[i].bacia,
            albufeirasJSON.volumes.albufeiras[i].latitude,albufeirasJSON.volumes.albufeiras[i].longitude,
            albufeirasJSON.volumes.albufeiras[i].NPA,albufeirasJSON.volumes.albufeiras[i].NME,
            albufeirasJSON.volumes.albufeiras[i].Vtotal,albufeirasJSON.volumes.albufeiras[i].Vmorto,volumesData["albufeiras"][i][1],
            isMobile);
        Albufeiras.push(albufeira);   
    }
    lastWeek = {
        numero: albufeirasJSON.data.semana[0].numero,
        data: albufeirasJSON.data.semana[0].dia
    }
    initMap();
    
    

}

/**used to display initial graph */
function initMap() {
    // More or less center of Portugal (just for zooming)
    var uluru = {lat: 39.855808, lng: -8.201761};
    // The map, centered at Uluru
    var map = new google.maps.Map(
        document.getElementById('mainMap'), {
            zoom: 7, 
            center: uluru,
            //gestureHandling: 'none',
            //zoomControl: false
        }
    );
    for(var i = 0; i < Albufeiras.length; i++) {
        //console.log(Albufeiras[i])
        //var nome = Albufeiras[i].nome.split(".")[0];
        var nome = Albufeiras[i].barragem;
        putMarkers(map, nome.charAt(0).toUpperCase() + nome.slice(1), Albufeiras[i].latitude, Albufeiras[i].longitude, parseFloat((Albufeiras[i].content[Albufeiras[i].content.length - 1]["VolumeArmazenado"])*100).toFixed(0),
            Albufeiras[i].content[Albufeiras[i].content.length - 1]["Semana"], Albufeiras[i].content[Albufeiras[i].content.length - 1]["Data"], Albufeiras[i]);
    }
    
    var toCanvas = {
        a: {
            id: "circleA",
            color: "black" 
        },
        b: {
            id: "circleB",
            color: "red" 
        },
        c: {
            id: "circleC",
            color: "yellow" 
        },
        d: {
            id: "circleD",
            color: "green" 
        }
    };

    for(var a in toCanvas) {
        var type = toCanvas[a];
        var canvas = document.getElementById(type.id);
        var context = canvas.getContext('2d');
        var centerX = canvas.width / 2;
        var centerY = canvas.height / 2;
        var radius = 9;

        context.beginPath();
        context.arc(centerX, centerY, radius, 0, 2 * Math.PI, false);
        context.fillStyle = type.color;
        context.fill();
        context.stroke();
    }

    document.getElementById("legend").style.display = "block";
    var semanaAtual = document.getElementById("semanaAtual");
    semanaAtual.style.display = "block";
    var text = document.createTextNode("Semana de "+lastWeek.data);
    semanaAtual.appendChild(text);
    //var text = document.createTextNode("Semana de 24-04-2020");
    //semanaAtual.appendChild(text);
    document.getElementById("loading").style.display = "none";
    document.getElementById("sidebarCollapse").disabled = false;


}

function putMarkers(map, nome, lat, long, armazenamentoUtil,semana,data, obj) {

    /*if(data!=lastWeek.data || semana!=lastWeek.numero) {
        //console.log(nome,data,lastWeek.data,semana,lastWeek.numero);
        return;
    }*/
    var color;
    if(parseInt(armazenamentoUtil) <= 30) {
        color = "black";
    } else if((parseInt(armazenamentoUtil) >= 31) && (parseInt(armazenamentoUtil)<=60)) {
        color = "red";
    } else if((parseInt(armazenamentoUtil) >= 61) && (parseInt(armazenamentoUtil)<=80)) {
        color = "yellow";
    }
    else {
        color = "green";
    }
    
    var uluru = {lat: lat, lng: long};
    var fontColor = "white"
    if (color == "yellow") {
        fontColor = "black";
    }
    // The marker, positioned at Uluru
    var marker = new google.maps.Marker( {
        position: uluru, 
        label: {
            text: armazenamentoUtil+"%",
            color: fontColor,
            fontSize: "10px"
          },
        map: map,
        icon: {
            path: google.maps.SymbolPath.CIRCLE,
            scale: 11.5,
            fillColor: color,
            fillOpacity: 1,
            strokeWeight: 1
        },
    });
    var infowindow = new google.maps.InfoWindow();
    if(isMobile) {
        console.log("bruh");
        marker.addListener('click', obj.displayInformation(obj))
    } else {
        console.log("bruh2");
        google.maps.event.addListener(marker, 'mouseover', function() {
            infowindow.setContent(nome);
            infowindow.open(map, marker);
        });
        google.maps.event.addListener(marker, 'mouseout', function() {
            infowindow.close();
        });
        google.maps.event.addListener(marker, 'click', obj.displayInformation(obj))
    }
}


//used to read local json files
function readTextFile(file, callback) {
    var rawFile = new XMLHttpRequest();
    rawFile.overrideMimeType("application/json");
    rawFile.open("GET", file, true);
    rawFile.onreadystatechange = function() {
        if (rawFile.readyState === 4 && rawFile.status == "200") {
            callback(rawFile.responseText);
        }
    }
    rawFile.send(null);
}

function detectmob() { 
    if( navigator.userAgent.match(/Android/i)
    || navigator.userAgent.match(/webOS/i)
    || navigator.userAgent.match(/iPhone/i)
    || navigator.userAgent.match(/iPad/i)
    || navigator.userAgent.match(/iPod/i)
    || navigator.userAgent.match(/BlackBerry/i)
    || navigator.userAgent.match(/Windows Phone/i)
    ){
       return true;
     }
    else {
       return false;
     }
}



