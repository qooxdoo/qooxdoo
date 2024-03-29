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

qx.Class.define("qx.test.util.Request", {
  extend: qx.dev.unit.TestCase,

  members: {
    "test: isCrossDomain() returns true with cross-domain URL"() {
      var location = window.location,
        origin = location.protocol + "//" + location.host,
        isCrossDomain = qx.util.Request.isCrossDomain;

      this.assertTrue(isCrossDomain("http://cross.domain"), "cross");
      this.assertTrue(
        isCrossDomain(location.protocol + "//" + location.hostname + ":123456"),
        "port"
      );

      this.assertTrue(
        isCrossDomain("foobar" + "://" + location.host),
        "protocol"
      );
    },

    "test: isCrossDomain() returns false with same-origin URL"() {
      var location = window.location,
        origin = location.protocol + "//" + location.host,
        isCrossDomain = qx.util.Request.isCrossDomain;

      this.assertFalse(isCrossDomain(origin));
      this.assertFalse(isCrossDomain("data.json"), "simple url");
      this.assertFalse(isCrossDomain("/data.json"), "absolute url");
      this.assertFalse(isCrossDomain("../data.json"), "relative url");
      this.assertFalse(
        isCrossDomain("../foo-bar/meep.in/data.json"),
        "strange url"
      );
    },

    "test: isSuccessful() returns true with successful HTTP status"() {
      var isSuccessful = qx.util.Request.isSuccessful;

      this.assertTrue(isSuccessful(200));
      this.assertTrue(isSuccessful(304));

      this.assertFalse(isSuccessful(404));
      this.assertFalse(isSuccessful(500));
    },

    "test: isMethod() returns true if HTTP method is known"() {
      var isMethod = qx.util.Request.isMethod;

      this.assertTrue(isMethod("GET"));
      this.assertTrue(isMethod("POST"));

      this.assertFalse(isMethod(1));
      this.assertFalse(isMethod(null));
      this.assertFalse(isMethod(undefined));
      this.assertFalse(isMethod([]));
      this.assertFalse(isMethod({}));
    },

    "test: methodAllowsRequestBody() returns false when GET"() {
      this.assertFalse(qx.util.Request.methodAllowsRequestBody("GET"));
    },

    "test: methodAllowsRequestBody() returns true when POST"() {
      this.assertTrue(qx.util.Request.methodAllowsRequestBody("POST"));
    }
  }
});
