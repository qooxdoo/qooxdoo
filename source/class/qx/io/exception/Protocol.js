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
 * A class for representing errors that occurred on server and are handled
 * according to the service protocol (JSON-RPC, GraphQL, etc.)
 */
qx.Class.define("qx.io.exception.Protocol", {
  extend: qx.io.exception.Exception
});
