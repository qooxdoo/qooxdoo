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

qx.Class.define("qx.test.bom.request.XhrWithBackend",
{
  extend : qx.dev.unit.TestCase,

  include : [qx.test.io.MRemoteTest,
             qx.dev.unit.MMock],

  construct : function()
  {
    this.base(arguments);
  },

  members :
  {

    req : null,

    setUp: function() {
      // All tests in this case require PHP
      this.needsPHPWarning();

      this.req = new qx.bom.request.Xhr();
    },

    tearDown: function() {
      this.req.dispose();
    },

    //
    // Basic
    //

    "test: should GET": function() {
      if (this.isLocal()) {
        return;
      }

      var req = this.req;
      var url = this.getUrl("qx/test/xmlhttp/echo_get_request.php");
      url = url + "?affe=yippie&nocache=" + Math.random();
      req.open("GET", url);

      var that = this;
      req.onreadystatechange = function() {
        if (req.readyState == 4) {
          that.resume(function() {
            var data = qx.lang.Json.parse(req.responseText);
            that.assertEquals("yippie", data["affe"]);
          });
        }
      }
      req.send();

      this.wait();
    },

    "test: should GET XML": function() {
      if (this.isLocal()) {
        return;
      }

      var req = this.req;
      var url = this.getUrl("qx/test/xmlhttp/sample.xml");

      req.open("GET", this.noCache(url));

      var that = this;
      req.onreadystatechange = function() {
        if (req.readyState == 4) {
          that.resume(function() {
            that.assertObject(req.responseXML.documentElement, "Must be XML");
          });
        }
      }
      req.send();

      this.wait();
    },

    "test: should POST": function() {
      if (this.isLocal()) {
        return;
      }

      var req = this.req;
      var url = this.getUrl("qx/test/xmlhttp/echo_post_request.php");
      req.open("POST", this.noCache(url));
      req.setRequestHeader("Content-type", "application/x-www-form-urlencoded");

      var that = this;
      req.onreadystatechange = function() {
        if (req.readyState == 4) {
          that.resume(function() {
            that.assertEquals('{"affe":"true"}', req.responseText);
          });
        }
      }
      req.send("affe=true");

      this.wait();
    },

    "test: should have readyState UNSENT": function() {
      if (this.isLocal()) {
        return;
      }

      var req = this.req;
      this.assertIdentical(0, req.readyState);
    },

    "test: should have readyState OPENED": function() {
      if (this.isLocal()) {
        return;
      }

      var req = this.req;
      var url = this.getUrl("qx/test/xmlhttp/echo_post_request.php");
      req.open("GET", this.noCache(url));

      this.assertIdentical(1, req.readyState);
    },

    // BUGFIX
    // This is a mess, see
    // http://www.quirksmode.org/blog/archives/2005/09/xmlhttp_notes_r_2.html.
    "test: should progress to readyState DONE": function() {
      if (this.isLocal()) {
        return;
      }

      var req = this.req,
          states = [],
          that = this;

      req.onreadystatechange = function() {
        states.push(req.readyState);
        if (req.readyState == 4) {
          that.resume(function() {
            that.assertArrayEquals([1, 2, 3, 4], states);
          });
        }
      }

      var url = this.getUrl("qx/test/xmlhttp/echo_post_request.php");
      req.open("GET", this.noCache(url));
      req.send();

      this.wait();
    },

    // "test: should progress to readyState DONE synchronously": function() {
    //   if (this.isLocal()) {
    //     return;
    //   }
    // 
    //   var req = this.req,
    //       states = [];
    // 
    //   req.onreadystatechange = function() {
    //     states.push(req.readyState);
    //   }
    // 
    //   var url = this.getUrl("qx/test/xmlhttp/echo_post_request.php");
    //   req.open("GET", this.noCache(url), false);
    //   req.send();
    //   this.assertArrayEquals([1, 2, 3, 4], states);
    // },

    "test: should allow many requests with same object": function() {
      if (this.isLocal()) {
        return;
      }

      var req = this.req;
      var url = this.getUrl("qx/test/xmlhttp/echo_get_request.php");
      var count = 0;

      var that = this;
      function request() {
        req.open("GET", that.noCache(url));
        req.send();
      }

      var that = this;
      req.onreadystatechange = function() {
        if (req.readyState == 4) {
          that.resume(function() {
            if (++count < 3) {
              request();
              this.wait();
            } else {
              that.assertEquals(3, count);
            }
          })
        }
      };
      request();

      this.wait();
    },

    "test: should abort pending request": function() {
      if (this.isLocal()) {
        return;
      }

      var req = this.req;
      var url = this.getUrl("qx/test/xmlhttp/echo_get_request.php");

      req.open("GET", this.noCache(url));
      req.abort();

      this.assertNotEquals(4, req.readyState, "Request must not complete");
    },

    //
    // onreadystatechange()
    //

    "test: should call onreadystatechange once for OPEN": function() {
      if (this.isLocal()) {
        return;
      }

      var req = this.req;
      var url = this.getUrl("qx/test/xmlhttp/echo_get_request.php");

      var that = this;
      var count = 0;
      req.onreadystatechange = function() {
        // Count call for state OPENED
        if (req.readyState == 1) {
          count = count + 1;
        }

        // Assert when DONE
        if (req.readyState == 4) {
          that.resume(function() {
            // onreadystatechange should have only be called
            // once for state OPENED
            that.assertEquals(1, count);
          });
        }
      };

      req.open("GET", this.noCache(url));
      req.send();

      this.wait();
    },

    "test: should not call onreadystatechange when aborting OPENED": function() {
      if (this.isLocal()) {
        return;
      }

      var req = this.req;

      // OPENED, without send flag
      var url = this.getUrl("qx/test/xmlhttp/echo_get_request.php");
      req.open("GET", this.noCache(url));

      this.spy(req, "onreadystatechange");
      req.abort();

      this.wait(100, function() {
        this.assertNotCalled(req.onreadystatechange);
      }, this);
    },

    "test: should call onreadystatechange when aborting LOADING": function() {
      if (this.isLocal()) {
        return;
      }

      var req = this.req;
      var that = this;

      req.onreadystatechange = function() {
        if (req.readyState == 4) {
          that.resume();
        }
      }

      // Will "never" complete
      // OPENED, finally LOADING
      var url = this.getUrl("qx/test/xmlhttp/loading.php");
      req.open("GET", url + "?duration=100");
      req.send();

      window.setTimeout(function() {
        req.abort();
      }, 100);

      this.wait();
    },

    //
    // Disposing
    //

    // BUGFIX
    "test: should dispose hard-working": function() {
      if (this.isLocal()) {
        return;
      }

      var req = this.req;
      var url = this.getUrl("qx/test/xmlhttp/echo_get_request.php");
      req.open("GET", this.noCache(url));

      var that = this;
      req.onreadystatechange = function() {
        if (req.readyState == 4) {
          that.resume(function() {
            // Must not throw error
            req.dispose();
          });
        }
      }
      req.send();

      this.wait();
    },
    
    noCache: function(url) {
      return url + "?nocache=" + Math.random();
    }
  }
});
