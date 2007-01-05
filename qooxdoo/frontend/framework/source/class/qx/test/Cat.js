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

  properties :
  {
    color : {
      init : "red"
    },

    oldStyle : {
      defaultValue : 1,
      possibleValues : [ 1, 2, 3 ],
      type : "string",
      instance : "qx.core.Object"
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
