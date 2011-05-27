<?php
  if (!isset($_GET['callback'])) {
    echo 'Please supply a callback parameter';exit;
  }

  $callback = $_GET['callback'];
  if (!preg_match('/^[a-zA-Z_\.\[\]0-9]+\\z/', $callback)) {
    echo 'Nice try attacker';exit;
  }

  if (isset($_GET['sleep'])) {
    usleep($_GET['sleep'] * 1000);
  }
  
  $callback = strip_tags($_GET['callback']);
  $callback = str_replace(array("(", ")"), "", $callback);
  echo $callback . '({"string": "String", "number": 12, "boolean": true, "null": null});'
?>