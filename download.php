<?php
  $filename = basename($_GET['file']);
  $path = basename($_GET['path']);

  echo "File: ".$filename;
  echo "Path: ".json_encode($path, JSON_UNESCAPED_SLASHES);


  $download_file = $path.$filename;

  if (!empty($filename)){
    // Check if file exists
    if(file_exists($download_file)) {
      header('Content-Disposition: attachment; filename='.$filename);
      readfile($download_file);
      exit;
    }
    else {
      echo 'File does not exist on given path';
    }
  }
?>
