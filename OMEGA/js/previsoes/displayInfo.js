google.load('visualization',
        '1.1',
        { 'packages': ['corechart', 'controls'] });
console.log(window.location.href);
var params = getAllUrlParams(decodeURI(window.location.href));
console.log(params);
if(params) {
  generatePage(params["barragemprevista"]);
}
else {
  errorPage();
}

function getAllUrlParams(url) {

    // get query string from url (optional) or window
    var queryString = url ? url.split('?')[1] : window.location.search.slice(1);

    // we'll store the parameters here
    var obj = {};

    // if query string exists
    if (queryString) {

        // stuff after # is not part of query string, so get rid of it
        queryString = queryString.split('#')[0];

        // split our query string into its component parts
        var arr = queryString.split('&');

        for (var i = 0; i < arr.length; i++) {
        // separate the keys and the values
        var a = arr[i].split('=');

        // set parameter name and value (use 'true' if empty)
        var paramName = a[0];
        if(!a[1] || $.isEmptyObject(a[1])) {
            return null;
        }
        else {
            var paramValue = a[1];
        }
        //var paramValue = typeof (a[1]) === 'undefined' ? true : a[1];

        // (optional) keep case consistent
        paramName = paramName.toLowerCase();
        if (typeof paramValue === 'string') paramValue = paramValue.toLowerCase();

        // if the paramName ends with square brackets, e.g. colors[] or colors[2]
        if (paramName.match(/\[(\d+)?\]$/)) {

            // create key if it doesn't exist
            var key = paramName.replace(/\[(\d+)?\]/, '');
            if (!obj[key]) obj[key] = [];

            // if it's an indexed array e.g. colors[2]
            if (paramName.match(/\[\d+\]$/)) {
            // get the index value and add the entry at the appropriate position
            var index = /\[(\d+)\]/.exec(paramName)[1];
            obj[key][index] = paramValue;
            } else {
            // otherwise add the value to the end of the array
            obj[key].push(paramValue);
            }
        } else {
            // we're dealing with a string
            if (!obj[paramName]) {
            // if it doesn't exist, create property
            obj[paramName] = paramValue;
            } else if (obj[paramName] && typeof obj[paramName] === 'string'){
            // if property does exist and it's a string, convert it to an array
            obj[paramName] = [obj[paramName]];
            obj[paramName].push(paramValue);
            } else {
            // otherwise add the property
            obj[paramName].push(paramValue);
            }
        }
        }
}

return obj;
}

function generatePage(name) {
    let xhr = new XMLHttpRequest();
    xhr.open("GET", "http://omega.maretec.org/api/?barragemPrevista="+name, true);
    xhr.setRequestHeader('Content-Type', 'text/json');
    xhr.responseType = 'json';
    xhr.onload = function() {
      console.log(xhr.response);
      let flag = true;
      for(let i = 0; i < xhr.response.Barragens.length; i++) {
        if(xhr.response.Barragens[i].Nome.toLowerCase() == params["barragemprevista"]) {
          flag = false;
          for(let k = 0; k < xhr.response.Indicadores.length; k++) {
            document.getElementById("name").innerHTML = xhr.response.Barragens[i].Nome.charAt(0).toUpperCase() + xhr.response.Barragens[i].Nome.slice(1);
            google.charts.setOnLoadCallback(function() {generateMap(xhr.response.Indicadores[k],xhr.response.Barragens[i].Nome)});
          }
          break;
        }
      }
      if(flag) {
        errorPage();
      }
    };
    xhr.send();
}

function generateMap(elm,barragem) {
    var jsonData = $.ajax({
      url: "http://omega.maretec.org/api/?chart="+elm.Folder+"&bp="+barragem,
      dataType: "json",
      async: false
      }).responseText;
      console.log(elm)
      console.log(JSON.parse(jsonData));
      var data = [["Date"]];
      for(let i = 0; i < elm.SubIndicadores.length; i++) {
        data[0].push(elm.SubIndicadores[i]);
      }

      $.each(JSON.parse(jsonData), function (index, value) {
        data.push(Object.values(value));
      });

      var options = {
        title: elm.Nome,
        curveType: 'function',
        legend: { position: 'bottom', textStyle: { color: '#555', fontSize: 14} }, 
        hAxis: { 
          textStyle : {
              fontSize: 9 
          }
        },
        vAxis: {
          title: elm.Unidade,
          viewWindow: {
            max: elm.Upper,
            min: elm.Lower
          }
        }
      };
      console.log(data);
      var figures = google.visualization.arrayToDataTable(data)

      var graphsRoot = document.getElementById("graphs");
      var node = document.createElement("div");
      node.setAttribute("id", elm.DivID);
      graphsRoot.appendChild(node);
      graphsRoot.appendChild(document.createElement("hr"));

      var chart
      if(elm.ChartType == "lineChart") {
        chart = new google.visualization.LineChart(document.getElementById(elm.DivID));
      }
      else if(elm.ChartType == "columnChart") {
        chart = new google.visualization.ColumnChart(document.getElementById(elm.DivID));
      }
      

      chart.draw(figures, options);

      $(window).resize(function () {
        chart.draw(figures, options);
      });
}

function errorPage() {
  window.location.replace("http://omega.maretec.org/html/errorPage.html");
}
