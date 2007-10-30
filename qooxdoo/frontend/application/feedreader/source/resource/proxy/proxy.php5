<?php

require_once("xml2json.php5");

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
    $jsonContent = xml2json::transformXmlStringToJson($xmlContent);
		header("Content-Type: application/json");
		echo($jsonContent);
}
else if ($mode == "jsonp")
{
  	$scriptId = isset($_GET['_ScriptTransport_id']) ? $_GET['_ScriptTransport_id'] : "none";
		$scriptBegin = "try{qx.io.remote.ScriptTransport._requestFinished('".$scriptId."', ";
		$scriptEnd = ");}catch(ex){};";
    $jsonContent = xml2json::transformXmlStringToJson($xmlContent);
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