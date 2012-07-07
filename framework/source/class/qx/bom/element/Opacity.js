/* ************************************************************************

   qooxdoo - the new era of web development

   http://qooxdoo.org

   Copyright:
     2004-2008 1&1 Internet AG, Germany, http://www.1und1.de

   License:
     LGPL: http://www.gnu.org/licenses/lgpl.html
     EPL: http://www.eclipse.org/org/documents/epl-v10.php
     See the LICENSE file in the project's top-level directory for details.

   Authors:
     * Sebastian Werner (wpbasti)
     * Christian Hagendorn (chris_schmidt)

   ======================================================================

   This class contains code based on the following work:

   * Prototype JS
     http://www.prototypejs.org/
     Version 1.5

     Copyright:
       (c) 2006-2007, Prototype Core Team

     License:
       MIT: http://www.opensource.org/licenses/mit-license.php

     Authors:
       * Prototype Core Team

   ----------------------------------------------------------------------

     Copyright (c) 2005-2008 Sam Stephenson

     Permission is hereby granted, free of charge, to any person
     obtaining a copy of this software and associated documentation
     files (the "Software"), to deal in the Software without restriction,
     including without limitation the rights to use, copy, modify, merge,
     publish, distribute, sublicense, and/or sell copies of the Software,
     and to permit persons to whom the Software is furnished to do so,
     subject to the following conditions:

     THE SOFTWARE IS PROVIDED "AS IS", WITHOUT WARRANTY OF ANY KIND,
     EXPRESS OR IMPLIED, INCLUDING BUT NOT LIMITED TO THE WARRANTIES OF
     MERCHANTABILITY, FITNESS FOR A PARTICULAR PURPOSE AND
     NONINFRINGEMENT. IN NO EVENT SHALL THE AUTHORS OR COPYRIGHT
     HOLDERS BE LIABLE FOR ANY CLAIM, DAMAGES OR OTHER LIABILITY,
     WHETHER IN AN ACTION OF CONTRACT, TORT OR OTHERWISE, ARISING FROM,
     OUT OF OR IN CONNECTION WITH THE SOFTWARE OR THE USE OR OTHER
     DEALINGS IN THE SOFTWARE.

************************************************************************ */


/**
 * Cross-browser opacity support.
 *
 * Optimized for animations (contains workarounds for typical flickering
 * in some browsers). Reduced class dependencies for optimal size and
 * performance.
 */
