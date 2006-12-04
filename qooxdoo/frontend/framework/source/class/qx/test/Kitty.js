/*
#id(qx.test.Kitty)
#require(qx.Clazz)
#require(qx.test.Cat)
#require(qx.test.IPet)
#require(qx.test.MMoody)
*/

qx.Clazz.define("qx.test.Kitty",
{
  extend : qx.test.Cat,

  implement : [
    qx.test.IPet
  ],

  include : [
    qx.test.MMoody
  ],

  init : function() {
    arguments.callee.base.call(this);
  },

  properties_ng :
  {
    /*
    color : {
      init : "black"
    }
    */
  },

  members :
  {
    name : "KittyName",

    makeSound : function() {
     this.debug("RRRRRRRRRRH!");
    },

    smooch : function() {
     this.debug("Mmmh, I like smooching.");
    },

    play : function() {
     this.debug("I am playing.");
    }
  }
});
