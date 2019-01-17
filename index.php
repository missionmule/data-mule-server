<?php
// Create ZIP file
if(isset($_POST['create'])){
 $zip = new ZipArchive();
 $filename = "/tmp/flight-data.zip";

 if ($zip->open($filename, ZipArchive::CREATE)!==TRUE) {
  exit("cannot open <$filename>\n");
 }

 $dir = '/srv/flight-data/';

 // Create zip
 createZip($zip,$dir);

 $zip->close();

 $filename = "/tmp/flight-data.zip";

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

      if($file != '' && $file != '.' && $file != '..' && $file != 'srv'){

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

// Clear download data
if(isset($_POST['delete'])){

  function rrmdir($src) {
    $dir = opendir($src);
    while(false !== ( $file = readdir($dir)) ) {
        if (( $file != '.' ) && ( $file != '..' )) {
            $full = $src . '/' . $file;
            if ( is_dir($full) ) {
                rrmdir($full);
            }
            else {
                unlink($full);
            }
        }
    }
    closedir($dir);
    rmdir($src);
  }

  rrmdir('/srv/flight-data');
}

?>
<!doctype html>
<html>
    <head>
      <title>Download UAS Data</title>
      <link href='style.css' rel='stylesheet' type='text/css'>
    </head>
    <body>
        <div class='container'>
            <h1>Download UAS Data</h1>
        <form method='post' action=''>
            <input type='submit' name='create' value='Download All Data' />&nbsp;
            <input type='submit' name='delete' value='Delete All Data' />&nbsp;
        </form>
        </div>
    </body>
</html>
