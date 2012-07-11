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
qx.Bootstrap.define("qx.bom.element.Overflow",
{
  /*
  *****************************************************************************
     STATICS
  *****************************************************************************
  */

  statics :
  {
    /**
     * The default width which is used for the width of the scroll bar if
     * overlayed.
     * @deprecated since 2.1
     */
    DEFAULT_SCROLLBAR_WIDTH : 14,


    /** {Integer} The typical native scrollbar size in the environment */
    __scrollbarSize : null,

    /**
     * Get the typical native scrollbar size in the environment
     *
     * @return {Integer} The native scrollbar size
     */
    getScrollbarWidth : function()
    {
      if (this.__scrollbarSize !== null) {
        return this.__scrollbarSize;
      }

      var Style = qx.bom.element.Style;

      var getStyleSize = function(el, propertyName) {
        return parseInt(Style.get(el, propertyName), 10) || 0;
      };

      var getBorderRight = function(el)
      {
        return (
          Style.get(el, "borderRightStyle") == "none"
          ? 0
          : getStyleSize(el, "borderRightWidth")
        );
      };

      var getBorderLeft = function(el)
      {
        return (
          Style.get(el, "borderLeftStyle") == "none"
          ? 0
          : getStyleSize(el, "borderLeftWidth")
        );
      };

      var getInsetRight = qx.core.Environment.select("engine.name",
      {
        "mshtml" : function(el)
        {
          if (
            Style.get(el, "overflowY") == "hidden" ||
            el.clientWidth == 0
          ) {
            return getBorderRight(el);
          }

          return Math.max(0, el.offsetWidth - el.clientLeft - el.clientWidth);
        },

          "default" : function(el)
        {
          // Alternative method if clientWidth is unavailable
          // clientWidth == 0 could mean both: unavailable or really 0
          if (el.clientWidth == 0)
          {
            var ov = Style.get(el, "overflow");
            var sbv = (
              ov == "scroll" ||
              ov == "-moz-scrollbars-vertical" ? 16 : 0
            );
            return Math.max(0, getBorderRight(el) + sbv);
          }

          return Math.max(
            0,
            (el.offsetWidth - el.clientWidth - getBorderLeft(el))
          );
        }
      });

      var getScrollBarSizeRight = function(el) {
        return getInsetRight(el) - getBorderRight(el);
      };

      var t = document.createElement("div");
      var s = t.style;

      s.height = s.width = "100px";
      s.overflow = "scroll";

      document.body.appendChild(t);
      var c = getScrollBarSizeRight(t);
      this.__scrollbarSize = c;
      document.body.removeChild(t);

      return this.__scrollbarSize;
    },


    /**
     * Compiles the given property into a cross-browser style string.
     *
     * @signature function(prop, value)
     * @param prop {String} Property name (overflowX or overflowY)
     * @param value {String} Overflow value for the given axis
     * @return {String} CSS string
     * @deprecated since 2.1
     */
    _compile : function(prop, value) {
      return prop + ":" + value + ";";
    },


    /**
     * Compiles the horizontal overflow property into a cross-browser style string.
     *
     * @param value {String} Overflow value
     * @return {String} CSS string
     * @deprecated since 2.1
     */
    compileX : function(value) {
      if (qx.core.Environment.get("qx.debug")) {
        qx.log.Logger.deprecatedMethodWarning(
          arguments.callee, 
          "Use qx.bom.element.Style.compile({'overflowX': value}) instead."
        );
      }

      return this._compile("overflow-x", value);
    },


    /**
     * Compiles the vertical overflow property into a cross-browser style string.
     *
     * @param value {String} Overflow value
     * @return {String} CSS string
     * @deprecated since 2.1
     */
    compileY : function(value) {
      if (qx.core.Environment.get("qx.debug")) {
        qx.log.Logger.deprecatedMethodWarning(
          arguments.callee, 
          "Use qx.bom.element.Style.compile({'overflowY': value}) instead."
        );
      }

      return this._compile("overflow-y", value);
    },


    /**
     * Returns the computed value of the horizontal overflow
     *
     * @param element {Element} DOM element to query
     * @param mode {Number} Choose one of the modes {@link qx.bom.element.Style#COMPUTED_MODE},
     *   {@link qx.bom.element.Style#CASCADED_MODE}, {@link qx.bom.element.Style#LOCAL_MODE}.
     *   The computed mode is the default one.
     * @return {String} computed overflow value
     * @deprecated since 2.1
     */
    getX : function(element, mode) {
      if (qx.core.Environment.get("qx.debug")) {
        qx.log.Logger.deprecatedMethodWarning(
          arguments.callee, 
          "Use qx.bom.element.Style.get(element, 'overflowX', mode) instead."
        );
      }

      if (qx.core.Environment.get("css.overflowxy")) {
        return qx.bom.element.Style.get(element, "overflowX", mode, false);
      }

      return qx.bom.element.Style.get(element, "overflow", mode, false);
    },


    /**
     * Sets the local horizontal overflow value to the given value
     *
     * @param element {Element} DOM element to modify
     * @param value {String} Any of "visible", "scroll", "hidden", "auto" or ""
     * @deprecated since 2.1
     */
    setX : function(element, value) {
      if (qx.core.Environment.get("qx.debug")) {
        qx.log.Logger.deprecatedMethodWarning(
          arguments.callee, 
          "Use qx.bom.element.Style.set(element, 'overflowX', value) instead."
        );
      }

      if (qx.core.Environment.get("css.overflowxy")) {
        element.style.overflowX = value;
      } else {
        element.style.overflow = value;
      }
    },


    /**
     * Removes the locally configured horizontal overflow property
     *
     * @param element {Element} DOM element to modify
     * @deprecated since 2.1
     */
    resetX : function(element)
    {
      if (qx.core.Environment.get("qx.debug")) {
        qx.log.Logger.deprecatedMethodWarning(
          arguments.callee, 
          "Use qx.bom.element.Style.reset(element, 'overflowX') instead."
        );
      }

      if (qx.core.Environment.get("css.overflowxy")) {
        element.style.overflowX = "";
      } else {
        element.style.overflow = "";
      }
    },


    /**
     * Returns the computed value of the vertical overflow
     *
     * @param element {Element} DOM element to query
     * @param mode {Number} Choose one of the modes {@link qx.bom.element.Style#COMPUTED_MODE},
     *   {@link qx.bom.element.Style#CASCADED_MODE}, {@link qx.bom.element.Style#LOCAL_MODE}.
     *   The computed mode is the default one.
     * @return {String} computed overflow value
     * @deprecated since 2.1
     */
    getY : function(element, mode)
    {
      if (qx.core.Environment.get("qx.debug")) {
        qx.log.Logger.deprecatedMethodWarning(
          arguments.callee, 
          "Use qx.bom.element.Style.get(element, 'overflowY', mode) instead."
        );
      }

      if (qx.core.Environment.get("css.overflowxy")) {
        return qx.bom.element.Style.get(element, "overflowY", mode, false);
      }

      return qx.bom.element.Style.get(element, "overflow", mode, false);
    },


    /**
     * Sets the local vertical overflow value to the given value
     *
     * @param element {Element} DOM element to modify
     * @param value {String} Any of "visible", "scroll", "hidden", "auto" or ""
     * @deprecated since 2.1
     */
    setY : function(element, value)
    {
      if (qx.core.Environment.get("qx.debug")) {
        qx.log.Logger.deprecatedMethodWarning(
          arguments.callee, 
          "Use qx.bom.element.Style.set(element, 'overflowY', value) instead."
        );
      }
      if (qx.core.Environment.get("css.overflowxy")) {
        element.style.overflowY = value;
      } else {
        element.style.overflow = value;
      }
    },


    /**
     * Removes the locally configured vertical overflow property
     *
     * @param element {Element} DOM element to modify
     * @deprecated since 2.1
     */
    resetY : function(element)
    {
      if (qx.core.Environment.get("qx.debug")) {
        qx.log.Logger.deprecatedMethodWarning(
          arguments.callee, 
          "Use qx.bom.element.Style.reset(element, 'overflowY') instead."
        );
      }
      if (qx.core.Environment.get("css.overflowxy")) {
        element.style.overflowY = "";
      } else {
        element.style.overflow = "";
      }
    }
  }
});
// @deprecated since 2.1
qx.log.Logger.deprecatedConstantWarning(
  qx.bom.element.Overflow,
  "DEFAULT_SCROLLBAR_WIDTH",
  "Please use 'qx.ui.core.scroll.AbstractScrollArea.DEFAULT_SCROLLBAR_WIDTH' instead."
);