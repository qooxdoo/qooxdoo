<?php
  /*
   * qooxdoo - the new era of web development
   *
   * http://qooxdoo.org
   *
   * Copyright:
   *   2006 Derrell Lipman
   *
   * License:
   *   LGPL 2.1: http://www.gnu.org/licenses/lgpl.html
   *   EPL: http://www.eclipse.org/org/documents/epl-v10.php
   *   See the LICENSE file in the project's top-level directory for details.
   *
   * Authors:
   *  * Derrell Lipman (derrell)
   */

/*
 * This is the standard qooxdoo test class.  There are tests for each of the
 * primitive types here, along with standard named tests "echo", "sink" and
 * "sleep".
 */

class class_test
{
    /**
     * Specify method accessibility.  Default value is configured in server,
     * but may be overridden on a per-method basis here.
     *
     * @param method
     *   The name of the method (without the leading "method_") to be tested
     *   for accessibility.
     *
     * @param defaultAccessibility
     *   The default accessibility configured in the server.  (See @return for
     *   possible values.)
     *
     * @param bScriptTransportInUse (not yet implemented)
     *   Boolean indicating whether the current request was issued via
     *   ScriptTransport.
     *
     * @param bDefaultScriptTransportAllowed (not yet implemented)
     *   Boolean specifying the default value for allowing requests via
     *   ScriptTransport. 
     *
     * @return
     *   One of these values:
     *     Accessibility_Public
     *     Accessibility_Domain
     *     Accessibility_Session
     *     Accessibility_Fail
     */
/*
    function GetAccessibility($method, $defaultAccessibility)
    {
        switch($method)
        {
        case "echo":
            return Accessibility_Domain;

        case "getInteger":
            return Accessibility_Session;

        case "getString":
            return Accessibility_Public;
        }

        return $defaultAccessibility;
    }
*/

    /**
     * Echo the (one and only) parameter.
     *
     * @param params
     *   An array containing the parameters to this method
     *
     * @param error
     *   An object of class JsonRpcError.
     *
     * @return
     *   Success: The object containing the result of the method;
     *   Failure: null
     */
    function method_echo($params, $error)
    {
        if (count($params) != 1)
        {
            $error->SetError(JsonRpcError_ParameterMismatch,
                             "Expected 1 parameter; got " . count($params));
            return $error;
        }
        return "Client said: [" . $params[0] . "]";
    }
    
    /**
     * Sink all data and never return.
     *
     * @param params
     *   An array containing the parameters to this method (none expected)
     *
     * @param error
     *   An object of class JsonRpcError.
     *
     * @return
     *   "Never"
     */
    function method_sink($params, $error)
    {
        /* We're never supposed to return.  Just sleep for a very long time. */
        sleep(240);
    }
    
    /**
     * Sleep for the number of seconds specified by the parameter.
     *
     * @param params
     *   An array containing the parameters to this method (one expected)
     *
     * @param error
     *   An object of class JsonRpcError.
     *
     * @return
     *   Success: The object containing the result of the method;
     *   Failure: null
     */
    function method_sleep($params, $error)
    {
        if (count($params) != 1)
        {
            $error->SetError(JsonRpcError_ParameterMismatch,
                             "Expected 1 parameter; got " . count($params));
            return null;
        }
        
        sleep(intval($params[0]));
        return $params[0];
    }
    

    /*************************************************************************/

    /*
     * The remainder of the functions test each individual primitive type, and
     * test echoing arbitrary types.  Hopefully the name is self-explanatory.
     */

    function method_getInteger($params, $error)
    {
        return 1;
    }
    
    function method_getFloat($params, $error)
    {
        return 1/3;
    }
    
    function method_getString($params, $error)
    {
        return "Hello world";
    }
    
    function method_getBadString($params, $error)
    {
        return "<!DOCTYPE HTML \"-//IETF//DTD HTML 2.0//EN\">";
    }
    
    function method_getArrayInteger($params, $error)
    {
        return array(1, 2, 3, 4);
    }
    
    function method_getArrayString($params, $error)
    {
        return array("one", "two", "three", "four");
    }
    
    function method_getObject($params, $error)
    {
        return new JSON(); // some arbitrary object
    }
    
    function method_getTrue($params, $error)
    {
        return true;
    }
    
    function method_getFalse($params, $error)
    {
        return false;
    }
    
    function method_getNull($params, $error)
    {
        return null;
    }

    function method_isInteger($params, $error)
    {
        return is_int($params[0]);
    }
    
    function method_isFloat($params, $error)
    {
        return is_float($params[0]);
    }
    
    function method_isString($params, $error)
    {
        return is_string($params[0]);
    }
    
    function method_isBoolean($params, $error)
    {
        return is_bool($params[0]);
    }
    
    function method_isArray($params, $error)
    {
        return is_array($params[0]);
    }
    
    function method_isObject($params, $error)
    {
        return is_object($params[0]);
    }
    
    function method_isNull($params, $error)
    {
        return is_null($params[0]);
    }
    
    function method_getParams($params, $error)
    {
        return $params;
    }	
    
    function method_getParam($params, $error)
    {
        return $params[0];
    }	
    
    function method_getCurrentTimestamp()
    {
        $now = time();
        $obj = new stdClass();
        $obj->now = $now;
        $obj->json = new JSON_Date($now);
        return $obj;
    }

    function method_getError($params, $error)
    {
        $error->SetError(23, "This is an application-provided error");
        return $error;
    }	
}

?>