qx.Interface.define("qx.test.IPlayable",
{

  extend : [qx.test.IThing],

  statics :
  {
    /** {var} TODOC */
    DEFAULT_GAME : "rollerball"
  },

  members :
  {
    /**
     * TODOC
     *
     * @type member
     * @return {Boolean} TODOC
     */
    play : function() {
      return true;
    }
  }
});
