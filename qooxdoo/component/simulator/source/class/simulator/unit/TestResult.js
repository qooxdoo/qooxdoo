/* ************************************************************************

   qooxdoo - the new era of web development

   http://qooxdoo.org

   Copyright:
     2010 1&1 Internet AG, Germany, http://www.1and1.org

   License:
     LGPL: http://www.gnu.org/licenses/lgpl.html
     EPL: http://www.eclipse.org/org/documents/epl-v10.php
     See the LICENSE file in the project's top-level directory for details.

   Authors:
     * Daniel Wagner (d_wagner)

************************************************************************ */

/**
 * The test result class runs the test functions and logs the results.
 */
 
qx.Class.define("simulator.unit.TestResult", {

  extend : qx.core.Object,
  
  members :
  {
    
    /**
     * Run the test
     *
     * @param test {TestSuite|TestFunction} The test
     * @param testFunction {Function} The test function
     * @param self {Object} The context in which to run the test function
     */
    run : function(test, testFunction, self)
    {
      try {
        test.setUp();
      } catch(ex) {
        try {
          test.tearDown();
        } catch(ex) {}
        this.error("Error setting up " + test.getFullName() + ": " + ex);
        return;
      }
      
      try {
        testFunction.call(self);
        this.info("PASS  " + test.getFullName());
      }
      catch(ex)
      {
        if (ex.classname == "qx.core.AssertionError") {
          try {
            test.tearDown();
          } catch(ex) {}
          this.error("FAIL  " + test.getFullName() + "\n" + ex);
        } else {
          try {
            test.tearDown();
          } catch(ex) {}
          this.error("ERROR " + test.getFullName() + "\n" + ex);
        }
      }
    }
  }
  
});