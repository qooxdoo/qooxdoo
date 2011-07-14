/* ************************************************************************

   Copyright:

   License:

   Authors:

************************************************************************ */

/**
 * This class demonstrates how to define simulated interaction tests for your 
 * application. See the manual for details:
 * {@link http://manual.qooxdoo.org/${QOOXDOO_VERSION}/pages/development/simulator.html}
 * 
 * @lint ignoreUndefined(simulator)
 */
qx.Class.define("${Namespace}.simulation.DemoSimulation", {

  extend : simulator.unit.TestCase,
  
  members :
  {
    /*
    ---------------------------------------------------------------------------
      TESTS
    ---------------------------------------------------------------------------
    */
    
    testNextAndBack : function()
    {
      this.getQxSelenium().qxClick('//div[text()="Next Page"]');
      this.getSimulation().wait("1000");
      var p2 = this.getQxSelenium().isElementPresent('//div[text()="Content of Page 2"]')
      this.assert(p2, "Page not changed after clicking Next Page!");
      
      this.getQxSelenium().qxClick('//div[text()="Back"]');
      this.getSimulation().wait("1000");
      var p1 = this.getQxSelenium().isElementPresent('//div[text()="Next Page"]');
      this.assert(p1, "Page not changed after clicking Back!");
    }
  }
  
});