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
      const message = {};
      const properties = qx.util.PropertyUtil.getAllProperties(
        this.constructor
      );

      for (const name in properties) {
        // ignore property groups
        if (properties[name].group != undefined) {
          continue;
        }
        message[name] = this.get(name);
      }

      // the replacer keeps the support for qooxdoo objects and localized
      // strings which qx.util.Serializer provides, and writes an unset
      // property as null rather than dropping the key, as it did
      return JSON.stringify(message, (key, value) => {
        if (value === undefined) {
          return null;
        }
        if (value instanceof qx.core.Object) {
          return qx.util.Serializer.toNativeObject(value);
        }
        if (value instanceof qx.type.BaseString) {
          return value.toString();
        }
        return value;
      });
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
