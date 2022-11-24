/* ************************************************************************

   qooxdoo - the new era of web development

   http://qooxdoo.org

   Copyright:
     2004-2011 1&1 Internet AG, Germany, http://www.1und1.de & contributors

   License:
     MIT: https://opensource.org/licenses/MIT
     See the LICENSE file in the project's top-level directory for details.

   Authors:
     * Tristan Koch (tristankoch)
     * Christian Boulanger (cboulanger)

************************************************************************ */

/**
 * Tests for the websocket transport
 */
qx.Class.define("qx.test.io.transport.Websocket", {
  extend: qx.dev.unit.TestCase,

  statics: {
    TEST_ENDPOINT: "socketsbay.com/wss/v2/2/demo/"
  },

  members: {
    __hasEndpoint: false,
    __skipMsg: "Skipping test as endpoint is not available.",

    setUp() {
      this.transport = new qx.io.transport.Websocket(
        "wss://" + this.constructor.TEST_ENDPOINT
      );
    },

    async "test: check endpoint"() {
      try {
        await this.transport.send("test");
        this.__hasEndpoint = true;
      } catch (e) {
        console.error(
          `Endpoint ${this.constructor.TEST_ENDPOINT} is not accessible: ${e.message}`
        );
      }
    },

    async "test: send message to public websocket echo server and check response"() {
      if (!this.__hasEndpoint) {
        return this.skip(this.__skipMsg);
      }
      let message = "Hello World!";
      await new qx.Promise((resolve, reject) => {
        this.transport.addListenerOnce("message", evt => {
          this.assertEquals(message, evt.getData());
        });
        this.transport.send(message).then(resolve).catch(reject);
      });
    }
  }
});
