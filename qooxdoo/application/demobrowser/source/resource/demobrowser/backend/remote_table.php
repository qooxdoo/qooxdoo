<?php
  // set the default timezone to use. Available since PHP 5.1
  date_default_timezone_set('UTC');

  $method = $_GET["method"];
  
  if ($method == "getRowCount") {
    echo 10000;
  } else if ($method == "getRowData") {
    $firstRow = $_GET["start"];
    $lastRow = $_GET["end"];
    
    $data = "[";
    for ($i=0; $i < ($lastRow - $firstRow) + 1; $i++) { 
      $id = $i + $firstRow;
      $data .= "{\"id\" : \"". $id . "\", \"text\" : \"Requested on " . date("F j, Y, g:i:s a") . " using PHP.\"},";
    }
    echo substr($data, 0, strlen($data) - 1) . "]";
  } else {
    echo "WTF PHP";
  }
?>