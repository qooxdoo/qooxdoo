qx.Clazz.define("qx.test.Animal",
{
  extend : qx.core.Target,


  /**
   * TODOC
   *
   * @type constructor
   */
  construct : function() {
    arguments.callee.base.call(this);
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
