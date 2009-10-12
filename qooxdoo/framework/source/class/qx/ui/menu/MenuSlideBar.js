qx.Class.define("qx.ui.menu.MenuSlideBar",
{
  extend : qx.ui.container.SlideBar,
  
  construct : function()
  {
    this.base(arguments, "vertical");
  },
  
  properties :
  {
    appearance :
    {
      refine : true,
      init : "menu-slidebar"
    }
  },
  
  members :
  {
    // overridden
    _createChildControlImpl : function(id)
    {
      var control;

      switch(id)
      {
        case "button-forward":
          control = new qx.ui.menu.SliderButton();
          control.addListener("execute", this._onExecuteForward, this);
          this._addAt(control, 2);
          break;

        case "button-backward":
          control = new qx.ui.menu.SliderButton();
          control.addListener("execute", this._onExecuteBackward, this);
          this._addAt(control, 0);
          break;
      }

      return control || this.base(arguments, id);
    }
  }
});