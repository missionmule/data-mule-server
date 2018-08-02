<?php

  function createZipFromDir($dir, $zip_file) {
      $zip = new ZipArchive();
      if(true !== $zip->open($zip_file, ZIPARCHIVE::CREATE | ZIPARCHIVE::OVERWRITE)) {
          return false;
      }

      zipDir(
          // base dir, note we use a trailing separator from now on
          rtrim($dir, DIRECTORY_SEPARATOR) . DIRECTORY_SEPARATOR,
          // subdir, empty on initial call
          null,
          // archive ref
          $zip
      );
      return $zip;
  }

  function zipDir($dir, $subdir, $zip) {

      // using real path
      $files = scandir($dir.$subdir);

      foreach($files as $file) {

          if(in_array($file, array('.', '..')))
              continue;

          // check dir using real path
          if(is_dir($dir.$subdir.$file)) {

              // create folder using relative path
              $zip->addEmptyDir($subdir.$file);

              zipDir(
                  $dir,                              // remember base dir
                  $subdir.$file.DIRECTORY_SEPARATOR, // relative path, don't forget separator
                  $zip                               // archive
              );
          }

          // file
          else {
              // get real path, set relative path
              $zip->addFile($dir.$subdir.$file, $subdir.$file);
          }
      }
  }

  createZipFromDir('/', 'srv');

?>
