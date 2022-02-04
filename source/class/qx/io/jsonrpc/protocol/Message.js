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
 * The base class for all JSON-RPC v2.0 object except {@link qx.io.jsonrpc.protocol.Batch}
 */
qx.Class.define("qx.io.jsonrpc.protocol.Message", {
  extend: qx.core.Object,
  properties: {
    jsonrpc: {
      check: "String",
      init: "2.0"
    }
  },

  members: {
    /**
     * Serialize to JSON string
     * @return {String}
     */
    toString() {
      return qx.util.Serializer.toJson(this);
    },

    /**
     * Serialize to a native javascript object
     * @return {Object}
     */
    toObject() {
      return qx.util.Serializer.toNativeObject(this);
    }
  }
});
