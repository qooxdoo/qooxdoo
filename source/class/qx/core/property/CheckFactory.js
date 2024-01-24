qx.Class.define("qx.core.property.CheckFactory", {
  extend: qx.core.Object,
  type: "singleton",

  construct() {
    super();
    this.__checks = {};
  },

  members: {
    /** @type{Object<String,qx.core.property.ICheck} the list of known checks */
    __checks: null,

    /**
     * Gets a `qx.core.property.Check` instance that can be used to verify property value
     * compatibility; note that one will be created if it does not already exist
     *
     * @param {String} expr
     * @return {qx.core.property.Check}
     */
    getCheck(expr) {
      let check = this.__checks[expr];
      if (check == null) {
        check = new qx.core.property.Check(expr);
        this.__checks[expr] = check;
      }
      return check;
    },

    /**
     * Adds a check for a given expression - cannot be used to change an existing expression
     *
     * @param {String} expr the string expression to match
     * @param {qx.core.property.ICheck} check the check instance
     */
    addCheck(expr, check) {
      if (this.__checks[expr]) {
        throw new Error("Check already exists for " + expr);
      }
      this.__checks[expr] = check;
    }
  }
});
