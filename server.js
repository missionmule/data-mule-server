const express = require('express');
const bodyParser = require('body-parser');
const fs = require('fs');
const archiver = require('archiver');
const sqlite3 = require('sqlite3').verbose();

const app = express();
const port = process.env.PORT || 5000;

const db_path = process.env.NODE_ENV === 'production' ? '/var/lib/avionics.db' : 'avionics.db';

if (process.env.NODE_ENV === 'production') {
  console.log("[PRODUCTION]")
} else {
  console.log("[DEVELOPMENT]");
}

// Connect to avionics database
let db = new sqlite3.Database(db_path, sqlite3.OPEN_READWRITE | sqlite3.OPEN_CREATE, (err) => {
  if (err) {
    console.error(err.message);
  } else {
    console.log('Connected to the avionics database.');
  }
});

db.run('CREATE TABLE IF NOT EXISTS flights(flight_id INTEGER PRIMARY KEY AUTOINCREMENT, timestamp DATETIME)');

db.run('CREATE TABLE IF NOT EXISTS stations(station_id INTEGER PRIMARY KEY, last_visited DATETIME, redownload INTEGER)');

db.run('CREATE TABLE IF NOT EXISTS flights_stations(flight_id INTEGER, station_id INTEGER, successful_downloads INTEGER, total_files INTEGER, total_data_downloaded_mb FLOAT, download_speed_mbps FLOAT, did_wake_up_ack INTEGER, did_connect INTEGER, did_find_device INTEGER, did_shutdown_ack INTEGER, wakeup_time_s INTEGER, connection_time_s INTEGER, download_time_s INTEGER, shutdown_time_s INTEGER)');

// Add timeouts and fill with default values
db.run('CREATE TABLE IF NOT EXISTS timeouts(timeout_id TEXT PRIMARY KEY, time_in_min INTEGER)');
db.run(`INSERT OR IGNORE INTO timeouts (timeout_id, time_in_min) VALUES ('wakeup', 4), ('connection', 4), ('download', 10), ('shutdown', 2)`)

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

// Allows for open CORS policy when making local requests
app.use(function(req, res, next) {
  res.header("Access-Control-Allow-Origin", "*");
  res.header("Access-Control-Allow-Headers", "Origin, X-Requested-With, Content-Type, Accept");
  next();
});

app.post('/api/logs/download', (req, res) => {

  var output = fs.createWriteStream('data.zip');
  var archive = archiver('zip');

  const logPath = process.env.NODE_ENV === 'production' ? '/var/log/mission-mule-flight.log' : './flight.log';

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
  archive.file(logPath);
  archive.finalize();
});

app.post('/api/logs/delete', (req, res) => {
  const logPath = process.env.NODE_ENV === 'production' ? '/var/log/mission-mule-flight.log' : './flight.log';

  if (fs.existsSync(logPath)) { // Avoid file doesnt exist error
    fs.unlinkSync(logPath);
  }

  // Create a new, empty file
  fs.closeSync(fs.openSync(logPath, 'w'));

  // Let the client know that the request is complete
  res.sendStatus(200);
})

app.get('/api/download', (req, res) => {

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

  const downloadDir = process.env.NODE_ENV === 'production' ? '/srv/' : './downloads/';

  // Avoid error thrown when checking directory that doesn't exist
  if (!fs.existsSync(downloadDir)) fs.mkdirSync(downloadDir);

  archive.pipe(output);
  archive.directory(downloadDir);
  archive.finalize();

});

