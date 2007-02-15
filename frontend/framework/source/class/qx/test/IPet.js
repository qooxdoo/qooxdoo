qx.Interface.define("qx.test.IPet",
{
  extend : [ qx.test.IHumanlike, qx.test.IPlayable ],

  members :
  {
    /**
     * TODOC
     *
     * @type member
     * @return {boolean} TODOC
     */
    smooch : function() {
      return true;
    }
  }
});
