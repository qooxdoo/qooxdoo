qx.Class.define("demobrowser.demo.ui.MenuEmu_1_Menu",
{
  extend : qx.ui.core.Widget,

  construct : function()
  {
    this.base(arguments);

    this._layout = new qx.ui.layout.Grid();
    this._layout.setColumnFlex(0, 1);
    this._layout.setVerticalSpacing(2);
    this._layout.setHorizontalSpacing(0);
    this.setLayout(this._layout);

    var border = new qx.ui.decoration.Basic(1, "solid", "black");
    this.setDecorator(border);

    this._menuItems = [];
  },

  members :
  {
    canStretchX : function()
    {
      return false;
    },

    canStretchY : function()
    {
      return false;
    },

    add : function(menuItem)
    {
      this._menuItems.push(menuItem);
      var row = this._menuItems.length - 1;

      var shortcut = menuItem.getShortCutWidget();
      var text = menuItem.getTextWidget();

      if (shortcut)
      {
        this._layout.add(text, row, 0);
        this._layout.add(shortcut, row, 1);
      }
      else
      {
        this._layout.add(text, row, 0, {colSpan: 2});
      }
    }
  }

});