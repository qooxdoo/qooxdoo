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

************************************************************************ */

/**
 * Contains methods to control and query the element's overflow properties.
 */
qx.Class.define("qx.bom.element.Overflow",
{
  /*
  *****************************************************************************
     STATICS
  *****************************************************************************
  */

  statics :
  {
    /**
     * Compiles the given property into a cross-browser style string.
     *
     * @type static
     * @signature function(prop, value)
     * @param prop {String} Property name (overflowX or overflowY)
     * @param value {String} Overflow value for the given axis
     * @return {String} CSS string
     */
    _compile : qx.core.Variant.select("qx.client",
    {
      // gecko support differs
      "gecko" : qx.bom.client.Engine.VERSION < 1.8 ?

      // older geckos do not support overflowX
      function(prop, value)
      {
        // Fix for gecko < 1.6
        if (value == "hidden") {
          value = "-moz-scrollbars-none";
        }

        // Apply style
        return "overflow:" + value + ";";
      } :

      // gecko >= 1.8 supports overflowX, too
      function(prop, value) {
        return prop + ":" + value + ";";
      },

      // opera support differs
      "opera" : qx.bom.client.Engine.VERSION < 9.5 ?

      // older versions of opera have no support for splitted overflow properties.
      function(prop, value) {
        return "overflow:" + value + ";";
      } :

      // opera >=9.5 supports overflowX, too
      function(prop, value) {
        return prop + ":" + value + ";";
      },

      // use native overflowX property
      "default" : function(prop, value) {
        return prop + ":" + value + ";";
      }
    }),


    /**
     * Compiles the horizontal overflow property into a cross-browser style string.
     *
     * @type static
     * @param value {String} Overflow value
     * @return {String} CSS string
     */
    compileX : function(value) {
      return this._compile("overflow-x", value);
    },


    /**
     * Compiles the vertical overflow property into a cross-browser style string.
     *
     * @type static
     * @param value {String} Overflow value
     * @return {String} CSS string
     */
    compileY : function(value) {
      return this._compile("overflow-y", value);
    },


    // Mozilla notes (http://developer.mozilla.org/en/docs/Mozilla_CSS_Extensions):
    // -moz-scrollbars-horizontal: Indicates that horizontal scrollbars should
    //    always appear and vertical scrollbars should never appear.
    // -moz-scrollbars-vertical: Indicates that vertical scrollbars should
    //    always appear and horizontal scrollbars should never appear.
    // -moz-scrollbars-none: Indicates that no scrollbars should appear but
    //    the element should be scrollable from script. (This is the same as
    //    hidden, and has been since Mozilla 1.6alpha.)
    //
    // Also a lot of interesting bugs:
    // * https://bugzilla.mozilla.org/show_bug.cgi?id=42676
    // * https://bugzilla.mozilla.org/show_bug.cgi?id=47710
    // * https://bugzilla.mozilla.org/show_bug.cgi?id=235524

    /**
     * Returns the computed value of the horizontal overflow
     *
     * @type static
     * @signature function(element, mode)
     * @param element {Element} DOM element to query
     * @param mode {Number} Choose one of the modes {@link qx.bom.element.Style#COMPUTED_MODE},
     *   {@link qx.bom.element.Style#CASCADED_MODE}, {@link qx.bom.element.Style#LOCAL_MODE}.
     *   The computed mode is the default one.
     * @return {String} computed overflow value
     */
    getX : qx.core.Variant.select("qx.client",
    {
      // gecko support differs
      "gecko" : qx.bom.client.Engine.VERSION < 1.8 ?

      // older geckos do not support overflowX
      // it's also more safe to translate hidden to -moz-scrollbars-none
      // because of issues in older geckos
      function(element, mode)
      {
        var overflow = qx.bom.element.Style.get(element, "overflow", mode, false);

        if (overflow === "-moz-scrollbars-none") {
          overflow = "hidden";
        }

        return overflow;
      } :

      // gecko >= 1.8 supports overflowX, too
      function(element, mode) {
        return qx.bom.element.Style.get(element, "overflowX", mode, false);
      },

      // opera support differs
      "opera" : qx.bom.client.Engine.VERSION < 9.5 ?

      // older versions of opera have no support for splitted overflow properties.
      function(element, mode) {
        return qx.bom.element.Style.get(element, "overflow", mode, false);
      } :

      // opera >=9.5 supports overflowX, too
      function(element, mode) {
        return qx.bom.element.Style.get(element, "overflowX", mode, false);
      },

      // use native overflowX property
      "default" : function(element, mode) {
        return qx.bom.element.Style.get(element, "overflowX", mode, false);
      }
    }),


    /**
     * Sets the local horizontal overflow value to the given value
     *
     * @type static
     * @signature function(element, value)
     * @param element {Element} DOM element to modify
     * @param value {String} Any of "visible", "scroll", "hidden", "auto" or ""
     * @return {void}
     */
    setX : qx.core.Variant.select("qx.client",
    {
      // gecko support differs
      "gecko" : qx.bom.client.Engine.VERSION < 1.8 ?

      // older geckos do not support overflowX
      function(element, value)
      {
        // Fix for gecko < 1.6
        if (value == "hidden") {
          value = "-moz-scrollbars-none";
        }

        // Apply style
        element.style.overflow = value;
      } :

      // gecko >= 1.8 supports overflowX, too
      function(element, value) {
        element.style.overflowX = value;
      },

      // opera support differs
      "opera" : qx.bom.client.Engine.VERSION < 9.5 ?

      // older versions of opera have no support for splitted overflow properties.
      function(element, value) {
        element.style.overflow = value;
      } :

      // opera >=9.5 supports overflowX, too
      function(element, value) {
        element.style.overflowX = value;
      },

      // use native overflowX property
      "default" : function(element, value) {
        element.style.overflowX = value;
      }
    }),


    /**
     * Removes the locally configured horizontal overflow property
     *
     * @type static
     * @signature function(element)
     * @param element {Element} DOM element to modify
     * @return {void}
     */
    resetX : qx.core.Variant.select("qx.client",
    {
      "gecko" : qx.bom.client.Engine.VERSION < 1.8 ?

      function(element) {
        element.style.overflow = "";
      } :

      // gecko >= 1.8 supports overflowX, too
      function(element) {
        element.style.overflowX = "";
      },

      // opera support differs
      "opera" : qx.bom.client.Engine.VERSION < 9.5 ?

      // older versions of opera have no support for splitted overflow properties.
      function(element, value) {
        element.style.overflow = "";
      } :

      // opera >=9.5 supports overflowX, too
      function(element, value) {
        element.style.overflowX = "";
      },

      // use native overflowY property
      "default" : function(element) {
        element.style.overflowX = "";
      }
    }),


    /**
     * Returns the computed value of the vertical overflow
     *
     * @type static
     * @signature function(element, mode)
     * @param element {Element} DOM element to query
     * @param mode {Number} Choose one of the modes {@link qx.bom.element.Style#COMPUTED_MODE},
     *   {@link qx.bom.element.Style#CASCADED_MODE}, {@link qx.bom.element.Style#LOCAL_MODE}.
     *   The computed mode is the default one.
     * @return {String} computed overflow value
     */
    getY : qx.core.Variant.select("qx.client",
    {
      // gecko support differs
      "gecko" : qx.bom.client.Engine.VERSION < 1.8 ?

      // older geckos do not support overflowY
      // it's also more safe to translate hidden to -moz-scrollbars-none
      // because of issues in older geckos
      function(element, mode)
      {
        var overflow = qx.bom.element.Style.get(element, "overflow", mode, false);

        if (overflow === "-moz-scrollbars-none") {
          overflow = "hidden";
        }

        return overflow;
      } :

      // gecko >= 1.8 supports overflowY, too
      function(element, mode) {
        return qx.bom.element.Style.get(element, "overflowY", mode, false);
      },

      // opera support differs
      "opera" : qx.bom.client.Engine.VERSION < 9.5 ?

      // older versions of opera have no support for splitted overflow properties.
      function(element, mode) {
        return qx.bom.element.Style.get(element, "overflow", mode, false);
      } :

      // opera >=9.5 supports overflowY, too
      function(element, mode) {
        return qx.bom.element.Style.get(element, "overflowY", mode, false);
      },

      // use native overflowY property
      "default" : function(element, mode) {
        return qx.bom.element.Style.get(element, "overflowY", mode, false);
      }
    }),


    /**
     * Sets the local vertical overflow value to the given value
     *
     * @type static
     * @signature function(element, value)
     * @param element {Element} DOM element to modify
     * @param value {String} Any of "visible", "scroll", "hidden", "auto" or ""
     * @return {void}
     */
    setY : qx.core.Variant.select("qx.client",
    {
      // gecko support differs
      "gecko" : qx.bom.client.Engine.VERSION < 1.8 ?

      // older geckos do not support overflowY
      // it's also more safe to translate hidden to -moz-scrollbars-none
      // because of issues in older geckos
      function(element, value)
      {
        // Fix for gecko < 1.6
        if (value === "hidden") {
          value = "-moz-scrollbars-none";
        }

        // Apply style
        element.style.overflow = value;
      } :

      // gecko >= 1.8 supports overflowY, too
      function(element, value) {
        element.style.overflowY = value;
      },

      // opera support differs
      "opera" : qx.bom.client.Engine.VERSION < 9.5 ?

      // older versions of opera have no support for splitted overflow properties.
      function(element, value) {
        element.style.overflow = value;
      } :

      // opera >=9.5 supports overflowX, too
      function(element, value) {
        element.style.overflowY = value;
      },

      // use native overflowY property
      "default" : function(element, value) {
        element.style.overflowY = value;
      }
    }),


    /**
     * Removes the locally configured vertical overflow property
     *
     * @type static
     * @signature function(element)
     * @param element {Element} DOM element to modify
     * @return {void}
     */
    resetY : qx.core.Variant.select("qx.client",
    {
      "gecko" : qx.bom.client.Engine.VERSION < 1.8 ?

      function(element) {
        element.style.overflow = "";
      } :

      // gecko >= 1.8 supports overflowX, too
      function(element) {
        element.style.overflowY = "";
      },

      // opera support differs
      "opera" : qx.bom.client.Engine.VERSION < 9.5 ?

      // older versions of opera have no support for splitted overflow properties.
      function(element, value) {
        element.style.overflow = "";
      } :

      // opera >=9.5 supports overflowX, too
      function(element, value) {
        element.style.overflowY = "";
      },

      // use native overflowY property
      "default" : function(element) {
        element.style.overflowY = "";
      }
    })
  }
});
