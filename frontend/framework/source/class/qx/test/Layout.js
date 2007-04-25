/**
 * @deprecated
 */
qx.Class.define("qx.test.Layout",
{
  extend : qx.ui.layout.CanvasLayout,

  events :
  {
    /**
     * @deprecated don't use me.
     **/
    "click" : "Event"
  },

  properties :
  {
    _enabled : { inheritable : true },

    /**
     * @deprecated
     */
    width12: { inheritable : true, themeable : true },
    _height : { inheritable : true, themeable : true },
    _left : { inheritable : true, themeable : true },
    _top : { inheritable : true, themeable : true }
  },


  members : {

    /**
     * @deprecated
     * @return {Integer} Juhu
     */
    foo : function() {

    },

    __bar : function() {}
  },


  statics :
  {

    /**
     * @deprecated please use bar!
     */
    FOO : 12,

    /**
     * @deprecated use test2 instead.
     */
    test1 : function()
    {
      var pa = new qx.test.Layout;
      var ch1 = new qx.test.Layout;
      var ch2 = new qx.test.Layout;
      var ch3 = new qx.test.Layout;

      ch1.setParent(pa);
      ch2.setParent(pa);
      ch3.setParent(pa);

      ch2._setEnabled(false);
      pa._setEnabled(true);

      pa.debug("Parent Enabled?: " + pa._computeEnabled() + " :: should be true");
      ch1.debug("Child-1 Enabled?: " + ch1._computeEnabled() + " :: should be true");
      ch2.debug("Child-2 Enabled?: " + ch2._computeEnabled() + " :: should be false");
      ch3.debug("Child-3 Enabled?: " + ch3._computeEnabled() + " :: should be true");

      ch2._resetEnabled();
      ch2.debug("Child-2 Enabled?: " + ch2._computeEnabled() + " :: should be true");

      ch3._setEnabled(true);
      ch3.debug("Child-3 Enabled?: " + ch3._computeEnabled() + " :: should be true");

      ch3._setEnabled(false);
      ch3.debug("Child-3 Enabled?: " + ch3._computeEnabled() + " :: should be false");
    },

    test2 : function()
    {
      var pa = new qx.test.Layout;
      var ch1 = new qx.test.Layout;
      var ch2 = new qx.test.Layout;
      var ch3 = new qx.test.Layout;

      ch1.setParent(pa);

      pa._setEnabled(true); // ch1 gets enabled, too
      ch3._setEnabled(false);

      pa.debug("Parent Enabled?: " + pa._computeEnabled() + " :: should be true");
      ch1.debug("Child-1 Enabled?: " + ch1._computeEnabled() + " :: should be true");
      ch2.debug("Child-2 Enabled?: " + ch2._computeEnabled() + " :: should be undefined");
      ch3.debug("Child-3 Enabled?: " + ch3._computeEnabled() + " :: should be false");

      ch2.setParent(pa); // make ch2 enabled through inheritance
      ch3.setParent(pa); // keep ch2 disabled, user value has higher priority

      pa.debug("Parent Enabled?: " + pa._computeEnabled() + " :: should be true");
      ch1.debug("Child-1 Enabled?: " + ch1._computeEnabled() + " :: should be true");
      ch2.debug("Child-2 Enabled?: " + ch2._computeEnabled() + " :: should be true");
      ch3.debug("Child-3 Enabled?: " + ch3._computeEnabled() + " :: should be false");
    }
  }
});
