var fs = require("fs");
var express = require('express');
var http = require("http");
var url = require("url");
var path = require('path');
var schedule = require('node-schedule');
var shp = require('shpjs');
var spawn = require("child_process").spawn;


/*instant runns on server starting*/
scheduleJobs()


/*globals*/
var location;
var caudaisLocation;
var delineation;
var stations = {};
var caudais = {};
var forecastLocation;
var forecastData;
var volumesData;
var jsonData;
var maranhaoShape;
var maranhaoLimits;
var montargilShape;
var montargilLimits;


const options = {
	
};
const app = express();

let winston = require('winston');

let logger = winston.createLogger({
    level: 'info',
    format: winston.format.combine(
        winston.format.timestamp(),
        winston.format.printf(info => {
            return `${info.timestamp} ${info.level}: ${info.message}`;
        })
    ),
    transports: [new winston.transports.File({filename: 'logfile.log'})]
});

app.use((req,res) => {
	res.setHeader("Access-Control-Allow-Origin","*");
	res.setHeader("Access-Control-Allow-Headers", "Origin, X-Requested-With, Content-Type, Accept");
	var q = url.parse(req.url, true).query;
	if(q.file == "Area") {
		//console.log(delineation);
		res.send(delineation);
	}
	else if(q.file == "Locations" || q.barragem) {
		//console.log(location);
		res.send(location);
	}
	else if(q.file == "LocationsForecast" || q.barragemPrevista) {
		//console.log(forecastLocation);
		res.send(forecastLocation);
	}
	else if(q.file == "LocationsCaudais" || q.caudal) {
		//console.log(caudaisLocation);
		res.send(caudaisLocation);
	}
	else if(q.file == "maranhaoShapefile") {
		res.send(maranhaoShape)
	}
	else if(q.file == "maranhaoDelineation") {
		res.send(maranhaoLimits)
	}
	else if(q.file == "montargilShapefile") {
		res.send(montargilShape)
	}
	else if(q.file == "montargilDelineation") {
		res.send(montargilLimits)
	}
	else if(q.chart && q.b) {
		console.log("Sending stations information...")
		res.send(stations[q.b][q.chart]);
		console.log("Finished sending stations information.")
	} 
	else if(q.chart && q.bp) {
		console.log("Sending forecast information...");
		res.send(FindForecastBarragem(q.bp,q.chart));
		console.log("Finished sending forecast information.");
	}
	else if(q.chart && q.c) {
		console.log("Sending caudais information...");
		res.send(caudais[q.c][q.chart]);
		console.log("Finished sending caudais information.");
	}
	else if(q.file == "data") {
		console.log("Sending Data...");
		res.send(jsonData)
		console.log("Finished sending Data...");
	}
	else if(q.file == "volumesData") {
		console.log("Sending volumes Data information...");
		res.send(volumesData)
		console.log("Finished sending volumes Data information.");
	}
});

http.createServer(app).listen(8003);

