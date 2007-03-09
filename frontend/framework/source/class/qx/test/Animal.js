qx.Class.define("qx.test.Animal",
{
  type : "abstract",
  extend : qx.core.Target,


  /**
   * @type constructor
   * @param name {String} name of the animal
   */
  construct : function(name)
  {
    this.base(arguments);
    this.name = name;
  },

  properties :
  {
    width : { init : 100, appearance : true },
    height : { init : 30, appearance : true },

    _boxWidth : { },
    _boxHeight: { },
    _enabled : { init : "inherit", inheritable : true },
    _target : { validation : "qx.core.Target" },
    _string : { validation : "String" },
    _complex :
    {
      validation : function(value)
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

      setter : function(value, old)
      {
        this.debug("Setter executed with: " + old + " => " + value);
      }
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
    makeSound : function() {}
  }
});
