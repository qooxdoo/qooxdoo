/* ************************************************************************

   qooxdoo - the new era of web development

   http://qooxdoo.org

   Copyright:
     2004-2012 1&1 Internet AG, Germany, http://www.1und1.de

   License:
     LGPL: http://www.gnu.org/licenses/lgpl.html
     EPL: http://www.eclipse.org/org/documents/epl-v10.php
     See the LICENSE file in the project's top-level directory for details.

   Authors:
     * Daniel Wagner (d_wagner)

************************************************************************ */

/**
 * Provides support for performance tests
 */
qx.Mixin.define("testrunner.view.MPerformance", {

  construct : function()
  {
    this.__measurements = [];
  },

  properties :
  {
    /**
     * Whether the browser's built-in profiling capabilities
     * (<code>console.profile</code>) should additionally be used for
     * performance tests
     */
    nativeProfiling :
    {
      check : "Boolean",
      init : false
    }
  },

  members :
  {
    __measurements : null,

    /**
     * Adds an entry to the stored results
     *
     * @param clazz {String} Name of the test class
     * @param msg {String} Test description
     * @param iterations {Integer} Number of iterations
     * @param ownTime {Integer} JavaScript execution time
     * @param renderTime {Integer} browser rendering time
     */
    logMeasurement : function(clazz, msg, iterations, ownTime, renderTime) {
      this.__measurements.push([clazz, msg, iterations, ownTime, renderTime].join("; "));
    },


    /**
     * Whether the browser's built-in profiling capabilities (console.profile)
     * should (additionally) be used for performance tests
     *
     * @deprecated since 2.0
     * @return {Boolean} <code>true</code> if native profiling should be used
     */
    getProfile : function()
    {
      qx.log.Logger.deprecatedMethodWarning(arguments.callee, "Please use getNativeProfiling instead");
      return this.getNativeProfiling();
    }
  }
});