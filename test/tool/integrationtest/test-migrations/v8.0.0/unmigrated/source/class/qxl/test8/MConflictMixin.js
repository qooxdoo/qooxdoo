qx.Mixin.define("qxl.test8.MConflictMixin", {
  properties: {
    // This property conflicts with member below
    label: {
      check: "String",
      init: "Label"
    }
  },

  members: {
    // Conflict: same name as property
    label() {
      return "label method in mixin";
    },

    // No conflict
    getLabel() {
      return this.getLabel();
    }
  }
});
