qx.Class.define("qx.test.log.fixture.ClassB1",
{
  extend : qx.test.log.fixture.ClassA,

  members :
  {
    _applyOldProperty: function () {
      this.base(arguments)

      this._callCountApplyOldProperty++;
    },

    _applyNewProperty: function () {
      this.base(arguments)

      this._callCountApplyNewProperty++;
    }
  }
});
