qx.Interface.define("qx.test.IPet",
{
  extend : [ qx.test.IHumanlike, qx.test.IPlayable ],

  properties :
  {
    "color" : true
  },

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
