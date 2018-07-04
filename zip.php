<?php
  $root_path = basename($_GET['zip-dir']);

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
?>
