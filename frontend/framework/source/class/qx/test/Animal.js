qx.Clazz.define("qx.test.Animal",
{
  extend : qx.core.Target,

  init : function() {
    arguments.callee.base.call(this);
  },

  properties :
  {

  },

  members :
  {
    name : "",
    makeSound : function() {}
  }
});
