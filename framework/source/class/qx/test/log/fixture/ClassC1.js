qx.Class.define("qx.test.log.fixture.ClassC1",
{
  extend : qx.test.log.fixture.ClassB1,

  members :
  {
    _applyNewProperty: function () {
      this.base(arguments)

      this._callCountApplyNewProperty++;
    }
  }
});
