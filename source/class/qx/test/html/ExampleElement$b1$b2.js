qx.Class.define("qx.test.html.ExampleElement$b1$b2", {
  extend: qx.html.Element,
  construct() {
    super();
    this.setAttribute("id", "elem-b2");
    this.add(this.getQxObject("b3"));
  },
  members: {
    _createQxObjectImpl(id) {
      switch (id) {
        case "b3": {
          return <div id="elem-b3">Group B end</div>;
        }
      }
    }
  }
});
