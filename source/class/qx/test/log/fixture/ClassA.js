qx.Class.define("qx.test.log.fixture.ClassA",
{
  extend : qx.core.Object,

  construct : function()
  {
    this._callCountApplyOldProperty = 0;
    this._callCountApplyNewProperty = 0;

    qx.log.Logger.deprecateMethodOverriding(this, qx.test.log.fixture.ClassA, "_applyOldProperty");
  },

  properties :
  {
    oldProperty : {
      init : "oldProperty",
      apply : "_applyOldProperty"
    },

    newProperty : {
      init : "newProperty",
      apply : "_applyNewProperty"
    }
  },

  members :
  {
    _callCountApplyOldProperty : null,
    _callCountApplyNewProperty : null,

    _applyOldProperty : function () {
      this._callCountApplyOldProperty++;
    },

    _applyNewProperty : function () {
      this._callCountApplyNewProperty++;
    },

    getCallCountApplyOldProperty : function () {
      return this._callCountApplyOldProperty;
    },

    getCallCountApplyNewProperty : function () {
      return this._callCountApplyNewProperty;
    }
  }
});
