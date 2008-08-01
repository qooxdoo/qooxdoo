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
    /** {Map} Contains all supported styles */
    __styles :
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
     * @return {Element} Helper DOM element
     */
    __prepareText : function()
    {
      var el = document.createElement("div");
      var style = el.style;

      style.width = style.height = "auto";
      style.left = style.top = "-1000px";
      style.visibility = "hidden";
      style.position = "absolute";
      style.overflow = "visible";
      style.whiteSpace = "nowrap";

      if (qx.core.Variant.isSet("qx.client", "gecko"))
      {
        var inner = document.createElementNS("http://www.mozilla.org/keymaster/gatekeeper/there.is.only.xul", "label");
        el.appendChild(inner);
      }

      document.body.insertBefore(el, document.body.firstChild);

      return this._textElement = el;
    },


    /**
     * Generates the helper DOM element for HTML measuring
     *
     * @return {Element} Helper DOM element
     */
    __prepareHtml : function()
    {
      var el = qx.bom.Element.create("div");
      var style = el.style;

      style.width = style.height = "auto";
      style.left = style.top = "-1000px";
      style.visibility = "hidden";
      style.position = "absolute";
      style.overflow = "visible";
      style.whiteSpace = "normal";

      document.body.insertBefore(el, document.body.firstChild);

      return this._htmlElement = el;
    },


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
     * It is not possible to modify the mode afterwards.
     *
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
        el.useHtml = true;
      }

      // Gecko as of Firefox 2.x and 3.0 does not support ellipsis
      // for text overflow. We use this feature from XUL instead.
      else if (qx.core.Variant.isSet("qx.client", "gecko"))
      {
        var el = win.document.createElement("div");
        var xulel = win.document.createElementNS("http://www.mozilla.org/keymaster/gatekeeper/there.is.only.xul", "label");

        xulel.style.cursor = "inherit";
        xulel.style.overflow = "hidden";
        xulel.style.maxWidth = "100%";

        xulel.setAttribute("crop", "end");

        el.appendChild(xulel);
      }
      else
      {
        var el = win.document.createElement("div");
      }

      if (content) {
        this.setContent(el, content);
      }

      return el;
    },


    /**
     * Returns a map of all styles which should be applied as
     * a basic set.
     *
     * @param html {Boolean?false} Whether HTML markup should be used.
     * @return {Map} Initial styles which should be applied to a label element.
     */
    getStyles : function(html)
    {
      var styles = {};

      if (html)
      {
        styles.whiteSpace = "normal";
      }
      else if (qx.core.Variant.isSet("qx.client", "gecko"))
      {
        styles.display = "block";
      }
      else
      {
        styles.overflow = "hidden";
        styles.whiteSpace = "nowrap";
        styles.textOverflow = "ellipsis";

        // Opera as of 9.2.x only supports -o-text-overflow
        if (qx.core.Variant.isSet("qx.client", "opera")) {
          styles.OTextOverflow = "ellipsis";
        }
      }

      styles.userSelect = "none";

      return styles;
    },


    /**
     * Sets the content of the element.
     *
     * The possibilities of the value depends on the mode
     * defined using {@see #create}.
     *
     * @param element {Element} DOM element to modify.
     * @param value {String} Content to insert.
     * @return {void}
     */
    setContent : function(element, value)
    {
      value = value || "";

      if (element.useHtml)
      {
        element.innerHTML = value;
      }
      else if (qx.core.Variant.isSet("qx.client", "gecko"))
      {
        element.firstChild.setAttribute("value", value);
      }
      else
      {
        qx.bom.element.Attribute.set(element, "text", value);
      }
    },


    /**
     * Returns the content of the element.
     *
     * @param element {Element} DOM element to query.
     * @return {String} Content stored in the element.
     */
    getContent : function(element)
    {
      if (element.useHtml)
      {
        return element.innerHTML;
      }
      else if (qx.core.Variant.isSet("qx.client", "gecko"))
      {
        return element.firstChild.getAttribute("value") || "";
      }
      else
      {
        return qx.bom.element.Attribute.get(element, "text");
      }
    },


    /**
     * Returns the preferred dimensions of the given HTML content.
     *
     * @param content {String} The HTML markup to measure
     * @param styles {Map} Optional styles to apply
     * @param width {Integer} To support width for height it is possible to limit the width
     * @return {Map} A map with preferred <code>width</code> and <code>height</code>.
     */
    getHtmlSize : function(content, styles, width)
    {
      var element = this._htmlElement || this.__prepareHtml();

      // sync styles
      var keys = this.__styles;

      if (!styles) {
        styles = {};
      }

      for (var key in keys) {
        element.style[key] = styles[key] || "";
      }

      // apply width
      element.style.width = width != null ? width + "px" : "auto";

      // insert content
      element.innerHTML = content;

      // compute size and return
      return {
        width : element.clientWidth,
        height : element.clientHeight
      };
    },


    /**
     * Returns the preferred dimensions of the given text.
     *
     * @param text {String} The text to measure
     * @param styles {Map} Optional styles to apply
     * @return {Map} A map with preferred <code>width</code> and <code>height</code>.
     */
    getTextSize : function(text, styles)
    {
      var element = this._textElement || this.__prepareText();

      // sync styles
      var keys = this.__styles;

      if (!styles) {
        styles = {};
      }

      for (var key in keys) {
        element.style[key] = styles[key] || "";
      }

      // insert text
      if (qx.core.Variant.isSet("qx.client", "gecko")) {
        element.firstChild.setAttribute("value", text);
      } else if (qx.core.Variant.isSet("qx.client", "mshtml|opera")) {
        element.innerText = text;
      } else {
        element.textContent = text;
      }

      var width = element.clientWidth;
      var height = element.clientHeight;

      if (qx.core.Variant.isSet("qx.client", "gecko"))
      {
        // Under Mac at least with Firefox 3.0 alpha 6 and earlier
        // there was an issue that the text size calculation returns
        // a size which is a bit to small and results into ellipsis
        // even under the measured size.
        if (qx.bom.client.Platform.MAC) {
          width++;
        }
      }

      // compute size and return
      return {
        width : width,
        height : height
      };
    }
  }
});
