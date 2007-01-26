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


/**
 * Class for providing access to the current environment for server classes.
 */
public class Environment {

	/**
     * Creates a new instance of Environment.
     */
    public Environment() {
    }


    /**
     * Returns the RPC servlet that handles the current request.
     *
     * @return      the RPC servlet.
     */
    public RpcServlet getRpcServlet() {
        return (RpcServlet)RpcServlet._currentInstance.get();
    }


    /**
     * Returns the current servlet request.
     *
     * @return      the request.
     */
    public HttpServletRequest getRequest() {
        return (HttpServletRequest)RpcServlet._currentRequest.get();
    }

}
