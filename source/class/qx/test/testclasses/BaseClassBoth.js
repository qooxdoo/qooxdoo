qx.Class.define("qx.test.testclasses.BaseClassBoth", {
  extend: qx.test.testclasses.RootClass,
  include: [qx.test.testclasses.MMixinOne],

  construct() {
    super();
    this.state.push("base");
  },

  defer() {
    qx.Class.patch(
      qx.test.testclasses.BaseClassBoth,
      qx.test.testclasses.MMixinTwo
    );
  }
});
