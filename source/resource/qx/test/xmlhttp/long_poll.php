<?php
header("Cache-Control: no-cache");

# Wait 200ms
usleep(200 * 1000);
echo microtime(true);
?>
