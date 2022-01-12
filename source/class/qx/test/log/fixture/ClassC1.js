qx.Class.define("qx.test.log.fixture.ClassC1", {
  extend: qx.test.log.fixture.ClassB1,

  members: {
    _applyNewProperty() {
      super._applyNewProperty();

      this._callCountApplyNewProperty++;
    }
  }
});
