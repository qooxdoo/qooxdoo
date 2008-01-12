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

/* ************************************************************************

#module(bom)

************************************************************************ */

/**
 * Cross browser abstractions to work with labels.
 */
qx.Class.define("qx.bom.Label",
{
  /*
  *****************************************************************************
     STATICS
  *****************************************************************************
  */

  statics :
  {
    /**
     * Creates a label.
     *
     * The default mode is 'text' which means that the overlapping text is cutted of
     * using the ellipsis sign automatically. Text wrapping is disabled in this mode
     * as well. Spaces are normalized. Umlauts and other special symbols are only
     * allowed in unicode mode as normal characters.
     *
     * In the HTML mode you can insert any HTML, but loose the capability to cut
     * of overlapping text. Automatic text wrapping is enabled by default.
     *
     * The mode is not for a created element anymore.
     *
     * @type static
     * @param content {String} Content of the label
     * @param html {Boolean?false} Whether HTML markup should be used.
     * @param win {Window?null} Window to create the element for
     * @return {Element} The created iframe node
     */
    create : function(content, html, win)
    {
      if (!win) {
        win = window;
      }

      if (html)
      {
        var el = win.document.createElement("div");
        el.style.whiteSpace = "normal";
      }
      else if (qx.core.Variant.isSet("qx.client", "gecko"))
      {
        var el = win.document.createElementNS("http://www.mozilla.org/keymaster/gatekeeper/there.is.only.xul", "label");

        el.style.display = "block";
        el.setAttribute("crop", "end");
      }
      else
      {
        var el = win.document.createElement("div");

        var prop = qx.core.Variant.isSet("qx.client", "opera") ? "OTextOverflow" : "textOverflow";
        el.style[prop] = "ellipsis";

        el.style.overflow = "hidden";
        el.style.whiteSpace = "nowrap";
      }

      el.useHtml = !!html;

      if (content) {
        this.setContent(el, content);
      }

      return el;
    },

    setContent : function(element, value)
    {
      if (element.useHtml)
      {
        element.innerHTML = value;
      }
      else if (qx.core.Variant.isSet("qx.client", "gecko"))
      {
        element.setAttribute("value", value);
      }
      else
      {
        qx.bom.element.Attribute.set(element, "text", value);
      }
    },

    getContent : function(element)
    {
      if (element.useHtml)
      {
        return element.innerHTML;
      }
      else if (qx.core.Variant.isSet("qx.client", "gecko"))
      {
        return element.getAttribute("value") || "";
      }
      else
      {
        return qx.bom.element.Attribute.get(element, "text");
      }
    },


    /** {Map} Contains all supported styles */
    _styles :
    {
      fontFamily : 1,
      fontSize : 1,
      fontWeight : 1,
      fontStyle : 1,
      lineHeight : 1
    },


    /**
     * Generates the helper DOM element for text measuring
     *
     * @type static
     * @return {Element} Helper DOM element
     */
    _prepareText : function()
    {
      var el = qx.bom.Element.create("div");
      var style = el.style;

      style.width = style.height = "auto";
      style.left = style.top = 0;
      style.visibility = "hidden";
      style.position = "absolute";
      style.overflow = "visible";
      style.whiteSpace = "nowrap";

      document.body.insertBefore(el, document.body.firstChild);

      return this._textElement = el;
    },


    /**
     * Generates the helper DOM element for HTML measuring
     *
     * @type static
     * @return {Element} Helper DOM element
     */
    _prepareHtml : function()
    {
      var el = qx.bom.Element.create("div");
      var style = el.style;

      style.width = style.height = "auto";
      style.left = style.top = 0;
      style.visibility = "hidden";
      style.position = "absolute";
      style.overflow = "visible";
      style.whiteSpace = "normal";

      document.body.insertBefore(el, document.body.firstChild);

      return this._htmlElement = el;
    },


    /**
     * Returns the preferred dimensions of the given HTML content.
     *
     * @type static
     * @param content {String} The HTML markup to measure
     * @param styles {Map} Optional styles to apply
     * @param width {Integer} To support width for height it is possible to limit the width
     * @return {Map} A map with preferred <code>width</code> and <code>height</code>.
     */
    getHtmlSize : function(content, styles, width)
    {
      var element = this._htmlElement || this._prepareHtml();

      // sync styles
      var keys = this._styles;

      if (!styles) {
        styles = {};
      }

      for (var key in keys) {
        element.style[key] = styles[key] || "";
      }

      // apply width
      element.style.width = width != null ? width + "px" : "";

      // insert content
      element.innerHTML = content;

      // compute size and return
      return {
        width : element.scrollWidth,
        height : element.scrollHeight
      };
    },


    /**
     * Returns the preferred dimensions of the given text.
     *
     * @type static
     * @param text {String} The text to measure
     * @param styles {Map} Optional styles to apply
     * @return {Map} A map with preferred <code>width</code> and <code>height</code>.
     */
    getTextSize : function(text, styles)
    {
      var element = this._textElement || this._prepareText();

      // sync styles
      var keys = this._styles;

      if (!styles) {
        styles = {};
      }

      for (var key in keys) {
        element.style[key] = styles[key] || "";
      }

      // insert text
      if (qx.core.Variant.isSet("qx.client", "mshtml|opera")) {
        element.innerText = text;
      } else {
        element.textContent = text;
      }

      // compute size and return
      return {
        width : element.offsetWidth,
        height : element.offsetHeight
      };
    }
  }
});
