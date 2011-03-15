<?php
header("Content-type: text/plain");

// Minimum start for Webkit
echo str_pad('',1024);

$time = time();
while((time() - $time) < $_GET['duration']) {
    // Firefox requires line break
    echo ".\n";

    // Write to client
    flush();

    usleep(100000);
}

?>

