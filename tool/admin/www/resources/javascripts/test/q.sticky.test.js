testrunner.define({
  className: "q.org.sticky",

  setUp: function() {
    this.sticky = new qx.org.Sticky(q("#sticky"), 10);
  },

  "test: new": function() {
    this.assertObject(this.sticky);
  }
});