/*
#require(qx.Clazz)
*/

qx.Clazz.define("qx.test.Lion",
{
  extend : qx.test.Cat,

  init : function() {
    arguments.callee.base.call(this);
  },

  properties :
  {
    color : {
      init : "brown"
    }
  },

  members :
  {
    name : "LionName",

    makeSound : function() {
     this.debug("WOOOOOAAAAAHH!!!");
    },

    play : function() {
     arguments.callee.base.call(this);
    }
  }
});
