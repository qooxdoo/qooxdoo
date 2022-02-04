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
 * GraphQL tests using the Fetch API
 */
qx.Class.define("qx.test.io.graphql.ClientFetch", {
  extend: qx.test.io.graphql.Client,
  statics: {
    TEST_ENDPOINT: "https://countries.trevorblades.com/"
  },

  construct() {
    super();
    let transport = new qx.io.transport.Fetch(this.constructor.TEST_ENDPOINT);
    transport.getTransportImpl();
    this.client = new qx.io.graphql.Client(transport);
  }
});
