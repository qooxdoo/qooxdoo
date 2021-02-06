<?php
if (!isset($_GET['_data_'])) {
$_GET['_data_'] = '';
}

parse_str($_GET['_data_'], $output);
echo json_encode($output);

?>