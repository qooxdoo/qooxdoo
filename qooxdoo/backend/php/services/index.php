<?php
  /*
   * qooxdoo - the new era of web interface development
   *
   * Copyright:
   *   (C) 2006 by Derrell Lipman
   *       All rights reserved
   *
   * License:
   *   LGPL 2.1: http://creativecommons.org/licenses/LGPL/2.1/
   *
   * Internet:
   *   * http://qooxdoo.org
   *
   * Author:
   *   * Derrell Lipman
   */

  /*
   * This is a simple JSON-RPC server.  We receive a service name in
   * dot-separated path format and expect to find the class containing the
   * service in a file of the service name (with dots converted to slashes and
   * ".php" appended).
   */

require "JSON.phps";

define("servicePathPrefix",                "/var/www/services/");

/*
 * JSON-RPC error codes
 */
define("JsonRpcError_IllegalService",      1);
define("JsonRpcError_ServiceNotFound",     2);
define("JsonRpcError_ClassNotFound",       3);
define("JsonRpcError_MethodNotFound",      4);
define("JsonRpcError_ParameterMismatch",   5);
define("JsonRpcError_PermissionDenied",    6);

/* Handled HTTP error codes in range { -1, [200, 13030] } */

define("JsonRpcError_FIRST_APPLICATION_ERROR",    16384);


/*
 * class JsonRpcError
 *
 * This class allows service methods to easily provide error information for
 * return via JSON-RPC.
 */
class JsonRpcError
{
    var             $json;
    var             $data;
    var             $id;
    
    function JsonRpcError($json,
                          $code = JsonRpcError_Unknown,
                          $message = "Unknown error")
    {
        $this->json = $json;
        $this->data = array("code" => $code, "message" => $message);
    }
    
    function SetError($code, $message)
    {
        $this->data["code"] = $code;
        $this->data["message"] = $message;
    }
    
    function SetId($id)
    {
        $this->id = $id;
    }
    
    function SendAndExit()
    {
        $error = $this;
        $id = $this->id;
        $ret = array("error" => $this->data, "id" => $id);
        print $this->json->encode($ret);
        exit;
    }
}

function debug($str)
{
    static $fw = null;
    if ($fw === null)
    {
        $fw = fopen("/tmp/phpinfo", "w");
    }
    fputs($fw, $str, strlen($str));
    fflush($fw);
}



/* Ensure we received POST data */
if ($_SERVER["REQUEST_METHOD"] != "POST")
{
    /*
     * This request was not issued with JSON-RPC so echo the error rather than
     * issuing a JsonRpcError response.
     */
    echo "Services require POST using JSON-RPC<br>";
    exit;
}

/*
 * Create a new instance of JSON and get the JSON-RPC request from
 * the POST data.
 */
$json = new JSON();
$input = file_get_contents('php://input', 1000000);

/*
 * If this was form data (as would be received via an IframeTransport
 * request), we expect "_data_=<url-encoded-json-rpc>"; otherwise
 * (XmlHttpTransport) we'll have simply <json-rpc>, not url-encoded and with
 * no "_data_=".  The "Content-Type" field should be one of our two supported
 * variants: text/json or application/x-json-form-urlencoded.  If neither, or
 * if there is more than one form field provided or if the first form field
 * name is not '_data_', it's an error.
 */
switch($_SERVER["CONTENT_TYPE"])
{
case "text/json":
    /* We found literal POSTed json-rpc data (we hope) */
    $jsonInput = $json->decode($input);
    break;
    
case "application/x-www-form-urlencoded":
    /* It's a form.  See what fields were provided */
    if (count($_POST) == 1 && isset($_POST["_data_"]))
    {
        /* $_POST["_data_"] has quotes escaped.  php://input doesn't. */
        $input = file_get_contents('php://input', 1000000);
        $inputFields = explode("=", $input);
        $jsonInput = $json->decode(urldecode($inputFields[1]));
        break;
    }
    
    /* fall through to default */
    
default:
    /*
     * This request was not issued with JSON-RPC so echo the error rather than
     * issuing a JsonRpcError response.
     */
    echo
        "JSON-RPC request expected; " .
        "unexpected data received";
    exit;
}

/* Ensure that this was a JSON-RPC service request */
if (! isset($jsonInput) ||
    ! isset($jsonInput->service) ||
    ! isset($jsonInput->method) ||
    ! isset($jsonInput->params))
{
    /*
     * This request was not issued with JSON-RPC so echo the error rather than
     * issuing a JsonRpcError response.
     */
    echo
        "JSON-RPC request expected; " .
        "service, method or arguments/params missing<br>";
    exit;
}

/*
 * Ok, it looks like JSON-RPC, so we'll return an Error object if we encounter
 * errors from here on out.
 */
$error = new JsonRpcError($json);
$error->SetId($jsonInput->id);

/*
 * Ensure the requested service name is kosher.  A service name should be:
 *
 *   - a dot-separated sequences of strings; no adjacent dots
 *   - first character of each string is in [a-zA-Z] 
 *   - other characters are in [_a-zA-Z0-9]
 */

/* First check for legal characters */
if (ereg("^[_.a-zA-Z0-9]+$", $jsonInput->service) === false)
{
    /* There's some illegal character in the service name */
    $error->SetError(JsonRpcError_IllegalService,
                     "Illegal character found in service name.");
    $error->SendAndExit();
    /* never gets here */
}

/* Now ensure there are no double dots */
if (strstr($jsonInput->service, "..") !== false)
{
    $error->SetError(JsonRpcError_IllegalService,
                     "Illegal use of two consecutive dots in service name");
    $error->SendAndExit();
}

/* Explode the service name into its dot-separated parts */
$serviceComponents = explode(".", $jsonInput->service);

/* Ensure that each component begins with a letter */
for ($i = 0; $i < count($serviceComponents); $i++)
{
    if (ereg("^[a-zA-Z]", $serviceComponents[$i]) === false)
    {
        $error->SetError(JsonRpcError_IllegalService,
                         "A service name component does not begin with a letter");
        $error->SendAndExit();
        /* never gets here */
    }
}

/*
 * Now replace all dots with slashes so we can locate the service script.  We
 * also retain the exploded components of the path, as the class name of the
 * service is the last component of the path.
 */
$servicePath = implode("/", $serviceComponents);

/* Try to load the requested service */
if ((@include servicePathPrefix . $servicePath . ".php") === false)
{
    /* Couldn't find the requested service */
    $error->SetError(JsonRpcError_ServiceNotFound,
                     "Service not found.");
    $error->SendAndExit();
    /* never gets here */
}

/* The service class is the last component of the service name */
$className = "class_" . $serviceComponents[count($serviceComponents) - 1];

/* Ensure that the class exists */
if (! class_exists($className))
{
    $error->SetError(JsonRpcError_ClassNotFound,
                     "Class not found.");
    $error->SendAndExit();
    /* never gets here */
}

/* Instantiate the service */
$service = new $className();

/* Now that we've instantiated service, we should find the requested method */
$method = "method_" . $jsonInput->method;
if (! method_exists($service, $method))
{
    $error->SetError(JsonRpcError_MethodNotFound,
                     "Method not found.");
    $error->SendAndExit();
    /* never gets here */
}

/* Call the requested method passing it the provided params */
$output = $service->$method($jsonInput->params, &$error);

/* See if the result of the function was actually an error */
if (get_class($output) == "JsonRpcError")
{
    /* Yup, it was.  Return the error */
    $error->SendAndExit();
    /* never gets here */
}

/* Give 'em what they came for! */
$ret = array("result" => $output, "id" => $jsonInput->id);
print $json->encode($ret);

?>
