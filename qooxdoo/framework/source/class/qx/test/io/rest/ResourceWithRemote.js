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

      // Accepts GET and POST
      var url = this.getUrl("qx/test/xmlhttp/sample.txt"),
          res = this.res;

      res.route("GET", url, "index");
      res.addListener("indexSuccess", function(e) {
        var response = e.getData();
        this.resume(function() {
          this.assertEquals("SAMPLE", response);
        }, this);
      }, this);

      res.index();
      this.wait();
    }

  }
});