app.get('/api/delete', (req, res) => {

  const downloadDir = process.env.NODE_ENV === 'production' ? '/srv/' : './downloads/';

  // Avoid error thrown when checking directory that doesn't exist
  if (!fs.existsSync(downloadDir)) fs.mkdirSync(downloadDir);

  var files = fs.readdirSync(downloadDir);

  // Custom HTTP response code for 'Nothing to delete'
  if (files.length == 0) {
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

    deleteFolderRecursive(downloadDir);

    // Create a clean, empty directory
    fs.mkdirSync(downloadDir);

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
  let sql = `SELECT station_id, successful_downloads, total_files, total_files, total_data_downloaded_mb, download_speed_mbps, did_wake_up_ack, did_connect, did_find_device, did_shutdown_ack, wakeup_time_s, connection_time_s, download_time_s, shutdown_time_s FROM flights_stations WHERE flight_id = ${flight.flight_id}`;
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

app.post('/api/stations/insert', (req, res) => {
  const station_id = req.body.station_id;
  let sql = `INSERT INTO stations (station_id, last_visited, redownload) VALUES (${station_id}, datetime('now'), 0)`;
  db.run(sql, [], function(err) {
    if (err) console.log(err);
    res.send("OK");
  });
});

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

  // Delete the main flight record
  let sql = `DELETE FROM flights WHERE flight_id = ${flight.flight_id}`;
  db.run(sql, [], function(err) {
    if (err) console.log(err);
  });

  // Clear out records from flights_stations as well
  sql = `DELETE FROM flights_stations WHERE flight_id = ${flight.flight_id}`;
  db.run(sql, [], function(err) {
    if (err) console.log(err);
  });

  const downloadDir = process.env.NODE_ENV === 'production' ? '/srv/' : './downloads/';
  // Next, delete data from the flight
  const deletePath = `${downloadDir}${flight.flight_id}`;

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
  const downloadDir = process.env.NODE_ENV === 'production' ? '/srv/' : './downloads/';
  const downloadPath = `${downloadDir}${flight.flight_id}`;

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

    const downloadDir = process.env.NODE_ENV === 'production' ? '/srv/' : './downloads/';

    archive.pipe(output);
    archive.directory(`${downloadDir}${flight.flight_id}`);
    archive.finalize();
  };
})

// Delete all flight records in avionics.db, all downloaded data, and clear logs
app.post('/api/reset', (req, res) => {
  // Wipe database
  db.run('DELETE FROM flights');
  db.run('DELETE FROM stations');
  db.run('DELETE FROM flights_stations');
  db.run('VACUUM');

  // Reset timeouts to default values
  db.run(`UPDATE timeouts SET time_in_min=4 WHERE timeout_id='wakeup'`);
  db.run(`UPDATE timeouts SET time_in_min=2 WHERE timeout_id='connection'`);
  db.run(`UPDATE timeouts SET time_in_min=10 WHERE timeout_id='download'`);
  db.run(`UPDATE timeouts SET time_in_min=2 WHERE timeout_id='shutdown'`);

  const deletePath = process.env.NODE_ENV === 'production' ? '/srv/' : './downloads/';

  // Avoid error thrown when checking directory that doesn't exist
  if (!fs.existsSync(deletePath)) fs.mkdirSync(deletePath);

  // Remove download data
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

  // Create clean directory
  fs.mkdirSync(deletePath)

  // Accounts for edge case of deletion of an empty directory from failed in-flight download
  if (fs.existsSync(deletePath)) fs.rmdirSync(deletePath);

  // Delete logs
  const logPath = process.env.NODE_ENV === 'production' ? '/var/log/mission-mule-flight.log' : './flight.log';

  if (fs.existsSync(logPath)) { // Avoid file doesnt exist error
    fs.unlinkSync(logPath);
  }

  // Create a new, empty file
  fs.closeSync(fs.openSync(logPath, 'w'));

  // Let the client know that the request is complete
  res.sendStatus(200);
})

app.post('/api/timeouts', (req, res) => {
  let sql = `SELECT * FROM timeouts`;

  db.all(sql, [], (err, timeouts) => {
    if (err) throw err;

    res.send(timeouts);
  });
});

app.post('/api/timeouts/update', (req, res) => {
  const update = req.body;
  sql = `UPDATE timeouts SET time_in_min=${update.time_in_min} WHERE timeout_id='${update.timeout_id}'`;
  db.run(sql, [], function(err) {
    if (err) console.log(err);
    res.send("OK");
  });
})

const server = app.listen(port, () => console.log(`Listening on port ${port}`));

// Gracefully shutdown
process.on('SIGTERM', () => { server.close() });
process.on('SIGINT', () => { server.close() });
