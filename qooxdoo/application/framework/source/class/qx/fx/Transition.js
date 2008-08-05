/* ************************************************************************

   qooxdoo - the new era of web development

   http://qooxdoo.org

   Copyright:
     2008 1&1 Internet AG, Germany, http://www.1und1.de

   License:
     LGPL: http://www.gnu.org/licenses/lgpl.html
     EPL: http://www.eclipse.org/org/documents/epl-v10.php
     See the LICENSE file in the project's top-level directory for details.

   Authors:
     * Jonathan Rass (jonathan_rass)

   ======================================================================

   This class contains code based on the following work:

   * script.aculo.us
       http://script.aculo.us/
       Version 1.8.1

     Copyright:
       2008 Thomas Fuchs

     License:
       MIT: http://www.opensource.org/licenses/mit-license.php

     Author:
       Thomas Fuchs


   * Easing equations
       http://www.robertpenner.com/easing/

     Copyright:
       2001 Robert Penner

     License:
       BSD: http://www.opensource.org/licenses/bsd-license.php

     Author:
       Robert Penner

************************************************************************ */

/**
 * Static class containing all transition functions.
 */
qx.Class.define("qx.fx.Transition",
{
  type : "static",

  statics :
  {
    /**
     * Maps function name to function.
     *
     * @param functionName {String} Name off the function.
     * @return {Function|Boolean} Function belonging to the name or false,
     * function does not exist
     */
    get : function(functionName)
    {
      return qx.fx.Transition[functionName] || false;
    },

    /**
     * Returns the given effect position without
     * changing it. This is the default transition
     * function for most effects.
     *
     * @param pos {Number} Effect position in duration
     * @return {Number} Modified effect position
     */
    linear : function(pos)
    {
      return pos;
    },

    /**
     * Using this function will accelerate the effect's
     * impact exponentially.
     *
     * @param pos {Number} Effect position in duration
     * @return {Number} Modified effect position
     */
    easeInQuad : function (pos)
    {
      return Math.pow(2, 10 * (pos - 1));
    },

    /**
     * Using this function will slow down the
     * effect's impact exponentially.
     *
     * @param pos {Number} Effect position in duration
     * @return {Number} Modified effect position
     */
    easeOutQuad : function (pos)
    {
      return (-Math.pow(2, -10 * pos) + 1);
    },

    /**
     * Using this function will accelerate the
     * effect's impact sinusoidal.
     *
     * @param pos {Number} Effect position in duration
     * @return {Number} Modified effect position
     */
    sinodial : function(pos)
    {
      return ( -Math.cos(pos * Math.PI) / 2 ) + 0.5;
    },

    /**
     * Using this function will reverse the
     * effect's impact.
     *
     * @param pos {Number} Effect position in duration
     * @return {Number} Modified effect position
     */
    reverse: function(pos)
    {
      return 1 - pos;
    },

    /**
     * Using this function will alternate the
     * effect's impact between start end value.
     *
     * Looks only nice on color effects.
     *
     * @param pos {Number} Effect position in duration
     * @return {Number} Modified effect position
     */
    flicker : function(pos)
    {
      var pos = ( (-Math.cos(pos * Math.PI) / 4) + 0.75) + Math.random() / 4;
      return pos > 1 ? 1 : pos;
    },

    /**
     * Using this function will bounce the
     * effect's impact forwards and backwards
     *
     * @param pos {Number} Effect position in duration
     * @return {Number} Modified effect position
     */
    wobble : function(pos)
    {
      return ( -Math.cos(pos * Math.PI * (9 * pos)) / 2) + 0.5;
    },

    /**
     * Using this function will alternate rapidly the
     * effect's impact between start end value.
     *
     * Looks only nice on color effects.
     *
     * @param pos {Number} Effect position in duration
     * @param pulses {Number} Amount of pulses
     * @return {Number} Modified effect position
     */
    pulse : function(pos, pulses)
    {

      pulses = (typeof(pulses) == "Number") ? pulses : 5;

      return (
        Math.round((pos % (1/pulses)) * pulses) == 0 ?
              Math.floor((pos * pulses * 2) - (pos * pulses * 2)) :
          1 - Math.floor((pos * pulses * 2) - (pos * pulses * 2))
        );
    },

    /**
     * Using this function will overshoot the
     * target value and then move back the impact's
     * impact.
     *
     * @param pos {Number} Effect position in duration
     * @return {Number} Modified effect position
     */
    spring : function(pos)
    {
      return 1 - (Math.cos(pos * 4.5 * Math.PI) * Math.exp(-pos * 6));
    },

    /**
     * Using this function the effect's impact will be zero.
     *
     * @param pos {Number} Effect position in duration
     * @return {Number} Modified effect position
     */
    none : function(pos)
    {
      return 0;
    },

    /**
     * Using this function the effect's impact will be
     * as if it has reached the end position.
     *
     * @param pos {Number} Effect position in duration
     * @return {Number} Modified effect position
     */
    full : function(pos)
    {
      return 1;
    }
  }
});
