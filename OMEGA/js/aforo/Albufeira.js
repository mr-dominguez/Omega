class Albufeira {
    get nome() {
        return this._nome;
    }
    set nome(value) {
        this._nome = value;
    }
    get barragem() {
        return this._barragem;
    }
    set barragem(value) {
        this._barragem = value;
    }
    get aproveitamento() {
        return this._aproveitamento;
    }
    set aproveitamento(value) {
        this._aproveitamento = value;
    }
    get bacia() {
        return this._bacia;
    }
    set bacia(value) {
        this._bacia = value;
    }
    get latitude() {
        return this._latitude;
    }
    set latitude(value) {
        this._latitude = value;
    }
    get longitude() {
        return this._longitude;
    }
    set longitude(value) {
        this._longitude = value;
    }
    get npa() {
        return this._npa;
    }
    set npa(value) {
        this._npa = value;
    }
    get nme() {
        return this._nme;
    }
    set nme(value) {
        this._nme = value;
    }
    get vTotal() {
        return this._vTotal;
    }
    set vTotal(value) {
        this._vTotal = value;
    }
    get vMorto() {
        return this._vMorto;
    }
    set vMorto(value) {
        this._vMorto = value;
    }
    get content() {
        return this._content;
    }
    set content(value) {
        this._content = value;
    }
    get lastYearContent() {
        return this._lastYearContent;
    }
    set lastYearContent(value) {
        this._lastYearContent = value;
    }
    get lastButOneYear() {
        return this._lastButOneYear;
    }
    set lastButOneYear(value) {
        this._lastButOneYear = value;
    }
    get lastButTwoYear() {
        return this._lastButTwoYear;
    }
    set lastButTwoYear(value) {
        this._lastButTwoYear = value;
    }
    get lastButThreeYear() {
        return this._lastButThreeYear;
    }
    set lastButThreeYear(value) {
        this._lastButThreeYear = value;
    }
    get lastButFourYear() {
        return this._lastButFourYear;
    }
    set lastButFourYear(value) {
        this._lastButFourYear = value;
    }
    get lastYear() {
        return this._lastYear;
    }
    set lastYear(value) {
        this._lastYear = value;
    }
    get firstYear() {
        return this._firstYear;
    }
    set firstYear(value) {
        this._firstYear = value;
    }
    get secondYear() {
        return this._secondYear;
    }
    set secondYear(value) {
        this._secondYear = value;
    }
    get thirdYear() {
        return this._thirdYear;
    }
    set thirdYear(value) {
        this._thirdYear = value;
    }
    get averageYearsContent() {
        return this._averageYearsContent;
    }
    set averageYearsContent(value) {
        this._averageYearsContent = value;
    }
    get graphArray() {
        return this._graphArray;
    }
    set graphArray(value) {
        this._graphArray = value;
    }
    get min() {
        return this._min;
    }
    set min(value) {
        this._min = value;
    }
    get max() {
        return this._max;
    }
    set max(value) {
        this._max = value;
    }
    get isMobile() {
        return this._isMobile;
    }
    set isMobile(value) {
        this._isMobile = value;
    }
    get hash() {
        return this._hash;
    }
    set hash(value) {
        this._hash = value;
    }

    constructor(nome,barragem,aproveitamento,bacia,latitude,longitude,npa,nme,vTotal,vMorto,content,isMobile) {
        //load google charts
        google.load('visualization',
        '1.1',
        { 'packages': ['corechart', 'controls'] });
        this.nome = nome;
        this.barragem = barragem;
        this.aproveitamento = aproveitamento;
        this.bacia = bacia;
        this.latitude = latitude;
        this.longitude = longitude;
        this.npa = npa;
        this.nme = nme;
        this.vTotal = vTotal;
        this.vMorto = vMorto;
        this.content = content;
        this.max = null;
        this.min = null;
        this.isMobile = isMobile;
        this.lastYearContent = [];
        this.lastButOneYear = [];
        this.lastButTwoYear = [];
        this.lastButThreeYear = [];
        this.lastButFourYear = [];
        this.graphArray = [];
        this.hash = 0;
        this.displayOnMenu();
    }

    //used to display the name of the albufeira in the side menu
    displayOnMenu() {
        var albufeirasID = document.getElementById('albufeiras');
        var elementLi = document.createElement("li");
        elementLi.className = "components toggle";
        var elementA = document.createElement("a");
        elementA.className = "albufeiraName"
        var name = this.nome.split(".")[0];
        var text = document.createTextNode(name.charAt(0).toUpperCase() + name.slice(1));
        elementLi.id = name.charAt(0).toUpperCase() + name.slice(1);
        elementA.appendChild(text);
        elementLi.appendChild(elementA);
        albufeirasID.appendChild(elementLi);

        elementLi.onclick = this.displayInformation(this);

        document.getElementById("backToMap").onclick = this.reloadMap(this);
        
    }

    reloadMap(obj) {
        return function() {
            document.getElementById("semanaAtual").style.display = "block";
            document.getElementById("mainMap").style.display = "block";
            document.getElementById("legend").style.display = "block";
            document.getElementById("map").style.display = "none";
            document.getElementById("backToMap").style.display = "none";
            obj.clean("chart");
            obj.clean("informations");
            obj.clean("map");
        }
    }
    displayInformation(obj) {
        return function () {
            //obj.hash += 1;
            //location.hash = obj.hash;
            document.getElementById("semanaAtual").style.display = "none";
            document.getElementById("mainMap").style.display = "none";
            document.getElementById("legend").style.display = "none";
            document.getElementById("map").style.display = "block";
            document.getElementById("backToMap").style.display = "block";
            obj.clean("chart");
            obj.clean("informations");
            obj.clean("map");

            obj.displayChart(obj);
            obj.generateInfoTable(obj);
            obj.initMap(obj);
            obj.hideOverlay();

          };
        
    }

    generateInfoTable(obj) {
        var informations = document.getElementById('informations');
        /*table tittle*/
        var albufeiraName = document.createElement('h2');
        var name = obj.nome.split(".")[0];
        var text = document.createTextNode(name.charAt(0).toUpperCase() + name.slice(1));
        albufeiraName.style.textAlign = "center";
        albufeiraName.appendChild(text);
        informations.appendChild(albufeiraName);

        /*table and table body creation*/
        var table = document.createElement('table');
        table.className = "table";
        var tableBody =  document.createElement('tbody');
        table.appendChild(tableBody);
        informations.appendChild(table);

        /*fill table body*/

        //new first row
        var newFirstTableRow = document.createElement('tr');
        var tableData = document.createElement('td');
        tableData.style.width = "33.33%";
        text = document.createTextNode("Volume armazenado ("+this.content[this.content.length - 1]["Data"]+")");
        tableData.appendChild(text);
        newFirstTableRow.appendChild(tableData);

        tableData = document.createElement('td');
        tableData.style.width = "33.33%";
        text = document.createTextNode(parseFloat(this.content[this.content.length - 1]["Total"]).toFixed(2)+" hm3");
        tableData.appendChild(text);
        newFirstTableRow.appendChild(tableData);


        tableData = document.createElement('td');
        tableData.style.width = "33.33%";
        text = document.createTextNode(parseFloat((this.content[this.content.length - 1]["Total"]/ this.vTotal) * 100).toFixed(2)+" %");
        tableData.appendChild(text);
        newFirstTableRow.appendChild(tableData);

        //first row
        var firstTableRow = document.createElement('tr');
        var tableData = document.createElement('td');
        tableData.style.width = "33.33%";
        text = document.createTextNode("Volume útil armazenado");
        tableData.appendChild(text);
        firstTableRow.appendChild(tableData);

        tableData = document.createElement('td');
        tableData.style.width = "33.33%";
        text = document.createTextNode(parseFloat(this.getValue(this.content[this.content.length - 1]["Semana"], this.lastYearContent)).toFixed(2)+" hm3");
        tableData.appendChild(text);
        firstTableRow.appendChild(tableData);

        tableData = document.createElement('td');
        tableData.style.width = "33.33%";
        text = document.createTextNode(parseFloat((this.getValue(this.content[this.content.length - 1]["Semana"], this.lastYearContent)/(this.vTotal-this.vMorto))*100).toFixed(2)+"%");
        tableData.appendChild(text);
        firstTableRow.appendChild(tableData);

        //second row
        var secondTableRow = document.createElement('tr');
        var tableData = document.createElement('td');
        text = document.createTextNode("Variação semana anterior");
        tableData.appendChild(text);
        secondTableRow.appendChild(tableData);

        tableData = document.createElement('td');
        text = document.createTextNode(parseFloat(this.content[this.content.length - 1]["Total"]
        - this.content[this.content.length - 2]["Total"]).toFixed(2)+" hm3");
        tableData.appendChild(text);
        secondTableRow.appendChild(tableData);

        tableData = document.createElement('td');
        text = document.createTextNode(Math.abs(parseFloat((this.content[this.content.length - 1]["Total"]
        - this.content[this.content.length - 2]["Total"])/this.content[this.content.length - 1]["Total"]).toFixed(2)*100).toFixed(2)+" %");
        tableData.appendChild(text);
        secondTableRow.appendChild(tableData);

        //third row
        var thirdTableRow = document.createElement('tr');
        var tableData = document.createElement('td');
        text = document.createTextNode("Capacidade útil");
        tableData.appendChild(text);
        thirdTableRow.appendChild(tableData);

        tableData = document.createElement('td');
        text = document.createTextNode(parseFloat(this.vTotal - this.vMorto).toFixed(2) + " hm3");
        tableData.appendChild(text);
        thirdTableRow.appendChild(tableData);

        tableData = document.createElement('td');
        thirdTableRow.appendChild(tableData);

        //new third row
        var newThirdTableRow = document.createElement('tr');
        var tableData = document.createElement('td');
        text = document.createTextNode("Capacidade total");
        tableData.appendChild(text);
        newThirdTableRow.appendChild(tableData);

        tableData = document.createElement('td');
        text = document.createTextNode(parseFloat(this.vTotal).toFixed(2) + " hm3");
        tableData.appendChild(text);
        newThirdTableRow.appendChild(tableData);

        tableData = document.createElement('td');
        newThirdTableRow.appendChild(tableData);

        //fourth row
        var fourthTableRow = document.createElement('tr');
        var tableData = document.createElement('td');
        text = document.createTextNode("Mesma semana (" +this.secondYear+ ")");
        tableData.appendChild(text);
        fourthTableRow.appendChild(tableData);

        tableData = document.createElement('td');
        text = document.createTextNode(parseFloat(this.getValue(this.content[this.content.length - 1]["Semana"], this.lastButOneYear)).toFixed(2)+" hm3");        
        tableData.appendChild(text);
        fourthTableRow.appendChild(tableData);

        tableData = document.createElement('td');
        text = document.createTextNode(parseFloat((this.getValue(this.content[this.content.length - 1]["Semana"], this.lastButOneYear)/this.vTotal)*100).toFixed(2)+"%");
        tableData.appendChild(text);
        fourthTableRow.appendChild(tableData);

        //fifth row
        var fifthTableRow = document.createElement('tr');
        var tableData = document.createElement('td');
        text = document.createTextNode("Mesma semana (Média 5 anos)");
        tableData.appendChild(text);
        fifthTableRow.appendChild(tableData);

        tableData = document.createElement('td');
        text = document.createTextNode(parseFloat(this.graphArray[this.content[this.content.length - 1]["Semana"]-1][4]).toFixed(2)+" hm3");
        tableData.appendChild(text);
        fifthTableRow.appendChild(tableData);

        tableData = document.createElement('td');
        text = document.createTextNode(parseFloat(((this.graphArray[this.content[this.content.length - 1]["Semana"]-1][4])/this.vTotal)*100).toFixed(2)+"%");
        tableData.appendChild(text);
        fifthTableRow.appendChild(tableData);

        tableBody.appendChild(newFirstTableRow)
        tableBody.appendChild(firstTableRow);
        tableBody.appendChild(newThirdTableRow);
        tableBody.appendChild(thirdTableRow);
        tableBody.appendChild(secondTableRow);
        tableBody.appendChild(fourthTableRow);
        tableBody.appendChild(fifthTableRow);
    }

    hideOverlay() {
        document.getElementById("sidebar").classList.remove("active");
        document.getElementById("overlay").classList.remove("active");
    }

    displayChart(obj) {
        obj.drawChart(document.getElementById('chart'),obj);
    }

    initMap(obj) {
        // The location of Uluru
        var uluru = {lat: obj.latitude, lng: obj.longitude};
        // The map, centered at Uluru
        var map = new google.maps.Map(
            document.getElementById('map'), {zoom: 6, center: uluru});
        // The marker, positioned at Uluru
        var marker = new google.maps.Marker({position: uluru, map: map});
        var infowindow = new google.maps.InfoWindow();
        if(isMobile) {
            marker.addListener('click', function() {
                var name = obj.nome.split(".")[0];
                infowindow.setContent(name.charAt(0).toUpperCase() + name.slice(1));
                infowindow.open(map, marker);
            });
        } else {
            google.maps.event.addListener(marker, 'mouseover', function() {
                var name = obj.nome.split(".")[0];
                infowindow.setContent(name.charAt(0).toUpperCase() + name.slice(1));
                infowindow.open(map, marker);
            });
            google.maps.event.addListener(marker, 'mouseout', function() {
                infowindow.close();
            });
        }
      }

    clean(idToClean) {
        var myNode = document.getElementById(idToClean);
        while (myNode.firstChild) {
            myNode.removeChild(myNode.firstChild);
        }
    }

    drawChart(chartID,obj) {
        var toTick = []
        for(var k = 1; k<=53; k++) {
            toTick.push(k);
        }
        obj.parse();
        var data = new google.visualization.DataTable();
        data.addColumn('number', 'Semana');
        data.addColumn('number', 'Volume'+" útil(" +this.firstYear+")");
        data.addColumn('number', 'Volume'+" útil("+this.secondYear+")");
        data.addColumn('number', 'Volume'+" útil("+this.thirdYear+")");
        data.addColumn('number', 'Média(5anos)');
    
        data.addRows(this.graphArray);

        var options = {
            width: '100%',
            height: '100%',
            hAxis: {
                gridlines: {count: 52},
                ticks: toTick,
                title: "Semanas"
            },
            vAxis: {
              gridlines: {color: 'none'},
              minValue: this.min,
              title: "Volume útil(hm3)"
            },
            interpolateNulls: false,
            chartArea:{left:"10%",right:"20%",top:10,bottom:50,width:"80%",height:"100%"}
          };
        // Instantiate and draw the chart.
        var chart = new google.visualization.LineChart(chartID);
        chart.draw(data, options);
    }

    parse() {
        if(this.lastYearContent.length == 0) {
            this.parseFirstElement();
        } 
    }

    parseFirstElement() {
        this.lastYear = this.content[this.content.length - 1]["Data"].split("/")[2];
        this.firstYear = this.lastYear;
        var index;
        var debug = 0;
        //last year
        for(var i = this.content.length - 1; i >= 0; i--) {
            var tmp = [];
            if(this.min == null) {
                this.min = parseFloat(this.content[i]["Total"]-this.vMorto);
            }
            if(this.content[i]["Data"].split("/")[2] == this.lastYear) {
                tmp.push(this.content[i]["Semana"],parseFloat(this.content[i]["Total"]-this.vMorto));
                this.lastYearContent.push(tmp);
            }
            else {
                this.lastYear = this.content[i]["Data"].split("/")[2];
                this.secondYear = this.lastYear;
                this.lastYearContent = this.lastYearContent.reverse();
                index = i;
                break;
            }
        }
        //last but one
        for(var i = index; i >= 0; i--) {
            var tmp = [];
            if(this.content[i]["Data"].split("/")[2] == this.lastYear) {
                tmp.push(this.content[i]["Semana"],parseFloat(this.content[i]["Total"]-this.vMorto));
                this.lastButOneYear.push(tmp);
            }
            else {
                this.lastYear = this.content[i]["Data"].split("/")[2];
                this.thirdYear = this.lastYear;
                this.lastButOneYear = this.lastButOneYear.reverse();
                index = i;
                break;
            }
        }

        //last but two
        for(var i = index; i >= 0; i--) {
            var tmp = [];
            if(this.content[i]["Data"].split("/")[2] == this.lastYear) {
                tmp.push(this.content[i]["Semana"],parseFloat(this.content[i]["Total"]-this.vMorto));
                this.lastButTwoYear.push(tmp);
            }
            else {
                this.lastYear = this.content[i]["Data"].split("/")[2];
                this.lastButTwoYear = this.lastButTwoYear.reverse();
                index = i;
                break;
            }
        }

        //last but three
        for(var i = index; i >= 0; i--) {
            var tmp = [];
            if(this.content[i]["Data"].split("/")[2] == this.lastYear) {
                tmp.push(this.content[i]["Semana"],parseFloat(this.content[i]["Total"]-this.vMorto));
                this.lastButThreeYear.push(tmp);
            }
            else {
                this.lastYear = this.content[i]["Data"].split("/")[2];
                this.lastButThreeYear = this.lastButThreeYear.reverse();
                index = i;
                break;
            }
        }

        //last but four
        for(var i = index; i >= 0; i--) {
            var tmp = [];
            if(this.content[i]["Data"].split("/")[2] == this.lastYear) {
                tmp.push(this.content[i]["Semana"],parseFloat(this.content[i]["Total"]-this.vMorto));
                this.lastButFourYear.push(tmp);
            }
            else {
                this.lastButFourYear = this.lastButFourYear.reverse();
                index = i;
                break;
            }
        }

        //create array for graph
        for(var week=0;week<53;week++) {
            var tmp = [];
            var averageValue = 0;
            var toDivide = 0;
            tmp.push(week+1);
            var value = this.getValue(week+1,this.lastYearContent);
            if(value!=null) {
                tmp.push(value);
                if(value < this.min) {
                    this.min = value;
                }
                averageValue += parseFloat(value);
                toDivide++;
            }
            else {
                tmp.push(null);
            }
            var value = this.getValue(week+1,this.lastButOneYear);
            if(value!=null) {
                tmp.push(value);
                if(value < this.min) {
                    this.min = value;
                }
                averageValue += parseFloat(value);
                toDivide++;
            }
            else {
                tmp.push(null);
            }
            var value = this.getValue(week+1,this.lastButTwoYear);
            if(value!=null) {
                tmp.push(value);
                if(value < this.min) {
                    this.min = value;
                }
                averageValue += parseFloat(value);
                toDivide++;
            }
            else {
                tmp.push(null);
            }
            var value = this.getValue(week+1,this.lastButThreeYear);
            if(value!=null) {
                if(value < this.min) {
                    this.min = value;
                }
                averageValue += parseFloat(value);
                toDivide++;
            }
            var value = this.getValue(week+1,this.lastButFourYear);
            if(value!=null) {
                if(value < this.min) {
                    this.min = value;
                }
                averageValue += parseFloat(value);
                toDivide++;
            }
            if(toDivide > 0) {
                averageValue = averageValue / toDivide;
                tmp.push(averageValue);
                toDivide = 0;
                averageValue = 0;
            }
            else {
                tmp.push(null);
            }
            
            this.graphArray.push(tmp);
        }

    }

    getValue(week, content) {
        for(var i = 0; i<content.length; i++) {
            if(week == content[i][0]) {
                return content[i][1];
            }
            
        }
        return null;
    }
    
  }

  