/* ************************************************************************

   qooxdoo - the new era of web development

   http://qooxdoo.org

   Copyright:
     2007-2008 1&1 Internet AG, Germany, http://www.1und1.de

   License:
     LGPL: http://www.gnu.org/licenses/lgpl.html
     EPL: http://www.eclipse.org/org/documents/epl-v10.php
     See the LICENSE file in the project's top-level directory for details.

   Authors:
     * Fabian Jakobs (fjakobs)

************************************************************************ */

/*
#optional(testrunner.TestLoader)
#optional(qx.dev.unit.TestResult)
*/

qx.Class.define("testrunner.runner.BasicRunner",
{
  extend : qx.legacy.ui.layout.VerticalBoxLayout,



  /*
  *****************************************************************************
     CONSTRUCTOR
  *****************************************************************************
  */

  construct : function()
  {
    this.base(arguments);

    this.set(
    {
      height : "100%",
      width  : "100%"
    });

    var iframe = new qx.legacy.ui.embed.Iframe("html/tests.html?testclass=testrunner.test");

    iframe.set(
    {
      height : 100,
      width  : 300
    });

    iframe.addListener("load", function()
    {
      var testLoader = iframe.getContentWindow().testrunner.TestLoader.getInstance();

      // wait for the iframe to load
      if (!testLoader)
      {
        qx.event.Timer.once(arguments.callee, this, 50);
        return;
      }

      var testResult = new (iframe.getContentWindow().qx.dev.unit.TestResult)();

      testResult.addListener("startTest", function(e)
      {
        var test = e.getData();
        this.debug("Test '" + test.getFullName() + "' started.");
      }, this);

      testResult.addListener("failure", function(e)
      {
        var ex = e.getData().exception;
        var test = e.getData().test;
        this.error("Test '" + test.getFullName() + "' failed: " + ex.getMessage() + " - " + ex.getComment());
      }, this);

      // this.error(ex.getStackTrace());
      testResult.addListener("error", function(e)
      {
        var ex = e.getData().exception;
        this.error("The test '" + e.getData().test.getFullName() + "' had an error: " + ex, ex);
      }, this);

      this.debug(testLoader.getTestDescriptions());
      gb.setEnabled(true);

      this.run.addListener("execute", function() {
        testLoader.runTestsFromNamespace(testResult, this.input.getValue());
      }, this);
    },
    this);

    this.add(iframe);

    var gb = new qx.legacy.ui.groupbox.GroupBox();

    gb.set(
    {
      height  : "auto",
      width   : "auto",
      enabled : false
    });

    var hb = new qx.legacy.ui.layout.HorizontalBoxLayout();

    hb.set(
    {
      height                : "auto",
      width                 : "auto",
      verticalChildrenAlign : "middle"
    });

    hb.add(new qx.legacy.ui.basic.Label("Test class: "));
    this.input = new qx.legacy.ui.form.TextField();
    this.run = new qx.legacy.ui.form.Button("run");
    hb.add(this.input, this.run);
    gb.add(hb);
    this.add(gb);
  },


  members :
  {
    load : function() {}
  }
});
