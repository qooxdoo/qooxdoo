qx.Interface.define("qx.core.property.ICheck", {
  members: {
    /**
     * Tests whether the value matches the compatibility constraints in this check
     * @param {*} value
     * @return {Boolean}
     */
    matches(value) {},

    /**
     * Tests whether the value is nullable
     *
     * @return {Boolean}
     */
    isNullable() {}
  }
});
