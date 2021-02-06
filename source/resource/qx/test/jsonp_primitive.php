<?php
  $callback = '';

  if (isset($_GET['callback'])) {
      $callback = $_GET['callback'];
      if (!preg_match('/^[a-zA-Z_\.\[\]0-9]+\z/', $callback)) {
        echo 'No valid callback'; exit;
      }
  }

  if (isset($_GET['sleep'])) {
    $sleep = (int) $_GET['sleep'];
    if ($sleep > 0 && $sleep <= 100) {
        usleep($sleep * 1000);
    }
  }

  echo $callback . '({"string": "String", "number": 12, "boolean": true, "null": null});';
?>