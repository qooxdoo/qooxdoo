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
  
  construct : function()
  {
    this.base(arguments);
    this.qxSelenium = simulator.QxSelenium.getInstance();
    this.simulation = simulator.Simulation.getInstance();
  },
  
  members :
  {
    /** {@link simulator.QxSelenium} instance */
    qxSelenium : null,
    /** {@link simulator.Simulation} instance */
    simulation : null,
    
    /**
     * Returns the Simulation instance configured by the TestLoader.
     * 
     * @return {simulator.Simulation} Simulation object
     * @deprecated since 1.4
     */
    getSimulation : function()
    {
      qx.log.Logger.deprecateMethodOverriding(arguments.callee, "Use this.simulation instead");
      return this.simulation;
    }
  }
  
});