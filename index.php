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
      $sensor_data_dir = "/srv/field/";

      $sensor_log_files = scandir($sensor_log_dir);
      $sensor_log_files = array_diff($sensor_log_files, array('.', '..')); # Remove . and ..

      $sensor_data_files = scandir($sensor_data_dir);
      $sensor_data_files = array_diff($sensor_data_files, array('.', '..')); # Remove . and ..

      /*echo "<h1>Sensor Data</h1>";
      foreach($sensor_data_files as $file) {
        foreach($sensor_data_files as $file) {
          echo "<a href='download.php?file=".$file."&amp;path=data'>".$file."</a><br>";
        }
        echo "<a href='download.php?file=".$file."&amp;path=data'>".$file."</a><br>";
      }

      echo "<h1>Logs</h1>";
      foreach($sensor_log_files as $file) {
        echo "<a href='download.php?file=".$file."&amp;path=logs'>".$file."</a><br>";
      }
      */

      echo "<a href='zip.php?dir=/srv'>Download Data</a><br>";


     ?>
  </body>
</html>
