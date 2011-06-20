/* ************************************************************************

#asset(qx/test/xmlhttp/random.php)
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

      res.map("GET", url, "index");
      res.addListener("indexSuccess", function(e) {
        this.resume(function() {
          this.assertEquals("SAMPLE", e.getData());
        }, this);
      }, this);

      res.index();
      this.wait();
    },

    "test: invoke action and handle failure": function() {
      this.require(["http"]);

      var url = "/not-found",
          res = this.res;

      res.map("GET", url, "index");
      res.addListener("error", function(e) {
        this.resume(function() {
          this.assertEquals("statusError", e.getPhase());
          this.assertEquals("index", e.getAction());
        }, this);
      }, this);

      res.index();
      this.wait();
    },

    "test: invoke first poll later": function() {
      // Handles GET
      var url = this.getUrl("qx/test/xmlhttp/random.php"),
          res = this.res,
          count = 0,
          previousResponse = "";

      res.map("GET", url, "index");
      res.addListener("indexSuccess", function(e) {
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

      qx.event.Timer.once(function() {
        res.index();
      }, this, 100);

      res.poll("index", 100);
      this.wait();
    }

  }
});
