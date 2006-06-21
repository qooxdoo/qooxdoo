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
   *     derrell dot lipman at unwireduniverse dot com
   */

  /*
   * This is the standard qooxdoo test class.  There are tests for each of the
   * primitive types here, along with standard named tests "echo", "sink" and
   * "sleep".
   */

  class class_test
{
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