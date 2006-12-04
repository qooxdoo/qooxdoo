/*
#id(qx.test.Lion)
#require(qx.Clazz)
#require(qx.test.Cat)
*/

qx.Clazz.define("qx.test.Lion",
{
  extend : qx.test.Cat,

  init : function() {
    arguments.callee.base.call(this);
  },

  properties_ng :
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
