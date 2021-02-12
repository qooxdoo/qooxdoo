qx.Class.define("classIssue524",
{
  extend : qx.application.Standalone,
  members :
  {
  /**
   * @ignore(init1)
   */
  main : function() {
    init1();
  }
  }
});

qx.Class.define("some.Class",
{
  extend : qx.ui.container.Composite,
  /**
   * @ignore(init)
   */
  construct : function()
  {
    init();
  }
});