qx.Class.define("qx.test.io.request.Jsonp",
{
  extend : qx.dev.unit.TestCase,

  include : [qx.test.io.MRemoteTest,
             qx.dev.unit.MMock,
             qx.dev.unit.MRequirements],

  members :
  {
    setUp: function() {
      this.setUpRequest();
    },

    setUpRequest: function() {
      this.req = new qx.io.request.Jsonp;
      this.req.setUrl("url");
    },

    setUpFakeTransport: function() {
      this.transport = this.stub(new qx.bom.request.Jsonp());
      this.stub(this.transport, "open");
      this.stub(this.transport, "setRequestHeader");
      this.stub(this.transport, "send");
      this.stub(this.transport, "abort");
      this.stub(qx.io.request.Jsonp.prototype, "_createTransport").
          returns(this.transport);

      this.setUpRequest();
    },

    tearDown: function() {
      this.getSandbox().restore();
      this.req.dispose();

      // May fail in IE
      try { qx.Class.undefine("Klass"); } catch(e) {}
    },

    "test: get transport": function() {
      this.setUpFakeTransport();
      this.assertEquals(this.transport, this.req.getTransport());
    },

    "test: fetch json": function() {
      var req = new qx.io.request.Jsonp(),
          url = this.noCache(this.getUrl("qx/test/jsonp_primitive.php"));

      req.addListener("load", function(e) {
        this.resume(function() {
          this.assertObject(req.getResponse());
          this.assertTrue(req.getResponse()["boolean"]);
        }, this);
      }, this);

      req.setUrl(url);
      req.send();

      this.wait();
    },

    noCache: function(url) {
      return qx.util.Uri.appendParamsToUrl(url, "nocache=" + (new Date).valueOf());
    }

  }
});
