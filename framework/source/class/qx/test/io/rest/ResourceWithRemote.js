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

#asset(qx/test/xmlhttp/random.php)
#asset(qx/test/xmlhttp/long_poll.php)
#asset(qx/test/xmlhttp/sample.txt)

************************************************************************ */

qx.Class.define("qx.test.io.rest.ResourceWithRemote",
{
  extend : qx.dev.unit.TestCase,

  include : [qx.dev.unit.MRequirements,
             qx.test.io.MRemoteTest],

  members :
  {
    setUp: function() {
      this.require(["http"]);
      this.res = new qx.io.rest.Resource();
    },

    tearDown: function() {
      this.res.dispose();
    },

    "test: invoke action and handle response": function() {
      // Handles GET
      var url = this.getUrl("qx/test/xmlhttp/sample.txt"),
          res = this.res;

      res.map("get", "GET", url);
      res.addListener("getSuccess", function(e) {
        this.resume(function() {
          this.assertEquals("SAMPLE", e.getData());
        }, this);
      }, this);

      res.get();
      this.wait();
    },

    "test: invoke action and handle failure": function() {
      this.require(["http"]);

      var url = "/not-found",
          res = this.res;

      res.map("get", "GET", url);
      res.addListener("error", function(e) {
        this.resume(function() {
          this.assertEquals("statusError", e.getPhase());
          this.assertEquals("get", e.getAction());
        }, this);
      }, this);

      res.get();
      this.wait();
    },

    "test: poll action": function() {
      // Handles GET
      var url = this.getUrl("qx/test/xmlhttp/random.php"),
          res = this.res,
          count = 0,
          previousResponse = "";

      res.map("get", "GET", url);

      // Response headers must contain explicit cache control for this
      // to work in IE
      res.addListener("getSuccess", function(e) {
        var response = e.getData();
        count++;

        this.assert(response.length === 32, "Response must be MD5");
        this.assertNotEquals(previousResponse, response,
          "Response must be different from previous");
        previousResponse = response;

        if (count >= 10) {
          this.resume();
        }

      }, this);

      res.poll("get", 100);
      this.wait();
    },

    "test: long poll": function() {
      var res = this.res,
          url = this.getUrl("qx/test/xmlhttp/long_poll.php"),
          count = 0,
          responses = [];

      res.map("get", "GET", url);
      res.addListener("getSuccess", function(e) {
        var response = e.getData();
        responses.push(response);

        if (++count >= 5) {
          this.resume(function() {
            this.assert(parseFloat(responses[4]) > parseFloat(responses[0]),
              "Must increase");
          }, this);
        }
      }, this);

      res.longPoll("get");
      this.wait();
    }

  }
});
