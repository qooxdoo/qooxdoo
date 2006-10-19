package net.sf.qooxdoo.rpc;

import java.lang.reflect.InvocationTargetException;

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
          throws NoSuchMethodException, IllegalAccessException,
              InvocationTargetException
      {
        try {
          return super.callCompatibleMethod(instance, methodName, parameters);
        } catch (InvocationTargetException exc) {
          exc.printStackTrace();
          throw exc;
        }
      }
    };
  }

}
