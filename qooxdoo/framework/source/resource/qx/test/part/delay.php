<?php

if (isset($_GET['sleep'])) {
  sleep($_GET['sleep']);
}

echo file_get_contents("file1.js");
?>