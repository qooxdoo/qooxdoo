qx.Class.define("qx.test.performance.BaseCall", {
  extend: qx.dev.unit.TestCase,
  include: qx.dev.unit.MMeasure,

  members: {
    ITERATIONS: 100000,

    testBaseCall() {
      var obj = new qx.test.performance.Extend();
      var self = this;
      this.measure(
        "this.base()",
        function () {
          for (var i = 0; i < self.ITERATIONS; i++) {
            obj.foo_base();
          }
        },
        function () {},
        this.ITERATIONS
      );
    },

    testPlainCall() {
      var obj = new qx.test.performance.Extend();
      var self = this;
      this.measure(
        "Base.prototype.foo_base.call",
        function () {
          for (var i = 0; i < self.ITERATIONS; i++) {
            obj.foo_call();
          }
        },
        function () {},
        this.ITERATIONS
      );
    },

    testPlainApply() {
      var obj = new qx.test.performance.Extend();
      var self = this;
      this.measure(
        "Base.prototype.foo_base.apply",
        function () {
          for (var i = 0; i < self.ITERATIONS; i++) {
            obj.foo_apply();
          }
        },
        function () {},
        this.ITERATIONS
      );
    }
  }
});
