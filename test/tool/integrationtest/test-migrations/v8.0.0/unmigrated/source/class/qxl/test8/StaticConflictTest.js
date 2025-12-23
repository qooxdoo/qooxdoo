qx.Class.define("qxl.test8.StaticConflictTest", {
  extend: qx.core.Object,

  properties: {
    // This property conflicts with static below
    count: {
      check: "Integer",
      init: 0
    },

    // This property also conflicts with static
    version: {
      check: "String",
      init: "1.0"
    }
  },

  members: {
    increment() {
      this.setCount(this.getCount() + 1);
    }
  },

  statics: {
    // Conflict: same name as property
    count: 0,

    // Conflict: same name as property
    version: "2.0",

    // No conflict: different name from any property
    getInstanceCount() {
      return this.count;
    }
  }
});
