qx.Class.define("qx.test.log.fixture.ClassB2",
{
  extend : qx.test.log.fixture.ClassA,

  members :
  {
    _applyNewProperty: function () {
      this.base(arguments)

      this._callCountApplyNewProperty++;
    }
  }
});