schedule.scheduleJob('0 */2 * * *', function(){
	scheduleJobs();
});
function scheduleJobs(){
	console.log('Scheduler starting...');
	
	fs.readFile(__dirname + "/../OMEGA/js/estaciones/Delineation.geojson", "UTF8", function(err, data) {
		if (err) { 
			logger.log('Error on reading delineation file.', err);
			fs.readFile(__dirname + "/data/delineation.dat", function(error, data) {
				if (error) { return console.error(error); }
				delineation = JSON.parse(data);
				console.log("Error on delineation file fixed.");
			});
		} else {
			delineation = data;
			fs.writeFile(__dirname + "/data/delineation.dat", JSON.stringify(delineation), function(error) {
				if (error) {
					console.log('Error on writing delineation file.', error);
					throw error;
				}
			});
		}
	});

	fs.readFile(__dirname + "/forecast//LocationsForecast.json", "UTF8", function(err, data) {
		if (err) { 
			logger.log('error', err);
			throw err
		};
		forecastLocation = JSON.parse(data);
	});

	fs.readFile(__dirname + "/caudais//LocationsCaudais.json", "UTF8", function(err, data) {
		if (err) { 
			logger.log('error', err);
			throw err
		};
		caudaisLocation = JSON.parse(data);
	});

	fs.readFile(__dirname + "/../OMEGA/js/caudais/maranhaoShapefile.json", "UTF8", function(err, data) {
		if (err) {
			logger.log('error', err);
			throw err
		};
		maranhaoShape = data;
	});

	fs.readFile(__dirname + "/../OMEGA/js/caudais/maranhaoDelineation.json", "UTF8", function(err, data) {
		if (err) {
			logger.log('error', err);
			throw err
		};
		maranhaoLimits = data;
	});

	fs.readFile(__dirname + "/../OMEGA/js/caudais/montargilShapefile.json", "UTF8", function(err, data) {
		if (err) {
			logger.log('error', err);
			throw err
		};
		montargilShape = data;
	});

	fs.readFile(__dirname + "/../OMEGA/js/caudais/montargilDelineation.json", "UTF8", function(err, data) {
		if (err) {
			logger.log('error', err);
			throw err
		};
		montargilLimits = data;
	});

	fs.readFile(__dirname + "/../excelExtractor/volumes/data.json", "UTF8", function(err, data) {
		if (err) { 
			logger.log('error', err);
			throw err
		};
		jsonData = JSON.parse(data);
	}); 

	fs.readFile(__dirname + "/Locations.json", "UTF8", function(err, data) {
		if (err) {
			logger.log('error', err); 
			throw err 
		};
		try {
			location = JSON.parse(data);
			for(let i=0; i<location.Barragens.length; i++) {
				if(location.Barragens[i].Folder) {
					stations[location.Barragens[i].Folder] = [];
					for(var a = 0; a < location.Indicadores.length; a++) {
						
						stations[location.Barragens[i].Folder][location.Indicadores[a].Folder] = 
						convertToJSON(populateFields(location.Indicadores[a],location.Barragens[i].Folder,location.NumberOfElements),location.Indicadores[a]);
					}
				}
			}
		}
		catch(err) {
			logger.log('error', err);
		}
	});

	fs.readFile(__dirname + "/caudais/LocationsCaudais.json", "UTF8", function(err, data) {
		if (err) {
			logger.log('error', err);
			throw err
		};
		try {
			caudaisLocation = JSON.parse(data);
			for(i=0; i<caudaisLocation.Caudais.length; i++) {
				if (caudaisLocation.Caudais[i].Folder) {
					caudais[caudaisLocation.Caudais[i].Folder] = [];
					for(var a = 0; a<caudaisLocation.Indicadores.length; a++) {
						caudais[caudaisLocation.Caudais[i].Folder][caudaisLocation.Indicadores[a].Folder] =
						convertToJSON(populateCaudaisFields(caudaisLocation.Indicadores[a], caudaisLocation.Caudais[i].Folder, caudaisLocation.NumberOfElements), caudaisLocation.Indicadores[a]);
					}
				}
			}
		}
		catch(err) {
			logger.log('error', err);
		}
	});

	forecast();
	extractExcel();
	extractSnirhStations();
	extractCaudais();
	console.log("Scheduler finished all tasks.");
}


function populateFields(indicador,folder,numberOfElements) {
	let handler = [];
	for(let i = 0;i < indicador.SubIndicadores.length; i++) {
		try { 
			let fileName = indicador.Folder+"_"+indicador.SubIndicadores[i]+".dat";
			let file = fs.readFileSync(__dirname + "/" + location.RelativePath + "/" + folder + "/" + fileName, "UTF8").toString().replace("\r","").split("\n").map(function(line){
				return line.trim();
			}).filter(Boolean);
			handler.push(file.slice(Math.max(file.length - numberOfElements, 0)));
		}
		catch(err){
			continue;
		}
	}
	return handler;
}

function populateCaudaisFields(indicador,folder,numberOfElements) {
	let handler = [];
	for(let i = 0;i < indicador.SubIndicadores.length; i++) {
		try { 
			let fileName = indicador.Folder+"_"+indicador.SubIndicadores[i]+".dat";
			let file = fs.readFileSync(caudaisLocation.AbsolutePath + "/" + folder + "/" + fileName, "UTF8").toString().replace("\r","").split("\n").map(function(line){
				return line.trim();
			}).filter(Boolean);
			handler.push(file.slice(Math.max(file.length - numberOfElements, 0)));
		}
		catch(err){
			continue;
		}
	}
	return handler;
}

