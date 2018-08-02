<?php

  $root_path = basename($_GET['dir']);

  $zipname = 'MissionData.zip';
  $zip = new ZipArchive;
  $zip->open($zipname, ZipArchive::CREATE);
  if ($handle = opendir($root_path)) {
    while (false !== ($entry = readdir($handle))) {
      if ($entry != "." && $entry != ".." && !strstr($entry,'.php')) {
          $zip->addFile($entry);
      }
    }
    closedir($handle);
  }

  $zip->close();

  header('Content-Type: application/zip');
  header("Content-Disposition: attachment; filename='MissionData.zip'");
  header('Content-Length: ' . filesize($zipname));
  header("Location: MissionData.zip");

?>

  <!-- $root_path = basename($_GET['dir']);



  $zip = new ZipArchive();
  $zip->open('data-mule.zip', ZipArchive::CREATE | ZipArchive::OVERWRITE);

  $files = new RecursiveIteratorIterator(
    new RecursiveDirectoryIterator($root_path),
    RecursiveIteratorIterator::LEAVES_ONLY
  );

  foreach ($files as $name => $file) {
    if (!$file->isDir()){
      $file_path = $file->getRealPath();
      $relative_path = substr($file_path, strlen($root_path) + 1);

      $zip->addFile($file_path, $relative_path);
    }
  }
  $zip->close();
?> -->
