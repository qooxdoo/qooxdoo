/*
#require(qx.test.MFat)
*/

qx.Clazz.define("qx.test.Kitty",
{
  extend : qx.test.Cat,
  implement : [ qx.test.IPet ],

  include : [ qx.test.MMoody /*, qx.test.MFat */ ],


  /**
   * TODOC
   *
   * @type constructor
   */
  construct : function() {
    this.base(arguments);
  },

  properties :
  {
    color :
    {
      _legacy      : true,
      type         : "string",
      defaultValue : "black"
    }
  },

  members :
  {
    /** {var} TODOC */
    name : "KittyName",


    /**
     * TODOC
     *
     * @type member
     * @return {void}
     */
    makeSound : function() {
      this.debug("RRRRRRRRRRH!");
    },


    /**
     * TODOC
     *
     * @type member
     * @return {void}
     */
    smooch : function() {
      this.debug("Mmmh, I like smooching.");
    },


    /**
     * TODOC
     *
     * @type member
     * @return {void}
     */
    play : function() {
      this.debug("I am playing.");
    },


    /**
     * TODOC
     *
     * @type member
     * @return {boolean} TODOC
     */
    hasSoul : function() {
      return true;
    }
  }
});
