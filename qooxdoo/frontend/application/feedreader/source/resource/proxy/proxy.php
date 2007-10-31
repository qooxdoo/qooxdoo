<?php

$url = isset($_GET['proxy']) ? $_GET['proxy'] : false;
$mode = isset($_GET['mode']) ? $_GET['mode'] : false;

if (!$url or !$mode) {
    header("HTTP/1.0 400 Bad Request");
    echo "proxy.php failed because proxy or mode parameter is missing";
    exit();
}

$session = curl_init($url);

curl_setopt($session, CURLOPT_HEADER, false);
curl_setopt($session, CURLOPT_RETURNTRANSFER, true);

$xmlContent = curl_exec($session);

if ($mode == "json")
{
    $jsonContent = json_encode(simplexml_load_string($xmlContent, 'SimpleXMLElement', LIBXML_NOCDATA));
		header("Content-Type: text/plain");
		echo($jsonContent);
}
else if ($mode == "jsonp")
{
  	$scriptId = isset($_GET['_ScriptTransport_id']) ? $_GET['_ScriptTransport_id'] : "none";
		$scriptBegin = "try{qx.io.remote.ScriptTransport._requestFinished('".$scriptId."', ";
		$scriptEnd = ");}catch(ex){};";

		$jsonContent = json_encode(simplexml_load_string($xmlContent, 'SimpleXMLElement', LIBXML_NOCDATA));
		$jsonpContent = $scriptBegin."".$jsonContent.$scriptEnd;
		header("Content-Type: text/plain");
		echo($jsonpContent);
}
else
{
		header("Content-Type: application/xml");
		echo($xmlContent);
}

curl_close($session);

?>