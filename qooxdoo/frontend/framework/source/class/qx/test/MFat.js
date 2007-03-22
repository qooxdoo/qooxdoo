qx.Mixin.define("qx.test.MFat",
{
  construct : function() {
    this.debug("Constructing mixin: qx.test.MFat");
  },

  include : qx.test.MMoody,

  members :
  {
    /**
     * TODOC
     *
     * @type member
     * @return {void}
     */
    snore : function() {
      this.debug("CCRRROOOOOOOCCRROOOOO");
    }
  },

  destruct : function() {
    this.debug("Destructing mixin: qx.test.MFat");
  }
});
