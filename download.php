<?php
  $filename = basename($_GET['file']);
  $path = basename($_GET['path']);

  $download_file = "/srv/".$path."/".$filename;

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
