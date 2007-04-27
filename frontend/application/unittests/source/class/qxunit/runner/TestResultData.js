
qx.Class.define("qxunit.runner.TestResultData",
{
  extend : qx.core.Target,

  construct : function(testName)
  {
    this.base(arguments);
    this.setName(testName);
  },

  properties :
  {
    name :
    {
      check : "String"
    },

    state :
    {
      check : ["start", "error", "failure", "success"],
      init : "start",
      event : "changeState"
    },

    message :
    {
      check : "String",
      init : ""
    }

  }

});