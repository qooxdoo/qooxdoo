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

#asset(qx/test/script.js)
#asset(qx/test/jsonp_primitive.php)

************************************************************************ */

/* ************************************************************************

#ignore(myCallback)

************************************************************************ */

qx.Class.define("qx.test.bom.request.Jsonp",
{
  extend : qx.dev.unit.TestCase,

  include : [qx.test.io.MRemoteTest,
             qx.dev.unit.MMock],

  members :
  {
    /**
     * @lint ignoreUndefined(myCallback)
     */
    setUp: function() {
      this.req = new qx.bom.request.Jsonp();
      this.url = this.getUrl("qx/test/jsonp_primitive.php");
      myCallback = function() {};
    },

    tearDown: function() {
      delete window.SCRIPT_LOADED;
      delete window.myCallback;
      this.req.dispose();
    },

    //
    // Callback Param
    //

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

    //
    // Properties
    //

    "test: responseJson holds response with default callback": function() {
      var that = this;

      this.req.onload = function() {
        that.resume(function() {
          var data = this.req.responseJson;
          that.assertObject(data);
          that.assertTrue(data["boolean"]);
        });
      };

      this.request();
      this.wait();
    },

    "test: status indicates success when default callback called": function() {
      var that = this;

      this.req.onload = function() {
        that.resume(function() {
          that.assertEquals(200, that.req.status);
        });
      };

      this.req.setCallbackName("myCallback");
      this.request();
      this.wait();
    },

    "test: status indicates success when custom callback called": function() {
      var that = this;

      this.req.onload = function() {
        that.resume(function() {
          that.assertEquals(200, that.req.status);
        });
      };

      this.req.setCallbackName("myCallback");
      this.request();
      this.wait();
    },

    // Error handling

    "test: status indicates failure when default callback not called": function() {
      var that = this;

      this.req.onload = function() {
        that.resume(function() {
          that.assertEquals(500, that.req.status);
        });
      };

      this.request(this.getUrl("qx/test/script.js"));
      this.wait();
    },

    "test: status indicates failure when custom callback not called": function() {
      var that = this;

      this.req.onload = function() {
        that.resume(function() {
          that.assertEquals(500, that.req.status);
        });
      };

      this.req.setCallbackName("myCallback");
      this.request(this.getUrl("qx/test/script.js"));
      this.wait();
    },

    //
    // Event handlers
    //

    "test: call onload": function() {
      var that = this;

      this.req.onload = function() {
        that.resume(function() {});
      };

      this.request();
      this.wait();
    },

    // Error handling

    "test: call onerror on network error": function() {
      var that = this;

      this.req.onerror = function() {
        that.resume(function() {});
      };

      this.request("http://fail.tld");
      this.wait(10000);
    },

    "test: call onloadend on network error": function() {
      var that = this;

      this.req.onloadend = function() {
        that.resume(function() {});
      };

      this.request("http://fail.tld");
      this.wait(10000);
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
