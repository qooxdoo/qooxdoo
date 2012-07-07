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
     * Jonathan Weiß (jonathan_rass)

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

   ----------------------------------------------------------------------

     Copyright (c) 2005-2007 Thomas Fuchs
       (http://script.aculo.us, http://mir.aculo.us)

     Permission is hereby granted, free of charge, to any person
     obtaining a copy of this software and associated documentation
     files (the "Software"), to deal in the Software without restriction,
     including without limitation the rights to use, copy, modify, merge,
     publish, distribute, sublicense, and/or sell copies of the Software,
     and to permit persons to whom the Software is furnished to do so,
     subject to the following conditions:

     The above copyright notice and this permission notice shall be
     included in all copies or substantial portions of the Software.

     THE SOFTWARE IS PROVIDED "AS IS", WITHOUT WARRANTY OF ANY KIND,
     EXPRESS OR IMPLIED, INCLUDING BUT NOT LIMITED TO THE WARRANTIES OF
     MERCHANTABILITY, FITNESS FOR A PARTICULAR PURPOSE AND
     NONINFRINGEMENT. IN NO EVENT SHALL THE AUTHORS OR COPYRIGHT
     HOLDERS BE LIABLE FOR ANY CLAIM, DAMAGES OR OTHER LIABILITY,
     WHETHER IN AN ACTION OF CONTRACT, TORT OR OTHERWISE, ARISING FROM,
     OUT OF OR IN CONNECTION WITH THE SOFTWARE OR THE USE OR OTHER
     DEALINGS IN THE SOFTWARE.

   ======================================================================

   This class contains code based on the following work:

   * Easing equations
       http://www.robertpenner.com/easing/

     Copyright:
       2001 Robert Penner

     License:
       BSD: http://www.opensource.org/licenses/bsd-license.php

     Author:
       Robert Penner

   ----------------------------------------------------------------------

     http://www.robertpenner.com/easing_terms_of_use.html

     Copyright © 2001 Robert Penner

     All rights reserved.

     Redistribution and use in source and binary forms, with or without
     modification, are permitted provided that the following conditions
     are met:

     * Redistributions of source code must retain the above copyright
       notice, this list of conditions and the following disclaimer.
     * Redistributions in binary form must reproduce the above copyright
       notice, this list of conditions and the following disclaimer in
       the documentation and/or other materials provided with the
       distribution.
     * Neither the name of the author nor the names of contributors may
       be used to endorse or promote products derived from this software
       without specific prior written permission.

     THIS SOFTWARE IS PROVIDED BY THE COPYRIGHT HOLDERS AND CONTRIBUTORS
     "AS IS" AND ANY EXPRESS OR IMPLIED WARRANTIES, INCLUDING, BUT NOT
     LIMITED TO, THE IMPLIED WARRANTIES OF MERCHANTABILITY AND FITNESS
     FOR A PARTICULAR PURPOSE ARE DISCLAIMED. IN NO EVENT SHALL THE
     COPYRIGHT OWNER OR CONTRIBUTORS BE LIABLE FOR ANY DIRECT, INDIRECT,
     INCIDENTAL, SPECIAL, EXEMPLARY, OR CONSEQUENTIAL DAMAGES
     (INCLUDING, BUT NOT LIMITED TO, PROCUREMENT OF SUBSTITUTE GOODS OR
     SERVICES; LOSS OF USE, DATA, OR PROFITS; OR BUSINESS INTERRUPTION)
     HOWEVER CAUSED AND ON ANY THEORY OF LIABILITY, WHETHER IN CONTRACT,
     STRICT LIABILITY, OR TORT (INCLUDING NEGLIGENCE OR OTHERWISE)
     ARISING IN ANY WAY OUT OF THE USE OF THIS SOFTWARE, EVEN IF ADVISED
     OF THE POSSIBILITY OF SUCH DAMAGE.

************************************************************************ */

/**
 * Static class containing all transition functions.
 * @deprecated since 2.0: Please use qx.bom.element.Animation instead.
 */
qx.Class.define("qx.fx.Transition",
{
  type : "static",

  statics :
  {
    __warned : false,

    /**
     * Maps function name to function.
     *
     * @param functionName {String} Name off the function.
     * @return {Function|Boolean} Function belonging to the name or false,
     * function does not exist
     * @deprecated since 2.0: Please use qx.bom.element.Animation instead.
     */
    get : function(functionName)
    {
      if (!this.__warned) {
        this.__warned = true;
        qx.log.Logger.deprecatedMethodWarning(arguments.callee,
          "qx.fx.* is deprecated. Please use qx.bom.element.Animation instead."
        );
      }

      return qx.fx.Transition[functionName] || false;
    },

    /**
     * Returns the given effect position without
     * changing it. This is the default transition
     * function for most effects.
     *
     * @param pos {Number} Effect position in duration
     * @return {Number} Modified effect position
     * @deprecated since 2.0: Please use qx.bom.element.Animation instead.
     */
    linear : function(pos)
    {
      if (!this.__warned) {
        this.__warned = true;
        qx.log.Logger.deprecatedMethodWarning(arguments.callee,
          "qx.fx.* is deprecated. Please use qx.bom.element.Animation instead."
        );
      }

      return pos;
    },

    /**
     * Using this function will accelerate the effect's
     * impact exponentially.
     *
     * @param pos {Number} Effect position in duration
     * @return {Number} Modified effect position
     * @deprecated since 2.0: Please use qx.bom.element.Animation instead.
     */
    easeInQuad : function (pos)
    {
      if (!this.__warned) {
        this.__warned = true;
        qx.log.Logger.deprecatedMethodWarning(arguments.callee,
          "qx.fx.* is deprecated. Please use qx.bom.element.Animation instead."
        );
      }

      return Math.pow(2, 10 * (pos - 1));
    },

    /**
     * Using this function will slow down the
     * effect's impact exponentially.
     *
     * @param pos {Number} Effect position in duration
     * @return {Number} Modified effect position
     * @deprecated since 2.0: Please use qx.bom.element.Animation instead.
     */
    easeOutQuad : function (pos)
    {
      if (!this.__warned) {
        this.__warned = true;
        qx.log.Logger.deprecatedMethodWarning(arguments.callee,
          "qx.fx.* is deprecated. Please use qx.bom.element.Animation instead."
        );
      }

      return (-Math.pow(2, -10 * pos) + 1);
    },

    /**
     * Using this function will accelerate the
     * effect's impact sinusoidal.
     *
     * @param pos {Number} Effect position in duration
     * @return {Number} Modified effect position
     * @deprecated since 2.0: Please use qx.bom.element.Animation instead.
     */
    sinodial : function(pos)
    {
      if (!this.__warned) {
        this.__warned = true;
        qx.log.Logger.deprecatedMethodWarning(arguments.callee,
          "qx.fx.* is deprecated. Please use qx.bom.element.Animation instead."
        );
      }

      return ( -Math.cos(pos * Math.PI) / 2 ) + 0.5;
    },

    /**
     * Using this function will reverse the
     * effect's impact.
     *
     * @param pos {Number} Effect position in duration
     * @return {Number} Modified effect position
     * @deprecated since 2.0: Please use qx.bom.element.Animation instead.
     */
    reverse: function(pos)
    {
      if (!this.__warned) {
        this.__warned = true;
        qx.log.Logger.deprecatedMethodWarning(arguments.callee,
          "qx.fx.* is deprecated. Please use qx.bom.element.Animation instead."
        );
      }

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
     * @deprecated since 2.0: Please use qx.bom.element.Animation instead.
     */
    flicker : function(pos)
    {
      if (!this.__warned) {
        this.__warned = true;
        qx.log.Logger.deprecatedMethodWarning(arguments.callee,
          "qx.fx.* is deprecated. Please use qx.bom.element.Animation instead."
        );
      }

      var pos = ( (-Math.cos(pos * Math.PI) / 4) + 0.75) + Math.random() / 4;
      return pos > 1 ? 1 : pos;
    },

    /**
     * Using this function will bounce the
     * effect's impact forwards and backwards
     *
     * @param pos {Number} Effect position in duration
     * @return {Number} Modified effect position
     * @deprecated since 2.0: Please use qx.bom.element.Animation instead.
     */
    wobble : function(pos)
    {
      if (!this.__warned) {
        this.__warned = true;
        qx.log.Logger.deprecatedMethodWarning(arguments.callee,
          "qx.fx.* is deprecated. Please use qx.bom.element.Animation instead."
        );
      }

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
     * @deprecated since 2.0: Please use qx.bom.element.Animation instead.
     */
    pulse : function(pos, pulses)
    {
      if (!this.__warned) {
        this.__warned = true;
        qx.log.Logger.deprecatedMethodWarning(arguments.callee,
          "qx.fx.* is deprecated. Please use qx.bom.element.Animation instead."
        );
      }

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
     * @deprecated since 2.0: Please use qx.bom.element.Animation instead.
     */
    spring : function(pos)
    {
      if (!this.__warned) {
        this.__warned = true;
        qx.log.Logger.deprecatedMethodWarning(arguments.callee,
          "qx.fx.* is deprecated. Please use qx.bom.element.Animation instead."
        );
      }

      return 1 - (Math.cos(pos * 4.5 * Math.PI) * Math.exp(-pos * 6));
    },

    /**
     * Using this function the effect's impact will be zero.
     *
     * @param pos {Number} Effect position in duration
     * @return {Number} Modified effect position
     * @deprecated since 2.0: Please use qx.bom.element.Animation instead.
     */
    none : function(pos)
    {
      if (!this.__warned) {
        this.__warned = true;
        qx.log.Logger.deprecatedMethodWarning(arguments.callee,
          "qx.fx.* is deprecated. Please use qx.bom.element.Animation instead."
        );
      }

      return 0;
    },

    /**
     * Using this function the effect's impact will be
     * as if it has reached the end position.
     *
     * @param pos {Number} Effect position in duration
     * @return {Number} Modified effect position
     * @deprecated since 2.0: Please use qx.bom.element.Animation instead.
     */
    full : function(pos)
    {
      if (!this.__warned) {
        this.__warned = true;
        qx.log.Logger.deprecatedMethodWarning(arguments.callee,
          "qx.fx.* is deprecated. Please use qx.bom.element.Animation instead."
        );
      }

      return 1;
    }
  }
});
