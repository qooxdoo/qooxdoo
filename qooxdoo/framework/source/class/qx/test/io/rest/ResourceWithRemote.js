qx.Class.define("qx.test.io.rest.ResourceWithRemote",
{
  extend : qx.dev.unit.TestCase,

  include : [qx.dev.unit.MRequirements,
             qx.test.io.MRemoteTest],

  members :
  {
    setUp: function() {
      this.res = new qx.io.rest.Resource();
    },

    tearDown: function() {
      this.res.dispose();
    },

    "test: invoke action and handle response": function() {
      this.require(["http"]);

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
    }

  }
});
