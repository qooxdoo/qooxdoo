qx.Class.define("tweets.MainWindow",
{
  extend : qx.ui.window.Window,

  construct : function()
  {
    this.base(arguments, "identi.ca");

    // hide the window buttons
    this.setShowClose(false);
    this.setShowMaximize(false);
    this.setShowMinimize(false);

    // adjust size
    this.setWidth(250);
    this.setHeight(300);
  }
});
