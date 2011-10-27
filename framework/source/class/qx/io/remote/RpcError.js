/* ************************************************************************

   qooxdoo - the new era of web development

   http://qooxdoo.org

   Copyright:
     2011 Derrell Lipman

   License:
     LGPL: http://www.gnu.org/licenses/lgpl.html
     EPL: http://www.eclipse.org/org/documents/epl-v10.php
     See the LICENSE file in the project's top-level directory for details.

   Authors:
     * Derrell Lipman (derrell)

************************************************************************ */

/**
 * The well-defined error codes for JSON-RPC.
 */
qx.Class.define("qx.io.remote.RpcError",
{
  statics :
  {
    /** Information pertaining to qooxdoo's modified JSON-RPC Version 1 */
    qx1:
    {
      /** Origin of the error */
      origin :
      {
        Server      : 1,
        Application : 2,
        Transport   : 3,
        Client      : 4
      },

      /**
       * Error data. In Version 1, each origin can have its own error codes.
       * Only 'Server' error codes are globally-defined, however.
       */
      error :
      {
        /** Error codes for the Server origin */
        server :
        {
          /*
           * Script Error
           *
           * An error was thrown during the processing of a remote procedure
           * call.
           */
          ScriptError       : -1,


          /*
           * Unknown Error
           *
           * The default error code, used only when no specific error code is
           * passed to the JsonRpcError constructor.  This code should
           * generally not be used.
           */
          Unknown           : 0,


          /**
           * Illegal Service
           *
           * The service name contains illegal characters or is otherwise
           * deemed unacceptable to the JSON-RPC server.
           */
          IllegalService    : 1,


          /**
           * Service Not Found
           *
           * The requested service does not exist at the JSON-RPC server.
           */
          ServiceNotFound   : 2,


          /**
           * Class Not Found
           *
           * If the JSON-RPC server divides service methods into subsets
           * (classes), this indicates that the specified class was not found.
           * This is slightly more detailed than "Method Not Found", but that
           * error would always also be legal (and true) whenever this one is
           * returned. (Not used in this implementation)
           */
          ClassNotFound     : 3, // not used in this implementation


          /**
           * Method Not Found
           *
           * The method specified in the request is not found in the requested
           * service.
           */
          MethodNotFound    : 4,


          /**
           * Parameter Mismatch
           *
           * If a method discovers that the parameters (arguments) provided to
           * it do not match the requisite types for the method's parameters,
           * it should return this error code to indicate so to the caller.
           *
           * This error is also used to indicate an illegal parameter value,
           * in server scripts.
           */
          ParameterMismatch : 5,


          /**
           * Permission Denied
           *
           * A JSON-RPC service provider can require authentication, and that
           * authentication can be implemented such the method takes
           * authentication parameters, or such that a method or class of
           * methods requires prior authentication.  If the caller has not
           * properly authenticated to use the requested method, this error
           * code is returned.
           */
          PermissionDenied  : 6
        }
      }
    },

    /** Information pertaining to a conformant JSON-RPC Version 2 */
    v2 :
    {
      /**
       * Error data. In Version 1, each origin can have its own error codes.
       * Only 'Server' error codes are globally-defined, however.
       */
      error :
      {
        /**
         * Parse Error
         *
         * Invalid JSON was received by the server.
         * An error occurred on the server while parsing the JSON text.
         */
        ParseError     : -32700,

        /**
         * Invalid Request
         *
         * The JSON received by the server is not a valid Request object.
         */
        InvalidRequest : -32600,

        /**
         * Method Not Found
         *
         * The method specified in the request is not found in the requested
         * service.
         */
        MethodNotFound : -32601,

        /**
         * Invalid method parameter(s)
         *
         * If a method discovers that the parameters (arguments) provided to
         * it do not match the requisite types for the method's parameters,
         * it should return this error code to indicate so to the caller.
         */
        InvalidParams  : -32602,

        /**
         * Internal JSON-RPC error
         */
        InternalError  : -32603,

        /*********************************************************************
         * The values -32099 to -32000 are reserved for implementation-defined
         * server errors. RPC-specific error codes must be outside of this
         * range, and should generally be positive values.
         *********************************************************************/

        /**
         * Permission Denied
         *
         * A JSON-RPC service provider can require authentication, and that
         * authentication can be implemented such the method takes
         * authentication parameters, or such that a method or class of
         * methods requires prior authentication.  If the caller has not
         * properly authenticated to use the requested method, this error
         * code is returned.
         */
        PermissionDenied  : -32000
      }
    }
  }
});
