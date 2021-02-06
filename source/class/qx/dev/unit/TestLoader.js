/* ************************************************************************

   qooxdoo - the new era of web development

   http://qooxdoo.org

   Copyright:
     2007-2008 1&1 Internet AG, Germany, http://www.1und1.de

   License:
     MIT: https://opensource.org/licenses/MIT
     See the LICENSE file in the project's top-level directory for details.

   Authors:
     * Fabian Jakobs (fjakobs)

************************************************************************ */

/**
 * The test loader is the base class of a native application, which can be used
 * to run tests from a non-GUI application or from within JSUnit.
 */
qx.Class.define("qx.dev.unit.TestLoader",
{
  extend : qx.application.Standalone,

  include : [qx.dev.unit.MTestLoader],


  /*
  *****************************************************************************
     MEMBERS
  *****************************************************************************
  */

  members :
  {
    // overridden
    main : function()
    {
      this.base(arguments);

      // Dependencies to loggers
      qx.log.appender.Console;

      var url = this._getClassNameFromUrl();
      if (url !== "__unknown_class__") {
        this.setTestNamespace(this._getClassNameFromUrl());
      } else {
        var namespace = qx.core.Environment.get("qx.testNameSpace");
        if (namespace) {
          this.setTestNamespace(namespace);
        }
      }

      if (window.top.jsUnitTestSuite)
      {
        this.runJsUnit();
        return;
      }

      if (window == window.top && qx.core.Environment.get("qx.standaloneAutorun"))
      {
        this.runStandAlone();
      }
    }
  }
});
