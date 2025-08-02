qx.Class.define("qx.test.ui.core.AppearanceTest", {
  extend: qx.ui.core.Widget,
  construct() {
    super();
    this._setLayout(new qx.ui.layout.Grow());
  },
  members: {
    _createChildControlImpl(id, hash) {
      if (id == "text" || id == "text2") {
        var control = new qx.ui.form.TextField("affe");
        this._add(control);
        return control;
      }
      return super._createChildControlImpl(id);
    }
  }
});
