<?php

parse_str($_GET['_data_'], $output);
echo json_encode($output);

?>