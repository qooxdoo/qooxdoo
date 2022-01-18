qx.Class.define("qx.test.log.fixture.ClassC2", {
  extend: qx.test.log.fixture.ClassB2,

  members: {
    _applyOldProperty() {
      super._applyOldProperty();

      this._callCountApplyOldProperty++;
    },

    _applyNewProperty() {
      super._applyNewProperty();

      this._callCountApplyNewProperty++;
    }
  }
});
