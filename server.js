const express = require('express');
const bodyParser = require('body-parser');
const fs = require('fs');
const archiver = require('archiver');

const app = express();
const port = process.env.PORT || 5000;

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

app.listen(port, () => console.log(`Listening on port ${port}`));
