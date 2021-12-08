qx.Class.define("qx.tool.compiler.MyClass", {
  extend: qx.core.Object,

  /**
   * Some Docs
   */
  construct: function () {
    this.base(arguments);
    this.addListener(
      "changeBlah",
      function (abc) {
        return abc;
      },
      this
    );
    this.addListener(
      "changeBlah",
      this.someFunction,
      this
    );
  },

  members: {
    /**
     * Some doc
     * @param {*} abc 
     */
    someFunction: /*one*/ function /* two */ (abc) /* three */{
      /* four */
    },

    /**
     * Another doc
     * @param {*} def 
     */
    otherFunction(def) {

    }
  }
});
