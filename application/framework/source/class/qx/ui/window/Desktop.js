qx.Class.define("qx.ui.window.Desktop",
{
  extend : qx.ui.core.Widget,

  include : [
    qx.ui.core.MChildrenHandling,
    qx.ui.window.MDesktop,
    qx.ui.core.MBlocker
  ],

  implement : qx.ui.window.IDesktop,


  construct : function(windowManager)
  {
    this.base(arguments);

    this._setLayout(new qx.ui.layout.Canvas());
    this.setWindowManager(windowManager);
  }
});