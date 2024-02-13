qx.Class.define("qx.test.html.ExampleElement$b1", {
  extend: qx.html.Element,
  construct() {
    super();
    this.setAttribute("id", "elem-b1");
    this.add(this.getQxObject("b2"));
  },
  members: {
    _createQxObjectImpl(id) {
      switch (id) {
        case "b2": {
          return new qx.test.html.ExampleElement$b1$b2();
        }
      }
      return super._createQxObjectImpl(id);
    }
  }
});
