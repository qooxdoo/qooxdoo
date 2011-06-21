<?php
header("Cache-Control: no-cache");
echo md5(rand() * time());
?>