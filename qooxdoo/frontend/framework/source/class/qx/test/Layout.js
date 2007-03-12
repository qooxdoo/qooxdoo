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
  }
});
