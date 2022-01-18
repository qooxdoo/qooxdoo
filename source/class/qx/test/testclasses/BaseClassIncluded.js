qx.Class.define("qx.test.testclasses.BaseClassIncluded", {
  extend: qx.test.testclasses.RootClass,
  include: [qx.test.testclasses.MMixinOne, qx.test.testclasses.MMixinTwo],

  construct() {
    super();
    this.state.push("base");
  }
});
