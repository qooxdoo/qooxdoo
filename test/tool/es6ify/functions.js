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

  properties: {
    progress: {
      check: function(value) {
        return qx.lang.Type.isNumber(value) && value >= 0 && value <= 100;
      },
      init: 0,
      nullable: false,
      event: "changeProgress",
      apply: "_applyProgress",
    }
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
