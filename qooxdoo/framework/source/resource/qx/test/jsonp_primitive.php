<?php
  $callback = $_GET['callback'];

  if (isset($_GET['callback'])) {
    if (!preg_match('/^[a-zA-Z_\.\[\]0-9]+\\z/', $callback)) {
      echo 'Nice try attacker';exit;
    }
    $callback = strip_tags($callback);
    $callback = str_replace(array("(", ")"), "", $callback);
  }

  if (isset($_GET['sleep'])) {
    usleep($_GET['sleep'] * 1000);
  }

  echo $callback . '({"string": "String", "number": 12, "boolean": true, "null": null});'
?>