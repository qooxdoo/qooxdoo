qx.Class.define("qx.test.Animal",
{
  type : "abstract",

  extend : qx.core.Target,


  /**
   * TODOC
   *
   * @type constructor
   */
  construct : function() {
    this.base(arguments);
  },

  properties : {},

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
