/*
#id(qx.test.Animal)
#require(qx.Clazz)
*/

qx.Clazz.define("qx.test.Animal",
{
  extend : qx.core.Target,

  init : function() {
    arguments.callee.base.call(this);
  },

  properties_ng :
  {
    hungry :
    {
      validation : "boolean",
      init : true
    }
  },

  members :
  {
    name : "",
    makeSound : function() {}
  }
});
