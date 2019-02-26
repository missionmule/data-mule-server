const express = require('express');
const bodyParser = require('body-parser');
const fs = require('fs');
const archiver = require('archiver');
const sqlite3 = require('sqlite3').verbose();

const app = express();
const port = process.env.PORT || 5000;


process.on('SIGTERM', () => {
  console.log("Shutting down...");
  db.close();
  console.log("Bye.");
});

process.on('exit', () => {
  console.log("Shutting down...");
  db.close();
  console.log("Bye.");
});

const db_path = '/var/lib/avionics.db';

// Connect to avionics database
let db = new sqlite3.Database(db_path, sqlite3.OPEN_READWRITE, (err) => {
  if (err) {
    console.error(err.message);
  } else {
    console.log('Connected to the avionics database.');
  }
});

app.use(bodyParser.json());
app.use(bodyParser.urlencoded({ extended: true }));

app.get('/api/hello', (req, res) => {
  res.send({ express: 'Hello From Express' });
});

app.post('/api/world', (req, res) => {
  console.log(req.body);
  res.send(
    `I received your POST request. This is what you sent me: ${req.body.post}`,
  );
});

app.get('/api/download', (req, res) => {

  console.log("Zipping files...");

  var output = fs.createWriteStream('data.zip');
  var archive = archiver('zip');

  output.on('close', function () {
    console.log("Zipping complete");

    const src = fs.createReadStream('./data.zip');

    console.log("Beginning download...");

    // Pipe read stream to client
    src.pipe(res);

    src.on('error', function(err) {
      throw(err);
    });

    // Once the piped download is complete, delete the generated zip
    src.on('close', () => {
      console.log("Download complete");
      fs.unlinkSync('./data.zip');
    });

  });

  archive.on('error', function(err){
    throw err;
  });

  archive.pipe(output);
  archive.directory('./download/');
  archive.finalize();

});

app.get('/api/delete', (req, res) => {

  console.log("Emptying download directory...");

  // Avoid error thrown when checking directory that doesn't exist
  if (!fs.existsSync('./download/')) fs.mkdirSync('./download/');

  var files = fs.readdirSync('./download/');

  // Custom HTTP response code for 'Nothing to delete'
  if (files.length == 0) {
    console.log("Nothing to delete");
    res.statusMessage = "Nothing to delete";
    res.status(540).end();
  } else {
    var deleteFolderRecursive = function(path) {
      if( fs.existsSync(path) ) {
        fs.readdirSync(path).forEach(function(file,index){
          var curPath = path + "/" + file;
          if(fs.lstatSync(curPath).isDirectory()) { // recurse
            deleteFolderRecursive(curPath);
          } else { // delete file
            fs.unlinkSync(curPath);
          }
        });
        fs.rmdirSync(path);
      }
    };

    deleteFolderRecursive('./download/');

    // Create a clean, empty directory
    fs.mkdirSync('./download/');

    console.log("Download directory emptied");

    // Let the client know that the request is complete
    res.sendStatus(200);
  }
});

app.post('/api/stations', (req, res) => {
  let sql = `SELECT * FROM stations`;

  db.all(sql, [], (err, stations) => {
    if (err) throw err;

    res.send(stations);
  });
});

async function getFlights() {
  let sql = `SELECT * FROM flights ORDER BY timestamp DESC`;
  return new Promise(function(resolve, reject) {
    db.all(sql, [], (err, flights) => {
      if (err) reject(err);
      resolve(flights);
    });
  });
}

async function getStations(flight) {
  let sql = `SELECT station_id, successful_downloads, total_files FROM flights_stations WHERE flight_id = ${flight.flight_id}`;
  return new Promise(function(resolve, reject) {
    db.all(sql, [], (err, stations) => {
      if (err) reject(err);
      resolve(stations);
    });
  });
}

app.post('/api/stations/update', (req, res) => {
  const update = req.body;
  let sql = `UPDATE stations SET redownload = ${update.redownload} WHERE station_id = ${update.station_id}`;
  db.run(sql, [], function(err) {
    if (err) console.log(err);
    res.send("OK");
  });
})

app.post('/api/flights', async (req, res) => {

  let flightsStations = [];

  try {
    const flights = await getFlights();
    for (let flight of flights) {
      flight.stations = await getStations(flight);
      flightsStations.push(flight);
    }

  } catch(err) {
    console.log(err);
  }
  res.send(flightsStations);
});

// Delete flight row from database and downloaded data on disk
app.post('/api/flights/delete', (req, res) => {

  // First, clear flight from database
  const flight = req.body;

  let sql = `DELETE FROM flights WHERE flight_id = ${flight.flight_id}`;
  db.run(sql, [], function(err) {
    if (err) console.log(err);
  });

  // Next, delete data from the flight
  const deletePath = `./download/${flight.flight_id}`;

  // Avoid error thrown when checking directory that doesn't exist
  if (!fs.existsSync(deletePath)) fs.mkdirSync(deletePath);

  var files = fs.readdirSync(deletePath);

  if (files.length !== 0) {
    var deleteFolderRecursive = function(path) {
      if( fs.existsSync(path) ) {
        fs.readdirSync(path).forEach(function(file,index){
          var curPath = path + "/" + file;
          if(fs.lstatSync(curPath).isDirectory()) { // recurse
            deleteFolderRecursive(curPath);
          } else { // delete file
            fs.unlinkSync(curPath);
          }
        });
        fs.rmdirSync(path);
      }
    };

    deleteFolderRecursive(deletePath);

  }

  // Accounts for edge case of deletion of an empty directory from failed in-flight download
  if (fs.existsSync(deletePath)) fs.rmdirSync(deletePath);

  // Let the client know that the request is complete
  res.sendStatus(200);

});

app.post('/api/flights/download', (req, res) => {

  const flight = req.body;
  const downloadPath = `./download/${flight.flight_id}`;

  // Avoid error thrown when checking directory that doesn't exist
  if (!fs.existsSync(downloadPath)) fs.mkdirSync(downloadPath);

  if (fs.readdirSync(downloadPath).length === 0) {
    res.sendStatus(204); // Standard code: HTTP/1.1 10.2.5 204 No Content
  } else {
    var output = fs.createWriteStream('data.zip');
    var archive = archiver('zip');

    output.on('close', function () {

      const src = fs.createReadStream('./data.zip');
      // Pipe read stream to client
      src.pipe(res);

      src.on('error', function(err) {
        throw(err);
      });

      // Once the piped download is complete, delete the generated zip
      src.on('close', () => {
        fs.unlinkSync('./data.zip');
      });

    });

    archive.on('error', function(err){
      throw err;
    });

    archive.pipe(output);
    archive.directory(`./download/${flight.flight_id}`);
    archive.finalize();
  };
})

app.listen(port, () => console.log(`Listening on port ${port}`));
