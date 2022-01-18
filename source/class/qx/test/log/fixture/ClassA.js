qx.Class.define("qx.test.log.fixture.ClassA", {
  extend: qx.core.Object,

  construct() {
    this._callCountApplyOldProperty = 0;
    this._callCountApplyNewProperty = 0;

    qx.log.Logger.deprecateMethodOverriding(
      this,
      qx.test.log.fixture.ClassA,
      "_applyOldProperty"
    );
  },

  properties: {
    oldProperty: {
      init: "oldProperty",
      apply: "_applyOldProperty"
    },

    newProperty: {
      init: "newProperty",
      apply: "_applyNewProperty"
    }
  },

  members: {
    _callCountApplyOldProperty: null,
    _callCountApplyNewProperty: null,

    _applyOldProperty() {
      this._callCountApplyOldProperty++;
    },

    _applyNewProperty() {
      this._callCountApplyNewProperty++;
    },

    getCallCountApplyOldProperty() {
      return this._callCountApplyOldProperty;
    },

    getCallCountApplyNewProperty() {
      return this._callCountApplyNewProperty;
    }
  }
});
