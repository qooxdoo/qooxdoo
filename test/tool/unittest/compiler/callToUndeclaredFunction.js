// Regression fixture for GitHub issue #524 - loaded by qx.test.tool.compiler.ClassFile

qx.Class.define("callToUndeclaredFunction",
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