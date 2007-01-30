/*
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
      compat : true,
      type : "string",
      defaultValue : "brown"
    }
  },

  members :
  {
    name : "",

    /** This is the documentation for the makeSound function */
    makeSound : function() {
     this.debug("MEOW! MEOW!");
    },

    /** This is the documentation for the play function */
    play : function() {
     this.debug("Don't know how to play!");
    }
  }
});
