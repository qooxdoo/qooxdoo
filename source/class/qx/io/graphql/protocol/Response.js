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
 * An Object modelling a GraphQL response (see http://spec.graphql.org/draft/#sec-Response-Format)
 * @experimental The API might change. Feedback is appreciated.
 */
qx.Class.define("qx.io.graphql.protocol.Response", {
  extend: qx.io.graphql.protocol.Message,

  properties: {
    /**
     * "The data entry in the response will be the result of the execution
     * of the requested operation. If the operation was a query, this
     * output will be an object of the schema’s query root type; if the
     * operation was a mutation, this output will be an object of the
     * schema’s mutation root type. If an error was encountered before
     * execution begins, the data entry should not be present in the result.
     * If an error was encountered during the execution that prevented
     * a valid response, the data entry in the response should be null"
     */
    data: {
      check: "Object",
      nullable: true,
      init: null
    },

    /**
     * "The errors entry in the response is a non‐empty list of errors,
     * where each error is a map. If no errors were encountered during
     * the requested operation, the errors entry should not be present in
     * the result. If the data entry in the response is not present, the
     * errors entry in the response must not be empty. It must contain
     * at least one error. The errors it contains should indicate why no
     * data was able to be returned. If the data entry in the response is
     * present (including if it is the value null), the errors entry in the
     * response may contain any errors that occurred during execution. If
     * errors occurred during execution, it should contain those errors."
     */
    errors: {
      check: value =>
        qx.lang.Type.isArray(value) &&
        value.length &&
        value.every(item => Boolean(item.message)),
      nullable: true
    }
  }
});
