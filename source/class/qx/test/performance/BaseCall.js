/**
 * @ignore(qx.test.performance.Base.*)
 * @ignore(qx.test.performance.Extend)
 */

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

qx.Class.define("qx.test.performance.Base", {
  extend: qx.core.Object,

  members: {
    foo_base(a, b, c) {}
  }
});

/**
 * @ignore(qx.test.performance.Base.*)
 */
qx.Class.define("qx.test.performance.Extend", {
  extend: qx.test.performance.Base,

  members: {
    foo_base(a, b, c) {
      super.foo_base(a, b, c);
    },

    foo_call(a, b, c) {
      qx.test.performance.Base.prototype.foo_base.call(this, a, b, c);
    },

    foo_apply(a, b, c) {
      qx.test.performance.Base.prototype.foo_base.apply(this, arguments);
    }
  }
});
