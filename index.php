<?php
// Create ZIP file
if(isset($_POST['create'])){
 $zip = new ZipArchive();
 $filename = "/tmp/data.zip";

 if ($zip->open($filename, ZipArchive::CREATE)!==TRUE) {
  exit("cannot open <$filename>\n");
 }

 $dir = '/srv/flight-data';

 // Create zip
 createZip($zip,$dir);

 $zip->close();
}

// Create zip
function createZip($zip,$dir){
 if (is_dir($dir)){

  if ($dh = opendir($dir)){
   while (($file = readdir($dh)) !== false){

    // If file
    if (is_file($dir.$file)) {
     if($file != '' && $file != '.' && $file != '..'){

      $zip->addFile($dir.$file);
     }
    }else{
     // If directory
     if(is_dir($dir.$file) ){

      if($file != '' && $file != '.' && $file != '..'){

       // Add empty directory
       $zip->addEmptyDir($dir.$file);

       $folder = $dir.$file.'/';

       // Read data of the folder
       createZip($zip,$folder);
      }
     }

    }

   }
   closedir($dh);
  }
 }
}

// Download Created Zip file
if(isset($_POST['download'])){

 $filename = "/tmp/data.zip";

 if (file_exists($filename)) {
  header('Content-Type: application/zip');
  header('Content-Disposition: attachment; filename="'.basename($filename).'"');
  header('Content-Length: ' . filesize($filename));

  flush();
  readfile($filename);
  // delete file
  unlink($filename);

 }
}
?>
<!doctype html>
<html>
    <head>
      <title>Mission Mule Flight Data</title>
      <link href='style.css' rel='stylesheet' type='text/css'>
    </head>
    <body>
        <div class='container'>
            <h1>Download UAS Data</h1>
        <form method='post' action=''>
            <input type='submit' name='create' value='Create Zip' />&nbsp;
            <input type='submit' name='download' value='Download' />
        </form>
        </div>
    </body>
</html>
