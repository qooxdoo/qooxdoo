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

  include : qx.test.io.MRemoteTest,

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

    "test: should GET resource": function() {
      if (this.isLocal) {
        return;
      }

      var req = this.req;
      var url = this.getUrl("qx/test/xmlhttp/echo_get_request.php");
      url = url + "?affe=true";
      req.open("GET", url);

      var that = this;
      req.onreadystatechange = function() {
        if (req.readyState == 4) {
          that.resume(function() {
            that.assertEquals('{"affe":"true"}', req.responseText);
          });
        }
      }
      req.send();

      this.wait();
    },

    "test: should GET XML resource": function() {
      if (this.isLocal) {
        return;
      }

      var req = this.req;
      var url = this.getUrl("qx/test/xmlhttp/animals.xml");

      req.open("GET", url);

      var that = this;
      req.onreadystatechange = function() {
        if (req.readyState == 4) {
          that.resume(function() {
            var document = req.responseXML;
            var monkeys = document.getElementsByTagName("monkey");
            that.assertObject(monkeys);
            that.assertEquals(1, monkeys.length);
          });
        }
      }
      req.send();

      this.wait();
    },

    "test: should allow many requests with same object": function() {
      if (this.isLocal) {
        return;
      }

      var req = this.req;
      var url = this.getUrl("qx/test/xmlhttp/echo_get_request.php");
      var count = 0;

      function request() {
        req.open("GET", url + "?1");
        req.send();
      }

      req.onreadystatechange = function() {
        if (req.readyState == 4) {
          count++;
          if (count < 3) {
            request();
          }
        }
      };
      request();

      var that = this;
      this.wait(500, function() {
        that.assertEquals(3, count);
      });
    },

    "test: should abort pending request": function() {
      if (this.isLocal) {
        return;
      }

      var req = this.req;
      var url = this.getUrl("qx/test/xmlhttp/echo_get_request.php");

      req.open("GET", url + "?sleep=1");
      req.send();
      req.abort();

      var that = this;
      this.wait(function() {
        that.assertNotEquals(4, req.readyState, "Request must not complete");
      }, 1500);
    },

    "test: should call onreadystatechange once for OPEN": function() {
      if (this.isLocal) {
        return;
      }

      this.needsPHPWarning();

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

      req.open("GET", url);
      req.send();

      this.wait();
    },

    // Bugfix
    "test: should dispose hard-working": function() {
      if (this.isLocal) {
        return;
      }

      var req = this.req;
      var url = this.getUrl("qx/test/xmlhttp/echo_get_request.php");
      req.open("GET", url);

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
    }

  }
});
