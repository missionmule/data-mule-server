<?php
  $filename = basename($_GET['file']);
  $path = '/srv/';

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
