qx.Class.define("demobrowser.demo.layout.MenuEmu_1_Menu",
{
  extend : qx.ui.core.Widget,

  construct : function()
  {
    this.base(arguments);

    var layout = new qx.ui.layout.Grid();
    layout.setColumnFlex(0, 1);
    layout.setVerticalSpacing(2);
    layout.setHorizontalSpacing(0);
    this._setLayout(layout);

    this.setDecorator("black");

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
        this._add(text, {row: row, column: 0});
        this._add(shortcut, {row: row, column: 1});
      }
      else
      {
        this._add(text, {row: row, column: 0, colSpan: 2});
      }
    }
  }

});