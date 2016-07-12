/* ************************************************************************

   qooxdoo - the new era of web development

   http://qooxdoo.org

   Copyright:
     2004-2012 1&1 Internet AG, Germany, http://www.1und1.de

   License:
     MIT: https://opensource.org/licenses/MIT
     See the LICENSE file in the project's top-level directory for details.

   Authors:
     * Daniel Wagner (danielwagner)

************************************************************************ */

/**
 * Performance test result object. Used to communicate measurements to the unit
 * testing framework.
 */
qx.Class.define("qx.dev.unit.MeasurementResult", {

  extend : Object,

  /**
   *
   * @param message {String} Description
   * @param iterations {Number} Amount of times the tested code was executed
   * @param ownTime {Number} Elapsed JavaScript execution time
   * @param renderTime {Number} Elapsed DOM rendering time
   */
  construct : function(message, iterations, ownTime, renderTime)
  {
    this.__message = message;
    this.__iterations = iterations;
    this.__ownTime = ownTime;
    this.__renderTime = renderTime;
  },

  members :
  {
    __message : null,
    __iterations : null,
    __ownTime : null,
    __renderTime : null,


    /**
     * Returns the stored data as a map.
     * @return {Map} The stored data.
     */
    getData : function() {
      return {
        message : this.__message,
        iterations : this.__iterations,
        ownTime : this.__ownTime,
        renderTime : this.__renderTime
      };
    },


    /**
     * Returns a readable summary of this result
     *
     * @return {String} Result summary
     */
    toString : function()
    {
      return ["Measured: " + this.__message,
        "Iterations: " + this.__iterations,
        "Time: " + this.__ownTime + "ms",
        "Render time: " + this.__renderTime + "ms"].join("\n");
    }
  }
});