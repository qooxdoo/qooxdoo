qx.Class.define("qx.test.log.fixture.ClassB1", {
  extend: qx.test.log.fixture.ClassA,

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
