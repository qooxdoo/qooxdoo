/*
#require(qx.test.MFat)
*/

qx.Class.define("qx.test.Kitty",
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
    width : { refine : true, init : 150 },
    height : { refine : true, init : 50 },

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
     * @param foo {Integer} nix besonderes
     */
    makeSound : function(foo) {
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
     * @return {Boolean} TODOC
     */
    hasSoul : function() {
      return true;
    }
  }
});
