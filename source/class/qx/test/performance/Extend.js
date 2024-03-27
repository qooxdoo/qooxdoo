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
