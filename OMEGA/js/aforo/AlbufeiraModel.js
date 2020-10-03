function abstractFromModel(obj) {
    location.replace("http://omega.maretec.org/html/volumes/volumes.html");
    return function () {
        document.getElementById("semanaAtual").style.display = "none";
        document.getElementById("mainMap").style.display = "none";
        document.getElementById("legend").style.display = "none";
        document.getElementById("map").style.display = "block";
        obj.clean("chart");
        obj.clean("informations");
        obj.clean("map");

        obj.displayChart(obj);
        obj.generateInfoTable(obj);
        obj.initMap(obj);
        obj.hideOverlay();

      };
}