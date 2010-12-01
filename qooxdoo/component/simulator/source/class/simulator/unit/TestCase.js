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
 * Base class for integration tests.
 */

qx.Class.define("simulator.unit.TestCase", {

  extend : qx.dev.unit.TestCase,
  
  include : [simulator.MSeleniumUtil, qx.core.MAssert],
  
  members :
  {
    __simulation : null,
    
    
    /**
     * Returns the QxSimulation instance configured by the TestLoader.
     * 
     * @return {simulator.QxSimulation} QxSimulation object 
     */
    getSimulation : function()
    {
      if (this.__simulation) {
        return this.__simulation;
      }
      
      this.__simulation = simulator.Init.getApplication().simulation;
      return this.__simulation;
    }
  }
  
});