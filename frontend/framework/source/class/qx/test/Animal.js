qx.Class.define("qx.test.Animal",
{
  type : "abstract",
  extend : qx.core.Target,


  /**
   * @type constructor
   * @param name {String} name of the animal
   */
  construct : function(name, width)
  {
    this.base(arguments);
    this.name = name;


  },

  properties :
  {
    width : { init : 100, check : "Number", themeable : true }, //some comment
    height : { init : 30, check : "Number", themeable : true },
    dimension : { group : ["width", "height"], mode:"shorthand" },

    _boxWidth : { nullable : true },
    _boxHeight: { nullable : true },
    _enabled : { init : "inherit", inheritable : true, check : "Boolean" },
    _target : { check : "qx.core.Target", nullable : true },
    _string : { check : "String", init : "" },
    _object : { check : "Object", nullable : true },
    _possible : { check : [ "foo", "bar", "hello", "world" ], nullable : true },
    _group : { group : [ "_enabled", "_target", "_string", "_object" ], themeable : true },

    /**
     * Complex property.
     */

    _complex :
    {
      check : function(value)
      {
        switch(typeof value)
        {
          case "string":
          case "number":
            return true;
        }

        return false;
      },

      init : 10,

      event : "upps",
      apply : "_applyComplex",
      nullable : true
    },


    test1 : { _legacy : true },
    test2 : { nullable : true },

    test3 : { _legacy : true, type : "number" },
    test4 : { check : "Number", nullable : true }

  },

  members :
  {
    /** {var} TODOC */
    name      : "",


    /**
     * TODOC
     *
     * @type member
     * @return {void}
     */
    makeSound : function() {},


    _applyComplex : function(value, old) {
      //this.debug("Apply executed: " + value);
    }
  }
});
