/* ************************************************************************

   qooxdoo - the new era of web development

   http://qooxdoo.org

   Copyright:
     2020 Christian Boulanger

   License:
     MIT: https://opensource.org/licenses/MIT
     See the LICENSE file in the project's top-level directory for details.

   Authors:
     * Christian Boulanger (cboulanger)

************************************************************************ */

/**
 *  A class for representing errors that occurred during the request transport.
 *  In the context of HTTP requests, the error code is the HTTP error code.
 */
qx.Class.define("qx.io.remote.TransportException",
{
  extend : qx.io.Exception
});
