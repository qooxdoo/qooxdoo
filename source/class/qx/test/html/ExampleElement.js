qx.Class.define("qx.test.html.ExampleElement", {
  extend: qx.html.Element,

  construct() {
    super();
    this.add(this.getQxObject("a1"));
    this.add(this.getQxObject("b1"));
  },

  objects: {
    a1() {
      return <div id="elem-a1">{this.getQxObject("a2")}</div>;
    },
    a2() {
      return <div id="elem-a2">{this.getQxObject("a3")}</div>;
    },
    a3() {
      return <div id="elem-a3">Group A end</div>;
    },

    b1() {
      return new qx.test.html.ExampleElement$b1();
    }
  }
});
