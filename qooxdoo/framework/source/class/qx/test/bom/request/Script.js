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

qx.Class.define("qx.test.bom.request.Script",
{
  extend : qx.dev.unit.TestCase,

  include : [qx.test.io.MRemoteTest,
             qx.dev.unit.MMock],

  members :
  {
    setUp: function() {
      var req = this.req = new qx.bom.request.Script(),
          url = this.url = this.getUrl("qx/test/script.js");
    },

    tearDown: function() {
      this.req.dispose();
    },

    //
    // General
    //

    "test: create instance": function() {
      this.assertObject(this.req);
    },

    "test: dispose() removes script from DOM": function() {
      var script;

      this.req.open();
      this.req.send();
      script = this.req._getScriptElement();
      this.req.dispose();

      this.assertFalse(this.isInDom(script));
    },

    //
    // open()
    //

    "test: open() stores URL": function() {
      this.req.open("GET", this.url);
      this.assertEquals(this.url, this.req._getUrl());
    },

    //
    // send()
    //

    "test: send() adds script element to DOM": function() {
      var req = this.req,
          url = this.url;

      // Helper triggers send()
      this.request();

      this.assert(this.isInDom(req._getScriptElement()), "Script element not in DOM");
    },

    "test: send() sets script src to URL": function() {
      this.request();
      this.assertMatch(this.req._getScriptElement().src, /qx\/test\/script.js$/);
    },

    "test: send() with data": function() {
      this.skip();
    },

    //
    // Event handlers
    //

    "test: call onload when when loading completed successfully": function() {
      var that = this;

      this.req.onload = function() {
        that.resume(function() {});
      };

      this.request();
      this.wait();
    },

    "test: not call onload when loading failed because of network error": function() {

      // Known to fail in IE < 9,
      // i.e. all browsers using onreadystatechange event handlerattribute
      //
      // After a short delay, readyState progresses to "loaded" even
      // though the resource could not be loaded.
      if (this.isIeBelow(9)) {
        this.skip();
      }

      var that = this,
          timerId;

      this.req.onload = function() {
        that.resume(function() {
          throw Error("Called onload");
        });
      };

      // For browsers not supporting the "error" event, wait for a while
      // and assume "error" will not be fired later
      timerId = window.setTimeout(function() {
      }, 5000);

      this.req.onerror = function() {
        window.clearTimeout(timerId);
        that.resume();
      };

      this.request("http://fail.tld");
      this.wait(6000);
    },

    "test: call onerror when request failed because of network error": function() {

      // Known to fail in IE < 9
      // Legacy IEs do not support the "error" event.
      if (this.isIeBelow(9)) {
        this.skip();
      }

      var that = this;

      this.req.onerror = function() {
        that.resume(function() {});
      };

      this.request("http://fail.tld");
      this.wait();
    },

    "test: call onerror when request failed because of invalid script": function() {

      // Known to fail in all browsers tested
      // Native "error" event not fired for script element.
      //
      // A possible work-around is to listen to the global "error"
      // event dispatched on the window.
      this.skip();

      var that = this;

      this.req.onerror = function() {
        that.resume(function() {});
      };

      // Invalid JavaScript
      this.request(this.getUrl("qx/test/xmlhttp/sample.txt"));

      this.wait();
    },

    "test: call ontimeout when request exceeded timeout limit": function() {
      var that = this;

      this.req.ontimeout = function() {
        that.resume(function() {});
      };

      this.req.timeout = 100;

      // In legacy browser, a long running script request blocks subsequent requests
      // even if the script element is removed. Keep duration below default timeout
      // for wait to work around.
      this.request(this.getUrl("qx/test/xmlhttp/loading.php") + "?duration=1");
      this.wait();
    },

    "test: remove script from DOM when request completed": function() {
      var script,
          that = this;

      this.req.onload = function() {
        that.resume(function() {
          script = this.req._getScriptElement();
          that.assertFalse(that.isInDom(script));
        });
      };

      this.request();
      this.wait();
    },

    "test: remove script from DOM when request failed": function() {
      var script,
          that = this;

      // In IE < 9, "load" is fired instead of "error"
      this.req.onerror = this.req.onload = function() {
        that.resume(function() {
          script = this.req._getScriptElement();
          that.assertFalse(that.isInDom(script));
        });
      };

      this.request("http://fail.tld");
      this.wait();
    },

    "test: remove script from DOM when request timed out": function() {
      var script,
          that = this;

      this.req.ontimeout = function() {
        that.resume(function() {
          script = that.req._getScriptElement();
          that.assertFalse(that.isInDom(script));
        });
      };

      // Force timeout
      this.req.timeout = 1;

      this.request();
      this.wait();
    },

    request: function(customUrl) {
      this.req.open("GET", customUrl || this.url);
      this.req.send();
    },

    isInDom: function(elem) {
      return elem.parentNode ? true : false;
    },

    isIeBelow: function(version) {
      return qx.core.Environment.get("engine.name") === "mshtml" &&
             qx.core.Environment.get("engine.version") < version;
    },

    skip: function(msg) {
      throw new qx.dev.unit.RequirementError(null, msg);
    }
  }
});
