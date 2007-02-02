qx.Clazz.define("qx.test.Animal",
{
  extend : qx.core.Target,

  construct : function() {
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
