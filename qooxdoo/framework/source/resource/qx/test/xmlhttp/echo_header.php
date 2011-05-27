<?php
$a = getallheaders();
if (isset($a['COOKIE'])) unset($a['COOKIE']);
echo json_encode($a);
?>