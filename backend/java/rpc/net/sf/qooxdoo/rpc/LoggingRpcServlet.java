/* ************************************************************************

   qooxdoo - the new era of web development

   http://qooxdoo.org

   Copyright:
     2006-2007 STZ-IDA, Germany, http://www.stz-ida.de

   License:
     LGPL: http://www.gnu.org/licenses/lgpl.html
     EPL: http://www.eclipse.org/org/documents/epl-v10.php
     See the LICENSE file in the project's top-level directory for details.

   Authors:
     * Andreas Junghans (lucidcake)

************************************************************************ */

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
