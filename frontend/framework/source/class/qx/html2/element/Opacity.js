/* ************************************************************************

   qooxdoo - the new era of web development

   http://qooxdoo.org

   Copyright:
     2004-2007 1&1 Internet AG, Germany, http://www.1and1.org

   License:
     LGPL: http://www.gnu.org/licenses/lgpl.html
     EPL: http://www.eclipse.org/org/documents/epl-v10.php
     See the LICENSE file in the project's top-level directory for details.

   Authors:
     * Sebastian Werner (wpbasti)

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


************************************************************************ */

/* ************************************************************************

#module(html2)

************************************************************************ */

qx.Class.define("qx.html2.element.Opacity",
{
  /*
  *****************************************************************************
     STATICS
  *****************************************************************************
  */

  statics :
  {

    /** shorthand to style class */
    __style : qx.html2.element.Style,


    /**
     * Sets opacity of given element. Accepts numbers between zero and one
     * where "0" means transparent, "1" means opaque.
     *
     * @type static
     * @param el {Element} DOM element to modify
     * @param opacity {Float} A float number between 0 and 1
     * @return {void}
     * @signature function(el, opacity)
     */
    set : qx.core.Variant.select("qx.client",
    {
      "mshtml" : function(el, opacity)
      {
        // Read in computed filter
        var filter = this.__style.get(el, "filter");

        // Remove opacity filter
        if (opacity >= 1)
        {
          el.style.filter = filter.replace(/alpha\([^\)]*\)/gi, "");
          return;
        }

        if (opacity < 0.00001) {
          opacity = 0;
        }

        // IE has trouble with opacity if it does not have layout (hasLayout)
        // Force it by setting the zoom level
        if (!el.currentStyle.hasLayout) {
          el.style.zoom = 1;
        }

        // Remove old alpha filter and add new one
        el.style.filter = filter.replace(/alpha\([^\)]*\)/gi, "") + "alpha(opacity=" + opacity * 100 + ")";
      },

      "gecko" : function(el, opacity)
      {
        // Animations look better when not using 1.0 in gecko
        if (opacity == 1) {
          opacity = 0.999999;
        }

        if (qx.html2.client.Engine.VERSION < 1.7) {
          el.style.MozOpacity = opacity;
        } else {
          el.style.opacity = opacity;
        }
      },

      "default" : function(el, opacity)
      {
        if (opacity == 1) {
          opacity = "";
        }

        el.style.opacity = opacity;
      }
    }),


    /**
     * Gets opacity of given element. Accepts numbers between zero and one
     * where "0" means transparent, "1" means opaque.
     *
     * @type static
     * @param el {Element} DOM element to modify
     * @return {Float} A float number between 0 and 1
     * @signature function(el)
     */
    get : qx.core.Variant.select("qx.client",
    {
      "mshtml" : function(el)
      {
        var filter = this.__style.get(el, "filter");

        if (filter)
        {
          var opacity = filter.match(/alpha\(opacity=(.*)\)/);

          if (opacity && opacity[1]) {
            return parseFloat(opacity[1]) / 100;
          }
        }

        return 1.0;
      },

      "gecko" : function(el)
      {
        var opacity = this.__style.get(el, qx.html2.client.Engine.VERSION < 1.7 ? "MozOpacity" : "opacity");

        if (opacity == 0.999999) {
          opacity = 1.0;
        }

        if (opacity != null) {
          return parseFloat(opacity);
        }

        return 1.0;
      },

      "default" : function(el)
      {
        var opacity = this.__style.get(el, "opacity");

        if (opacity != null) {
          return parseFloat(opacity);
        }

        return 1.0;
      }
    })
  }
});
