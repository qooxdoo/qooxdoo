<?php

if (isset($_GET['sleep'])) {
  sleep($_GET['sleep']);
}

echo json_encode($_GET);
?>