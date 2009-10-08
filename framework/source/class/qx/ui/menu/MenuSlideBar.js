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
  }
});