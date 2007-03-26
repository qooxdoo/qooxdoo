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
    width : { init : 100, appearance : true },
    height : { init : 30, appearance : true },

    _boxWidth : { nullable : true },
    _boxHeight: { nullable : true },
    _enabled : { init : "inherit", inheritable : true, check : "Boolean", nullable : true },
    _target : { check : "qx.core.Target", nullable : true },
    _string : { check : "String", init : "" },
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

      event : "upps",
      apply : "_applyComplex",
      nullable : true
    }
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
      this.debug("Apply executed: " + value);
    }
  }
});
