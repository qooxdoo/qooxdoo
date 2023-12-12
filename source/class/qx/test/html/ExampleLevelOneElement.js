qx.Class.define("qx.test.html.ExampleLevelOneElement", {
  extend: qx.html.Element,

  construct() {
    super();
    this.add(this.getQxObject("levelOne-twoAlpha"));
  },

  members: {
    _createQxObjectImpl(id) {
      switch (id) {
        case "levelOne-twoAlpha":
          var tmp = new qx.test.html.ExampleLevelTwoElement();
          tmp.setAttribute("id", "my-levelOne-twoAlpha");
          tmp.add(this.getQxObject("levelOne-element"));
          return tmp;

        case "levelOne-element":
          return <div id="my-levelOne-element"></div>;
      }

      return super._createQxObjectImpl(id);
    }
  }
});
