<?php
  sleep(2);

  header("Content-Type: image/gif");

  $file_handle = fopen("./colorstrip.gif", "r");
  while (!feof($file_handle)) {
     $line = fgets($file_handle);
     echo $line;
  }
  fclose($file_handle);
?>