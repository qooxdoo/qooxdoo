qx.Class.define("twitter.MainWindow",
{
  extend : qx.ui.window.Window,

  construct : function()
  {
    this.base(arguments, "twitter");

    // hide the window buttons
    this.setShowClose(false);
    this.setShowMaximize(false);
    this.setShowMinimize(false);

    // adjust size
    this.setWidth(250);
    this.setHeight(300);
  }
});