qx.Bootstrap.define("qx.bom.element.Opacity",
{
  /*
  *****************************************************************************
     STATICS
  *****************************************************************************
  */

  statics :
  {
    /**
     * {Boolean} <code>true</code> when the style attribute "opacity" is supported,
     * <code>false</code> otherwise.
     */
    SUPPORT_CSS3_OPACITY : false,

    /**
     * Compiles the given opacity value into a cross-browser CSS string.
     * Accepts numbers between zero and one
     * where "0" means transparent, "1" means opaque.
     *
     * @signature function(opacity)
     * @param opacity {Float} A float number between 0 and 1
     * @return {String} CSS compatible string
     */
    compile : qx.core.Environment.select("engine.name",
    {
      "mshtml" : function(opacity)
      {
        if (opacity >= 1) {
          opacity = 1;
        }

        if (opacity < 0.00001) {
          opacity = 0;
        }

        if (qx.bom.element.Opacity.SUPPORT_CSS3_OPACITY) {
          return "opacity:" + opacity + ";";
        } else {
          return "zoom:1;filter:alpha(opacity=" + (opacity * 100) + ");";
        }
      },

      "gecko" : function(opacity)
      {
        // Animations look better when not using 1.0 in gecko
        if (opacity >= 1) {
          opacity = 0.999999;
        }

        return "opacity:" + opacity + ";";
      },

      "default" : function(opacity)
      {
        if (opacity >= 1) {
          return "";
        }

        return "opacity:" + opacity + ";";
      }
    }),


    /**
     * Sets opacity of given element. Accepts numbers between zero and one
     * where "0" means transparent, "1" means opaque.
     *
     * @param element {Element} DOM element to modify
     * @param opacity {Float} A float number between 0 and 1
     * @return {void}
     * @signature function(element, opacity)
     */
    set : qx.core.Environment.select("engine.name",
    {
      "mshtml" : function(element, opacity)
      {
        if (qx.bom.element.Opacity.SUPPORT_CSS3_OPACITY)
        {
          if (opacity >= 1) {
            opacity = "";
          }

          element.style.opacity = opacity;
        }
        else
        {
          // Read in computed filter
          var filter = qx.bom.element.Style.get(element, "filter", qx.bom.element.Style.COMPUTED_MODE, false);

          if (opacity >= 1)
          {
            opacity = 1;
          }

          if (opacity < 0.00001) {
            opacity = 0;
          }

          // IE has trouble with opacity if it does not have layout (hasLayout)
          // Force it by setting the zoom level
          if (!element.currentStyle || !element.currentStyle.hasLayout) {
            element.style.zoom = 1;
          }

          // Remove old alpha filter and add new one
          element.style.filter = filter.replace(/alpha\([^\)]*\)/gi, "") + "alpha(opacity=" + opacity * 100 + ")";
        }
      },

      "gecko" : function(element, opacity)
      {
        // Animations look better when not using 1.0 in gecko
        if (opacity >= 1) {
          opacity = 0.999999;
        }

        if (!qx.bom.element.Opacity.SUPPORT_CSS3_OPACITY) {
          element.style.MozOpacity = opacity;
        } else {
          element.style.opacity = opacity;
        }
      },

      "default" : function(element, opacity)
      {
        if (opacity >= 1) {
          opacity = "";
        }

        element.style.opacity = opacity;
      }
    }),


    /**
     * Resets opacity of given element.
     *
     * @param element {Element} DOM element to modify
     * @return {void}
     * @signature function(element)
     */
    reset : qx.core.Environment.select("engine.name",
    {
      "mshtml" : function(element)
      {
        if (qx.bom.element.Opacity.SUPPORT_CSS3_OPACITY)
        {
          element.style.opacity = "";
        }
        else
        {
          // Read in computed filter
          var filter = qx.bom.element.Style.get(element, "filter", qx.bom.element.Style.COMPUTED_MODE, false);

          // Remove old alpha filter
          element.style.filter = filter.replace(/alpha\([^\)]*\)/gi, "");
        }
      },

      "gecko" : function(element)
      {
        if (!qx.bom.element.Opacity.SUPPORT_CSS3_OPACITY) {
          element.style.MozOpacity = "";
        } else {
          element.style.opacity = "";
        }
      },

      "default" : function(element) {
        element.style.opacity = "";
      }
    }),


    /**
     * Gets computed opacity of given element. Accepts numbers between zero and one
     * where "0" means transparent, "1" means opaque.
     *
     * @param element {Element} DOM element to modify
     * @param mode {Number} Choose one of the modes {@link qx.bom.element.Style#COMPUTED_MODE},
     *   {@link qx.bom.element.Style#CASCADED_MODE}, {@link qx.bom.element.Style#LOCAL_MODE}.
     *   The computed mode is the default one.
     * @return {Float} A float number between 0 and 1
     * @signature function(element, mode)
     */
    get : qx.core.Environment.select("engine.name",
    {
      "mshtml" : function(element, mode)
      {
        if (qx.bom.element.Opacity.SUPPORT_CSS3_OPACITY)
        {
          var opacity = qx.bom.element.Style.get(element, "opacity", mode, false);

          if (opacity != null) {
            return parseFloat(opacity);
          }

          return 1.0;
        }
        else
        {
          var filter = qx.bom.element.Style.get(element, "filter", mode, false);

          if (filter)
          {
            var opacity = filter.match(/alpha\(opacity=(.*)\)/);

            if (opacity && opacity[1]) {
              return parseFloat(opacity[1]) / 100;
            }
          }

          return 1.0;
        }
      },

      "gecko" : function(element, mode)
      {
        var opacity = qx.bom.element.Style.get(element, !qx.bom.element.Opacity.SUPPORT_CSS3_OPACITY ? "MozOpacity" : "opacity", mode, false);

        if (opacity == 0.999999) {
          opacity = 1.0;
        }

        if (opacity != null) {
          return parseFloat(opacity);
        }

        return 1.0;
      },

      "default" : function(element, mode)
      {
        var opacity = qx.bom.element.Style.get(element, "opacity", mode, false);

        if (opacity != null) {
          return parseFloat(opacity);
        }

        return 1.0;
      }
    })
  },

  defer : function(statics) {
    statics.SUPPORT_CSS3_OPACITY = qx.core.Environment.get("css.opacity");
  }
});
