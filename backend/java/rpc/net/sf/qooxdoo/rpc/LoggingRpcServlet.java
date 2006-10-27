package net.sf.qooxdoo.rpc;

import javax.servlet.http.HttpServletRequest;

/**
 * An RPC servlet that logs errors to System.err
 */
public class LoggingRpcServlet extends RpcServlet {

  // overridden
  protected String handleRPC(HttpServletRequest request,
                             String requestString) throws Exception {
    try {
      return super.handleRPC(request, requestString);
    } catch (Exception exc) {
      exc.printStackTrace();
      throw exc;
    }
  }

}
