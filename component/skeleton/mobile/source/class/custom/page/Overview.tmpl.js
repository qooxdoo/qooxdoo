/* ************************************************************************

   Copyright:

   License:

   Authors:

************************************************************************ */

/**
 */
qx.Class.define("${Namespace}.page.Overview",
{
  extend : qx.ui.mobile.page.NavigationPage,

  construct : function()
  {
    this.base(arguments);
    this.setTitle("Overview");
    this.setShowBackButton(true);
    this.setBackButtonText("Back");
  },


  members :
  {
    // overridden
    _initialize : function()
    {
      this.base(arguments);

      this.getContent().add(new qx.ui.mobile.basic.Label("Your first app."));
    },


    // overridden
    _back : function()
    {
      qx.core.Init.getApplication().getRouting().back();
    }
  }
});