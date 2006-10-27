package net.sf.qooxdoo.rpc;

import org.json.JSONArray;

/**
 * An RPC servlet that logs errors to System.err
 */
public class LoggingRpcServlet extends RpcServlet {

  // overridden
  protected RemoteCallUtils getRemoteCallUtils() {
    return new RemoteCallUtils() {
      protected Object callCompatibleMethod(Object instance,
          String methodName, JSONArray parameters)
          throws Exception
      {
        try {
          return super.callCompatibleMethod(instance, methodName, parameters);
        } catch (Exception exc) {
          exc.printStackTrace();
          throw exc;
        }
      }
    };
  }

}
