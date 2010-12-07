/* ************************************************************************

   Copyright:

   License:

   Authors:

************************************************************************ */

/**
 * This class demonstrates how to define simulated interaction tests for your 
 * application. See the manual for details:
 * {@link http://manual.qooxdoo.org/1.3/pages/development/simulator.html}
 * 
 * @lint ignoreUndefined(simulator)
 */
qx.Class.define("${Namespace}.demo.simulation.DemoSimulation", {

  extend : simulator.unit.TestCase,
  
  members :
  {
    /*
    ---------------------------------------------------------------------------
      TESTS
    ---------------------------------------------------------------------------
    */
    
    /** Check if a widget is present (part of the DOM) */
    testButtonPresent : function()
    {
      this.assertNotNull(this.getWidgetOrNull("qxh=qx.ui.form.Button"), "Button widget not present!");
    },
    
    /** Click a button and check if an alert box pops up */
    testButtonClick : function()
    {
      this.getSimulation().qxSelenium.qxClick("qxh=qx.ui.form.Button");
      this.assertEquals("true", String(this.getSimulation().qxSelenium.isAlertPresent()));
    }
  }
  
});
