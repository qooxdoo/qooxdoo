package net.sf.qooxdoo.rpc;

import javax.servlet.http.HttpServletRequest;
import org.json.JSONArray;

/**
 * An RPC servlet that logs errors to System.err
 */
public class LoggingRpcServlet extends RpcServlet {

  // overridden
  protected String handleRPC(HttpServletRequest request,
                             String requestString) throws Exception
  {
    try {
      return super.handleRPC(request, requestString);
    } catch (Exception exc) {
      exc.printStackTrace();
      throw exc;
    }
  }


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
