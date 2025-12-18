qx.Class.define("qxl.test8.PropertyConflictTest", {
  extend: qx.core.Object,

  properties: {
    // These properties conflict with members below
    name: {
      check: "String",
      init: "default"
    },

    value: {
      check: "Integer",
      init: 0
    },

    // This property does NOT conflict
    title: {
      check: "String",
      init: "Title"
    }
  },

  members: {
    // Conflict: same name as property
    name() {
      return "name method";
    },

    // Conflict: same name as property
    value() {
      return 42;
    },

    // No conflict: different name from any property
    getTitle() {
      return this.getTitle();
    }
  }
});
