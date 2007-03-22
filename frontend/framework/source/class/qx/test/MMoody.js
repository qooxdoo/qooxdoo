qx.Mixin.define("qx.test.MMoody",
{
  construct : function() {
    this.debug("Constructing mixin: qx.test.MMoody");
  },

  include : qx.test.MEmpty,

  properties :
  {
    age: {_legacy: true, type: "string"}
  },

  members :
  {
    /**
     * Hiss me
     *
     * @type member
     * @return {void}
     */
    hiss : function() {
      this.debug("CCCCCCCCCHHHHHH!!");
    }
  },

  statics :
  {
    amIFat: function() { return true; }
  },

  destruct : function() {
    this.debug("Destructing mixin: qx.test.MMoody");
  }
});
