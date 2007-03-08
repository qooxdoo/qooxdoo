qx.Class.define("qx.test.Animal",
{
  type : "abstract",

  extend : qx.core.Target,


  /**
   * @type constructor
   * @param name {String} name of the animal
   */
  construct : function(name) {
    this.base(arguments);
    this.name = name;
  },

  properties :
  {
    width : { },
    height : { },
    _boxWidth : { },
    _boxHeight: { }

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
