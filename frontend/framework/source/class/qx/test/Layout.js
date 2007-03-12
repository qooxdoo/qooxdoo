qx.Class.define("qx.test.Layout",
{
  extend : qx.ui.layout.CanvasLayout,

  properties :
  {
    _enabled : { inheritable : true },
    _width : { inheritable : true, appearance : true },
    _height : { inheritable : true, appearance : true },
    _left : { inheritable : true, appearance : true },
    _top : { inheritable : true, appearance : true }
  },


  members : {

  },


  statics :
  {
    test1 : function()
    {
      try
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

      }
      catch(ex)
      {
        this.error("Error :)", ex);

      }



    }


  }


});
