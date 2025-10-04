/* ************************************************************************

   Copyright:

   License:

   Authors:

************************************************************************ */

/**
 * TODO: needs documentation
 */
qx.Class.define("${namespace}.page.Overview",
{
  extend : qx.ui.mobile.page.NavigationPage,

  construct()
  {
    super();
    this.setTitle("Overview");
    this.setShowBackButton(true);
    this.setBackButtonText("Back");
  },


  members :
  {
    // overridden
    _initialize()
    {
      super._initialize(arguments);

      this.getContent().add(new qx.ui.mobile.basic.Label("Your first app."));
    },


    // overridden
    _back(triggeredByKeyEvent)
    {
      qx.core.Init.getApplication().getRouting().back();
    }
  }
});
