/*
#require(qx.Clazz)
*/
qx.Clazz.define("qx.test.Lion",
{
  extend : qx.test.Cat,

  init : function() {
    arguments.callee.base.call(this);
  },

  include : [
    qx.test.MFat
  ],

  properties :
  {
    color : {
      compat : true,
      type : "string",
      defaultValue : "yellow"
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
