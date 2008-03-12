qx.Class.define("demobrowser.demo.layout.MenuEmu_1_MenuItem",
{
  extend : qx.core.Object,

  construct : function(text, shortcut)
  {
    this.base(arguments);
    var MenuItem = demobrowser.demo.layout.MenuEmu_1_MenuItem;

    this._text = new qx.ui.basic.Label(text);
    this._text.setPadding(4);

    if (!MenuItem.menuDecoration) {
      MenuItem.menuDecoration = new qx.ui.decoration.Single();
    }

    this._text.setDecorator(MenuItem.menuDecoration);

    this._text.addListener("mouseover", this._onMouseOver, this);
    this._text.addListener("mouseout", this._onMouseOut, this);

    if (shortcut) {
      this._shortcut = new qx.ui.basic.Label(shortcut);
      this._shortcut.setPadding(4, 4, 4, 20);

      this._shortcut.setDecorator(MenuItem.menuDecoration);

      this._shortcut.addListener("mouseover", this._onMouseOver, this);
      this._shortcut.addListener("mouseout", this._onMouseOut, this);
    }

  },

  statics :
  {
    menudecorator : null
  },

  members :
  {
    getTextWidget : function() {
      return this._text;
    },

    getShortCutWidget : function() {
      return this._shortcut || null;
    },

    _onMouseOver : function(e)
    {
      this._text.setBackgroundColor("blue");
      if (this._shortcut) {
        this._shortcut.setBackgroundColor("blue");
      }
    },

    _onMouseOut : function(e)
    {
      this._text.setBackgroundColor(null);
      if (this._shortcut) {
        this._shortcut.setBackgroundColor(null);
      }
    }
  }

});