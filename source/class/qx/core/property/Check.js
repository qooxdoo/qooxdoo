qx.Bootstrap.define("qx.core.property.Check", {
  extend: qx.core.Object,
  implement: [qx.core.property.ICheck],

  /**
   * Constructor for most check expressions supported by Qooxdoo properties out of the box
   *
   * @param {String} check
   */
  construct(check) {
    super();
    this.__check = check;
  },

  members: {
    /** @type{String} the check expression */
    __check: null,

    /**
     * @override
     */
    matches(value) {
      return true;
    },

    /**
     * @override
     */
    isNullable() {
      return false;
    }
  }
});
