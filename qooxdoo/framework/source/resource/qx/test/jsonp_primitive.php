<?php
  echo strip_tags($_GET['callback']) . '({"string": "String", "number": 12, "boolean": true, "null": null});'
?>