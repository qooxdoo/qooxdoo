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

  include : [qx.core.MAssert],

  members :
  {
    /** {@link simulator.QxSelenium} instance */
    __qxSelenium : null,

    /** {@link simulator.Simulation} instance */
    __simulation : null,

    /**
     * Returns a Simulation instance.
     *
     * @return {simulator.Simulation} Simulation object
     */
    getSimulation : function()
    {
      if (!this.__simulation) {
        this.__simulation = simulator.Simulation.getInstance();
      }
      return this.__simulation;
    },

    /**
     * Returns a QxSelenium instance.
     *
     * @return {simulator.selenium.QxSelenium} QxSelenium object
     */
    getQxSelenium : function()
    {
      if (!this.__qxSelenium) {
        this.__qxSelenium = simulator.QxSelenium.getInstance();
      }
      return this.__qxSelenium;
    }
  }

});