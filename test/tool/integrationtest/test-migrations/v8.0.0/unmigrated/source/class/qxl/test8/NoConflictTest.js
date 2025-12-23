qx.Class.define("qxl.test8.NoConflictTest", {
  extend: qx.core.Object,

  properties: {
    // These properties don't conflict with any members
    name: {
      check: "String",
      init: "default"
    },

    value: {
      check: "Integer",
      init: 0
    },

    enabled: {
      check: "Boolean",
      init: true
    }
  },

  members: {
    // No conflicts: different names from properties
    getName() {
      return this.getName();
    },

    getValue() {
      return this.getValue();
    },

    isEnabled() {
      return this.getEnabled();
    }
  },

  statics: {
    // No conflicts: different names from properties
    create() {
      return new qxl.test8.NoConflictTest();
    }
  }
});
