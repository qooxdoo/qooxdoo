qx.Class.define("qx.test.testclasses.BaseClassPatched", {
  extend: qx.test.testclasses.RootClass,

  construct() {
    super();
    this.state.push("base");
  },

  defer() {
    qx.Class.patch(
      qx.test.testclasses.BaseClassPatched,
      qx.test.testclasses.MMixinOne
    );

    qx.Class.patch(
      qx.test.testclasses.BaseClassPatched,
      qx.test.testclasses.MMixinTwo
    );
  }
});
