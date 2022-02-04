/* ************************************************************************

   qooxdoo - the new era of web development

   http://qooxdoo.org

   Copyright:
     2004-2011 1&1 Internet AG, Germany, http://www.1und1.de

   License:
     MIT: https://opensource.org/licenses/MIT
     See the LICENSE file in the project's top-level directory for details.

   Authors:
     * Tristan Koch (tristankoch)

************************************************************************ */

/**
 * Tests asserting behavior
 *
 * - special to io.request.Jsonp and
 * - common to io.request.* (see {@link qx.test.io.request.MRequest})
 *
 * Tests defined in MRequest run with appropriate context, i.e.
 * a transport that is an instance of qx.bom.request.Jsonp
 * (see {@link #setUpFakeTransport}).
 *
 */
qx.Class.define("qx.test.io.request.Jsonp", {
  extend: qx.dev.unit.TestCase,

  include: [qx.test.io.request.MRequest, qx.dev.unit.MMock],

  members: {
    setUp() {
      this.setUpRequest();
      this.setUpFakeTransport();
    },

    setUpRequest() {
      this.req && this.req.dispose();
      this.req = new qx.io.request.Jsonp();
      this.req.setUrl("url");
    },

    // Also called in shared tests, i.e. shared tests
    // use appropriate transport
    setUpFakeTransport() {
      this.transport = this.injectStub(
        qx.io.request.Jsonp.prototype,
        "_createTransport",
        this.deepStub(new qx.bom.request.Jsonp())
      );

      this.setUpRequest();
    },

    tearDown() {
      this.getSandbox().restore();
      this.req.dispose();

      // May fail in IE
      try {
        qx.Class.undefine("Klass");
      } catch (e) {}
    },

    //
    // General (cont.)
    //

    "test: set url property on construct"() {
      var req = new qx.io.request.Jsonp("url");
      this.assertEquals("url", req.getUrl());
      req.dispose();
    },

    //
    // Callback management
    //

    "test: setCallbackParam()"() {
      var req = this.req,
        transport = this.transport;

      req.setCallbackParam("method");
      this.assertCalledWith(transport.setCallbackParam, "method");
    },

    "test: setCallbackName()"() {
      var req = this.req,
        transport = this.transport;

      req.setCallbackName("myCallback");
      this.assertCalledWith(transport.setCallbackName, "myCallback");
    }
  }
});
