
/**
 * Test fixture for async: true property attribute migration.
 * The `async: true` key is no longer supported in v8 — all properties
 * automatically have async access methods.
 */
qx.Class.define("qxl.test8.AsyncPropertyTest", {
  extend: qx.core.Object,

  properties: {
    name: {
      init: "",
      check: "String",
      apply: "_applyName",
      event: "changeName",
      async: true
    },

    value: {
      nullable: true,
      async: true
    }
  },

  members: {
    _applyName(name) {
      return new qx.Promise(function (fulfilled) {
        fulfilled();
      });
    }
  }
});
