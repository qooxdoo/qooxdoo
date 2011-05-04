/* ************************************************************************

   qooxdoo - the new era of web development

   http://qooxdoo.org

   Copyright:
     2004-2011 1&1 Internet AG, Germany, http://www.1und1.de

   License:
     LGPL: http://www.gnu.org/licenses/lgpl.html
     EPL: http://www.eclipse.org/org/documents/epl-v10.php
     See the LICENSE file in the project's top-level directory for details.

   Authors:
     * Tristan Koch (tristankoch)

************************************************************************ */

/* ************************************************************************

#asset(qx/test/*)

************************************************************************ */

qx.Class.define("qx.test.bom.request.Jsonp",
{
  extend : qx.dev.unit.TestCase,

  include : [qx.test.io.MRemoteTest,
             qx.dev.unit.MMock],

  members :
  {
    setUp: function() {
      this.req = new qx.bom.request.Jsonp();
      this.url = this.getUrl("qx/test/script.js");
    },

    tearDown: function() {
      window.SCRIPT_LOADED = false;
      this.req.dispose();
    },

    "test: set callback param and name": function() {
      var req = this.req;

      req.setCallbackParam("myMethod");
      req.setCallbackName("myCallback");
      req.open("GET", this.url);
      req.send();

      this.assertMatch(req._getUrl(), /(myMethod=myCallback)/);
    },

    "test: has default callback param and name": function() {
      var req = this.req,
          regExp;

      req.open("GET", this.url);
      req.send();

      // String is URL encoded
      regExp = /\?callback=qx\.bom\.request\.Jsonp.*\d{16,}.*\.callback/;
      this.assertMatch(req._getUrl(), regExp);
    },

    "test: responseJson is object when server returns valid JSONP": function() {
      var that = this;

      this.req.onload = function() {
        that.resume(function() {
          var data = this.req.responseJson;
          that.assertObject(data);
          that.assertTrue(data["boolean"]);
        });
      };

      this.request(this.getUrl("qx/test/jsonp_primitive.php"));
      this.wait();
    },

    "test: call onerror when script loaded but callback not called": function() {
      var that = this;

      this.req.onload = function() {
        throw Error("Called onload");
      };

      this.req.onerror = function() {
        that.resume(function() {});
      };

      // Unknown handler
      this.req.setCallbackName("fail");

      this.request(this.getUrl("qx/test/jsonp_primitive.php"));
      this.wait();
    },

    request: function(customUrl) {
      this.req.open("GET", customUrl || this.url);
      this.req.send();
    },

    skip: function(msg) {
      throw new qx.dev.unit.RequirementError(null, msg);
    }

  }
});
