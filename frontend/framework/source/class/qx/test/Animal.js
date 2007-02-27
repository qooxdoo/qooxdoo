qx.Clazz.define("qx.test.Animal",
{
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
