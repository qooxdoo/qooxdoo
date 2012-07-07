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

#asset(qx/test/jsonp_primitive.php)
#asset(qx/test/script.js)
#asset(qx/test/xmlhttp/sample.txt)

************************************************************************ */

/* ************************************************************************

#ignore(SCRIPT_LOADED)

************************************************************************ */

qx.Class.define("qx.test.bom.request.Script",
{
  extend : qx.dev.unit.TestCase,

  include : [qx.test.io.MRemoteTest,
             qx.dev.unit.MRequirements,
             qx.dev.unit.MMock],

  members :
  {
    setUp: function() {
      var req = this.req = new qx.bom.request.Script();
      this.url = this.getUrl("qx/test/script.js");

      // Assume timeout after 1s in Opera (no error!)
      if (qx.core.Environment.get("engine.name") === "opera") {
        req.timeout = 1000;
      }
    },

    tearDown: function() {
      this.getSandbox().restore();
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

    "test: allow many requests with same object": function() {
      var count = 0,
          that = this;

      this.req.onload = function() {
        count += 1;
        if (count == 2) {
          that.resume(function() {});
          return;
        }
        that.request();
      };

      this.request();
      this.wait();
    },

    //
    // Event helper
    //

    "test: call event handler": function() {
      var req = this.req;
      req.onevent = this.spy();
      req._emit("event");
      this.assertCalled(req.onevent);
    },

    "test: fire event": function(){
      var req = this.req;
      var event = this.spy();
      req.onevent = this.spy();
      req.on("event", event);
      req._emit("event");
      this.assertCalled(event);
    },

    //
    // Properties
    //

    "test: properties indicate success when request completed": function() {
      var that = this,
          req = this.req;

      req.onload = function() {
        that.resume(function() {
          that.assertEquals(4, req.readyState);
          that.assertEquals(200, req.status);
          that.assertEquals("200", req.statusText);
        });
      };

      this.request();
      this.wait();
    },

    /**
     * @lint ignoreUndefined(SCRIPT_LOADED)
     */
    "test: status indicates success when determineSuccess returns true": function() {
      var that = this;

      this.req.onload = function() {
        that.resume(function() {
          that.assertEquals(200, that.req.status);
        });
      };

      this.req.setDetermineSuccess(function() {
        return SCRIPT_LOADED === true;
      });

      this.request(this.getUrl("qx/test/script.js"));
      this.wait();
    },

    // Error handling

    "test: properties indicate failure when request failed": function() {

      // Known to fail in legacy IEs
      if (this.isIeBelow(9)) {
        this.skip();
      }

      var that = this,
          req = this.req;

      req.onerror = function() {
        that.resume(function() {
          that.assertEquals(4, req.readyState);
          that.assertEquals(0, req.status);
          that.assertNull(req.statusText);
        });
      };

      this.request("http://fail.tld");
      this.wait(15000);
    },

    "test: properties indicate failure when request timed out": function() {

      // Known to fail in legacy IEs
      if (this.isIeBelow(9)) {
        this.skip();
      }

      var that = this,
          req = this.req;

      req.timeout = 25;
      req.ontimeout = function() {
        that.resume(function() {
          that.assertEquals(4, req.readyState);
          that.assertEquals(0, req.status);
          that.assertNull(req.statusText);
        });
      };

      this.requestPending();
      this.wait();
    },

    "test: status indicates failure when determineSuccess returns false": function() {
      var that = this;

      this.req.onload = function() {
        that.resume(function() {
          that.assertEquals(500, that.req.status);
        });
      };

      this.req.setDetermineSuccess(function() {
        return false;
      });

      this.request();
      this.wait();
    },

    "test: reset XHR properties when reopened": function() {
      var req = this.req,
          that = this;

      req.onload = function() {
        that.resume(function() {
          req.open("GET", "/url");
          that.assertIdentical(1, req.readyState);
          that.assertIdentical(0, req.status);
          that.assertIdentical("", req.statusText);
        });
      };

      this.request();
      this.wait();
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
      var req = this.req;

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
    // abort()
    //

    "test: abort() removes script element": function() {
      var req = this.req;

      this.requestPending();
      req.abort();

      this.assertFalse(this.isInDom(req._getScriptElement()), "Script element in DOM");
    },

    "test: abort() makes request not fire load": function() {
      var req = this.req;

      this.spy(req, "onload");

      this.request();
      req.abort();

      this.wait(300, function() {
        this.assertNotCalled(req.onload);
      }, this);
    },

    //
    // setRequestHeader()
    //

    "test: setRequestHeader() throws error when other than OPENED": function() {
      var req = this.req;

      this.assertException(function() {
        req.setRequestHeader();
      }, null, "Invalid state");
    },

    "test: setRequestHeader() appends to URL": function() {
      var req = this.req;

      req.open("GET", "/affe");
      req.setRequestHeader("key1", "value1");
      req.setRequestHeader("key2", "value2");

      this.assertMatch(req._getUrl(), /key1=value1/);
      this.assertMatch(req._getUrl(), /key2=value2/);
    },

    //
    // Event handlers
    //

    "test: call onload": function() {

      // More precisely, the request completes when the browser
      // has loaded and parsed the script

      var that = this;

      this.req.onload = function() {
        that.resume(function() {});
      };

      this.request();
      this.wait();
    },

    "test: call onreadystatechange and have appropriate readyState": function() {
      var req = this.req,
          readyStates = [],
          that = this;

      req.onreadystatechange = function() {
        readyStates.push(req.readyState);

        if (req.readyState === 4) {
          that.resume(function() {
            that.assertArrayEquals([1, 2, 3, 4], readyStates);
          });
        }
      };

      this.request();
      this.wait();
    },

    // Error handling

    "test: call onloadend on network error": function() {
      var that = this;

      this.req.onloadend = function() {
        that.resume(function() {});
      };

      this.request("http://fail.tld");
      this.wait(15000);
    },

    "test: call onloadend when request completes": function() {
      var that = this;

      this.req.onloadend = function() {
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

      var that = this

      this.req.onload = function() {
        that.resume(function() {
          throw Error("Called onload");
        });
      };

      this.req.onerror = function() {
        that.resume();
      };

      this.request("http://fail.tld");
      this.wait(15000);
    },

    "test: call onerror on network error": function() {

      // Known to fail in legacy IEs
      if (this.isIeBelow(9)) {
        this.skip();
      }

      var that = this;

      this.req.onerror = function() {
        that.resume(function() {});
      };

      this.request("http://fail.tld");
      this.wait(15000);
    },

    "test: call onerror on invalid script": function() {

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

    "test: not call onerror when request exceeds timeout limit": function() {
      var req = this.req;

      // Known to fail in browsers not supporting the error event
      // because timeouts are used to fake the "error"
      if (!this.supportsErrorHandler()) {
        this.skip();
      }

      this.spy(req, "onerror");
      req.timeout = 25;
      this.requestPending();

      this.wait(20, function() {
        this.assertNotCalled(req.onerror);
      }, this);
    },

    "test: call ontimeout when request exceeds timeout limit": function() {

      // Known to fail in legacy IEs
      if (this.isIeBelow(9)) {
        this.skip();
      }

      var that = this;

      this.req.timeout = 25;
      this.req.ontimeout = function() {
        that.resume(function() {});
      };

      this.requestPending();
      this.wait();
    },

    "test: not call ontimeout when request is within timeout limit": function() {
      var req = this.req,
          that = this;

      this.spy(req, "ontimeout");

      req.onload = function() {
        that.resume(function() {

          // Assert that onload() cancels timeout
          that.wait(350, function() {
            that.assertNotCalled(req.ontimeout);
          });

        });
      };

      req.timeout = 300;
      this.request();
      this.wait();
    },

    "test: call onabort when request was aborted": function() {
      var req = this.req;

      this.spy(req, "onabort");
      this.request();
      req.abort();

      this.assertCalled(req.onabort);
    },

    //
    // Clean-Up
    //

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
      this.wait(15000);
    },

    "test: remove script from DOM when request timed out": function() {

      // Known to fail in legacy IEs
      if (this.isIeBelow(9)) {
        this.skip();
      }

      var script,
          that = this;

      this.req.timeout = 25;
      this.req.ontimeout = function() {
        that.resume(function() {
          script = that.req._getScriptElement();
          that.assertFalse(that.isInDom(script));
        });
      };

      this.requestPending();
      this.wait();
    },

    request: function(customUrl) {
      this.req.open("GET", customUrl || this.url, true);
      this.req.send();
    },

    requestPending: function(sleep) {
      this.require(["php"]);
      var url = this.noCache(this.getUrl("qx/test/jsonp_primitive.php"));

      // In legacy browser, a long running script request blocks subsequent requests
      // even if the script element is removed. Keep duration very low to work around.
      //
      // Sleep 50ms
      url += "&sleep=" + (sleep || 50);
      this.request(url);
    },

    isInDom: function(elem) {
      return elem.parentNode ? true : false;
    },

    isIeBelow: function(version) {
      return qx.core.Environment.get("engine.name") === "mshtml" &&
             qx.core.Environment.get("browser.documentmode") < version;
    },

    supportsErrorHandler: function() {
      var isLegacyIe = qx.core.Environment.get("engine.name") === "mshtml" &&
        qx.core.Environment.get("browser.documentmode") < 9;

      var isOpera = qx.core.Environment.get("engine.name") === "opera";

      return !(isLegacyIe || isOpera);
    },

    noCache: function(url) {
      return url + "?nocache=" + (new Date()).valueOf();
    },

    skip: function(msg) {
      throw new qx.dev.unit.RequirementError(null, msg);
    }
  }
});
