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

/**
 * High performance DOM element interaction.
 */
qx.Class.define("qx.html2.element.Util",
{
  /*
  *****************************************************************************
     STATICS
  *****************************************************************************
  */

  statics :
  {
    /*
    ---------------------------------------------------------------------------
      STRING HELPERS
    ---------------------------------------------------------------------------
    */

    /**
     * Converts a script style property name to the CSS variant e.g. marginTop => margin-top
     *
     * @type static
     * @param name {String} Name of the style attribute (CSS variant e.g. marginTop, wordSpacing)
     * @return {String} the CSS style name e.g. margin-top, word-spacing
     */
    toCssStyle : function(name) {
      return name.replace(/([A-Z])/g, '-$1').toLowerCase();
    },


    /**
     * Converts a CSS style property name to the script variant e.g. margin-top => marginTop
     *
     * @type static
     * @param name {String} Name of the style attribute (CSS variant e.g. margin-top, word-spacing)
     * @return {String} the script style name e.g. marginTop, wordSpacing
     */
    toScriptStyle : function(name)
    {
      return name.replace(/\-([a-z])/g, function(match, chr) {
        return chr.toUpperCase();
      });
    },




    /*
    ---------------------------------------------------------------------------
      ELEMENT CSS
    ---------------------------------------------------------------------------
    */

    /**
     * Set the full CSS content of the style attribute
     *
     * @type static
     * @param element {Element} The DOM element to modify
     * @param value {String} The full CSS string
     * @signature function(element, value)
     * @return {void}
     */
    setCss : qx.core.Variant.select("qx.client",
    {
      "mshtml" : function(element, value) {
        element.style.cssText = value;
      },

      "default" : function(element, value) {
        element.setAttribute("style", value);
      }
    }),


    /**
     * Returns the full content of the style attribute.
     *
     * @type static
     * @param element {Element} The DOM element to query
     * @return {String} the full CSS string
     * @signature function(element)
     */
    getCss : qx.core.Variant.select("qx.client",
    {
      "mshtml" : function(element) {
        return element.style.cssText.toLowerCase();
      },

      "default" : function(element) {
        return element.getAttribute("style");
      }
    }),




    /*
    ---------------------------------------------------------------------------
      SCROLL HANDLING
    ---------------------------------------------------------------------------
    */

    /**
     * 
     *
     * @type static
     * @param element {Element} TODOC
     * @param x {var} TODOC
     * @return {void}
     */
    scrollToX : function(element, x) {
      element.scrollLeft = x;
    },


    /**
     * TODOC
     *
     * @type static
     * @param element {Element} TODOC
     * @param y {var} TODOC
     * @return {void}
     */
    scrollToY : function(element, y) {
      element.scrollTop = y;
    },




    /*
    ---------------------------------------------------------------------------
      ELEMENT VISIBILITY
    ---------------------------------------------------------------------------
    */

    /**
     * Shows the given element
     *
     * @type static
     * @param element {Element} DOM element to show
     * @return {void}
     */
    show : function(element) {
      element.style.visibility = "visible";
    },


    /**
     * Hides the given element
     *
     * @type static
     * @param element {Element} DOM element to show
     * @return {void}
     */
    hide : function(element) {
      element.style.visibility = "hidden";
    },


    /**
     * Toggle the visibility of the given element
     *
     * @type static
     * @param element {Element} DOM element to show
     * @return {void}
     */
    toggle : function(element) {
      element.style.visibility = this.isHidden(element) ? "visible" : "hidden";
    },


    /**
     * Whether the given element is visible
     *
     * @type static
     * @param element {Element} DOM element to query
     * @return {Boolean} true when the element is visible
     */
    isVisible : function(element) {
      return !this.isHidden(element);
    },


    /**
     * Whether the given element is hidden
     *
     * @type static
     * @param element {Element} DOM element to query
     * @return {Boolean} true when the element is hidden
     */
    isHidden : function(element) {
      return qx.html2.element.Style.get(element, "visibility") === "hidden";
    }
  }
});
