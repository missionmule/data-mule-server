<?php
  /* This file lists all sensor data and logs gathered by the data mule
     and makes the data available for download on the client. */

  $sensor_log_dir = "/srv/logs/";
  $sensor_data_dir = "/srv/data/";

  $sensor_log_files = scandir($sensor_log_dir);
  $sensor_log_files = array_diff($sensor_log_files, array('.', '..')); # Remove . and ..

  $sensor_data_files = scandir($sensor_data_files);
  $sensor_data_files = array_diff($sensor_data_files, array('.', '..')); # Remove . and ..

  foreach($sensor_data_files as $file) {
    echo "<a href='download.php?file=".$file."'>".$file."</a><br>";
  }
 ?>
