<!doctype html>

<html lang="en">
  <head>
    <meta charset="utf-8">

    <title>Mission Mule</title>
    <meta name="description" content="Download retrieved data from data stations">

    <link rel="stylesheet" href="css/styles.css?v=1.0">

    <!--[if lt IE 9]>
      <script src="https://cdnjs.cloudflare.com/ajax/libs/html5shiv/3.7.3/html5shiv.js"></script>
    <![endif]-->
  </head>

  <body>
    <?php
      /* This file lists all sensor data and logs gathered by the data mule
         and makes the data available for download on the client. */

      $sensor_log_dir = "/srv/logs/";
      $sensor_data_dir = "/srv/data/";

      $sensor_log_files = scandir($sensor_log_dir);
      $sensor_log_files = array_diff($sensor_log_files, array('.', '..')); # Remove . and ..

      $sensor_data_files = scandir($sensor_data_dir);
      $sensor_data_files = array_diff($sensor_data_files, array('.', '..')); # Remove . and ..

      foreach($sensor_data_files as $file) {
        echo "<a href='download.php?file=".$file."'>".$file."</a><br>";
      }

      echo "<a href='zip.php'?zip-dir=".$sensor_data_dir."'>Download</a><br>";
     ?>
  </body>
</html>