function convertToJSON(data,indicador) {
	let handler = [];
	if(data.length==0) {
		return null;
	}
	for(let i = 0; i < data[0].length; i++) {
		let line = {};
		for(let k = 0; k < data.length; k++) {
			if(k==0) {
				 let d = new Date(data[k][i].split(",")[0]);
				 line["date"] = d.getDate() + "/" + (d.getMonth()+1) + "/" + d.getFullYear();
			}
			line[indicador.SubIndicadores[k]]= parseFloat(data[k][i].split(",")[1]);
		}
		handler.push(line);
		//break;
	}
	return handler;
}

function forecast() {
	let chunks = "";
	const pythonProcess = spawn('python3',[__dirname + "/forecast/teste.py", "--path", "forecast/"])
	pythonProcess.stdout.on('data', (data) => {
		chunks += data;
	});
	pythonProcess.stderr.on('data', (data) => {
		console.log(`stderr: ${data}`);
	});
	
	pythonProcess.on('close', (code) => {
		console.log(`child process exited with code ${code}`);
		try {
			forecastData = JSON.parse(chunks.toString());
			console.log("Finished extracting forecast data.")
		}
		catch(err) {
			console.log(err.stack);
			logger.log('error', err.stack);
		}

	});
}

function FindForecastBarragem(name,chart) {
	for(let i = 0;i<forecastData["Barragens"].length;i++) {
		console.log(i);
		if(forecastData["Barragens"][i]["Nome"]==name) {
			for(let a = 0;a<forecastData["Barragens"][i]["HdfParameters"].length;a++) {
				if(forecastData["Barragens"][i]["HdfParameters"][a]["Param"]==chart) {
					//console.log(forecastData["Barragens"][i]["HdfParameters"][a]["Param"])
					return forecastData["Barragens"][i]["HdfParameters"][a]["Data"]
				}
			}
		}
	}
}

function extractExcel() {
	console.log("Extracting Excel information...");
	let chunks = "";
	const pythonProcess = spawn('python3',[__dirname + "/../excelExtractor/excelExtractor.py", "--path", "/../excelExtractor/"])
	pythonProcess.stdout.on('data', (data) => {
		chunks += data;
	});
	pythonProcess.stderr.on('data', (data) => {
		console.log(`stderr: ${data}`);
	});
	
	pythonProcess.on('close', (code) => { 
		console.log(`excel child process exited with code ${code}`);
		try {
			volumesData = JSON.parse(chunks.toString());
			console.log("Finished extracting Excel.");
		}
		catch(err) {
			console.log(err.stack);
			logger.log('error', err.stack);
		}

	});
}  

  
function extractSnirhStations() {
	console.log('Extracting SNIRH stations...');
	var today = new Date(); 
	var olddate = new Date(today);
	var timeWindow = 30*120; // window of time in days between strdate and enddate
	olddate.setDate(olddate.getDate() - timeWindow);
	var strdate = olddate.getDate() + "/" + (Number(olddate.getMonth()+1)) + "/" + olddate.getFullYear();
	var enddate = today.getDate() + "/" + (Number(today.getMonth()+1)) + "/" + today.getFullYear();
	var stations = [[920685126, "brotas"], [920685210, "castelodevide"], [920685252, "chouto"], 
					[920685498, "monforte"], [920686118, "pavia"], [920685910, "valedopeso"]];
	var spawn = require("child_process").spawn;
	var process = spawn('python', ["./stations/extractSnirh.py", 
									"http://snirh.apambiente.pt/snirh/_dadosbase/site/paraCSV/dados_csv.php", 
									[413026594],
									strdate,
									enddate,
									stations]); 

	process.stderr.on('data', (data) => {
		console.log(`stderr: ${data}`);
	});
	console.log('Finished extracting SNIRH stations.');
}


function extractCaudais() {
	console.log('Extracting Caudais information...');
	const pythonProcess = spawn('python3',[__dirname + "/caudais/extractSRN.py", "--path", "/caudais"])
	pythonProcess.on('close', (code) => { 
		try {
			console.log("Finished extracting Caudais information.");
		}
		catch(err) {
			console.log(err.stack);
			logger.log('error', err.stack);
		}
	});
}
