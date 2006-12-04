/*
#id(qx.test.Cat)
#require(qx.Clazz)
*/

qx.Clazz.define("qx.test.Cat",
{
  extend : qx.test.Animal,

  init : function() {
    arguments.callee.base.call(this);
  },

  statics :
  {
    static_prop1 : 3.141
  },

  properties_ng :
  {
    color : {
      init : "red"
    }
  },

  members :
  {
    name : "",

    makeSound : function() {
     this.debug("MEOW! MEOW!");
    },

    play : function() {
     this.debug("Don't know how to play!");
    }
  }
});
