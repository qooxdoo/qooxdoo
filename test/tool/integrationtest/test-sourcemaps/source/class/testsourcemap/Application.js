qx.Class.define("testsourcemap.Application", {
  extend: qx.application.Standalone,

  members: {
    main() {
      this.base(arguments);

      const root = this.getRoot();
      root.add(new qx.ui.basic.Label("fixture"), {
        left: 20,
        top: 20
      });

      throw new Error("embedded package sourcemap test");
    }
  }
});
