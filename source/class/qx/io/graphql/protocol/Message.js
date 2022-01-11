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
 * Abstract parent class for GraphQL messages and responses
 * @experimental The API might change. Feedback is appreciated.
 */
qx.Class.define("qx.io.graphql.protocol.Message", {
  extend: qx.core.Object,

  /**
   * Constructor
   * @param {Object} data
   */
  construct(data) {
    super();
    qx.core.Assert.assertObject(data);
    this.set(data);
  },

  members: {
    /**
     * Return the message data in a spec-conformant native object
     */
    toNormalizedObject() {
      let data = this.toObject();
      if (!data.errors) {
        delete data.errors;
      }
      return data;
    },

    /**
     * Serialize to a spec-conformant JSON string
     * @return {String}
     */
    toString() {
      return qx.lang.Json.stringify(this.toNormalizedObject());
    },

    /**
     * Serialize to a native javascript object. If you need a normalized object
     * that conforms to the spec, use {@link #toNormalizedObject}
     * @return {Object}
     */
    toObject() {
      return qx.util.Serializer.toNativeObject(this);
    }
  }
});
