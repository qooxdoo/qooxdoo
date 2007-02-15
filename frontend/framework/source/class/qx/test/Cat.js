qx.Clazz.define("qx.test.Cat",
{
  extend : qx.test.Animal,

  construct : function()
  {
    arguments.callee.base.call(this);

    this.debug("Static property: " + arguments.callee.self.static_prop1);
  },

  statics :
  {
    static_prop1 : 3.141,

    doSomething : function() {
      return this.doSomethingElse();
    },

    doSomethingElse : function() {
      return this.static_prop1;
    }
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
    play : function()
    {
      this.debug("Don't know how to play! [1] (" + arguments.callee.self.static_prop1 + ")");
      this.debug("Don't know how to play! [2] (" + this.self(arguments).static_prop1 + ")");
      this.debug("Don't know how to play! [3] (" + this.self(arguments).doSomethingElse() + ")");
    }
  },

  defer : function(statics, members, properties)
  {
    members.fooBar = members.makeSound;
    properties.add("sound", { compat : true, type : "string" });
  }
});
