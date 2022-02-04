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
 * An Object modelling a GraphQL request based on the GraphQL language
 * (see http://spec.graphql.org/draft/#sec-Language) usually sent as JSON via
 * a HTTP request (https://graphql.org/learn/serving-over-http)
 * @experimental The API might change. Feedback is appreciated.
 */
qx.Class.define("qx.io.graphql.protocol.Request", {
  extend: qx.io.graphql.protocol.Message,
  properties: {
    /**
     * An optional field that only needs to be provided if multiple operations are present in the query
     */
    operationName: {
      check: "String",
      nullable: true,
      event: "changeOperationName"
    },

    /**
     * The query as a string which will be parsed and executed on the server
     */
    query: {
      check: "String",
      nullable: false,
      init: "",
      event: "changeQuery"
    },

    /**
     * A qooxdoo object that maps variable names to variable values
     */
    variables: {
      check: "qx.core.Object",
      nullable: true,
      event: "changeVariables",
      transform: "_transformVariables",
      validate: "_validateVariables"
    }
  },

  members: {
    // overriden
    toString() {
      return qx.lang.Json.stringify(this.toObject(), this._jsonReplacer);
    },

    _jsonReplacer(key, value) {
      if (key === "variables" || key === "operationName") {
        return value !== null ? value : undefined;
      }
      // everything else is returned as it is
      return value;
    },

    /**
     * Transforms the variables object to a qooxdoo model. Called automaticaly
     * when the variables property is set.
     */
    _transformVariables(val) {
      let model = null;
      if (![null, undefined].includes(val)) {
        model = qx.data.marshal.Json.createModel(val);
      }
      return model;
    },

    _validateVariables(val) {
      if (!qx.lang.Type.isObject(val) && val !== null) {
        throw new qx.core.ValidationError(
          "Validation Error: " + val + " is not an object or null."
        );
      }
    }
  }
});
