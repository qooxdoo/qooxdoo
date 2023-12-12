qx.Class.define("qx.test.html.ExampleLevelTwoElement", {
  extend: qx.html.Element,

  construct() {
    super();
    this.add(this.getQxObject("levelTwo-elementAlpha"));
    this.add(this.getQxObject("levelTwo-elementBravo"));
  },

  members: {
    _createQxObjectImpl(id) {
      switch (id) {
        case "levelTwo-elementAlpha":
          return <div id="my-levelTwo-elementAlpha"></div>;

        case "levelTwo-elementBravo":
          return <div></div>;
      }

      return super._createQxObjectImpl(id);
    }
  }
});
