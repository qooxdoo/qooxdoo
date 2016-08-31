/* ************************************************************************

   qooxdoo - the new era of web development

   http://qooxdoo.org

   Copyright:
     2004-2008 1&1 Internet AG, Germany, http://www.1und1.de

   License:
     MIT: https://opensource.org/licenses/MIT
     See the LICENSE file in the project's top-level directory for details.

   Authors:
     * Sebastian Werner (wpbasti)
     * Fabian Jakobs (fjakobs)

************************************************************************ */

/**
 * Cross browser abstractions to work with labels.
 */
qx.Bootstrap.define("qx.bom.Label", {
  /*
  *****************************************************************************
     STATICS
  *****************************************************************************
  */

  statics :
  {
    /** @type {Map} Contains all supported styles */
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
      var el = this.__createMeasureElement(false);
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
      var el = this.__createMeasureElement(true);
      document.body.insertBefore(el, document.body.firstChild);

      return this._htmlElement = el;
    },


    /**
     * Creates the measure element
     *
     * @param html {Boolean?false} Whether HTML markup should be used.
     * @return {Element} The measure element
     */
    __createMeasureElement : function(html)
    {
      var el = qx.dom.Element.create("div");
      var style = el.style;

      style.width = style.height = "auto";
      style.left = style.top = "-1000px";
      style.visibility = "hidden";
      style.position = "absolute";
      style.overflow = "visible";
      style.display = "block";

      if (html)
      {
        style.whiteSpace = "normal";
      }
      else
      {
        style.whiteSpace = "nowrap";

        if (!qx.core.Environment.get("css.textoverflow") &&
          qx.core.Environment.get("html.xul"))
        {
          var inner = document.createElementNS("http://www.mozilla.org/keymaster/gatekeeper/there.is.only.xul", "label");

          // Force style inheritance for font styles to omit usage of
          // CSS "label" selector, See bug #1349 for details.
          var style = inner.style;
          style.padding = "0";
          style.margin = "0";
          style.width = "auto";

          for (var key in this.__styles) {
            style[key] = "inherit";
          }

          el.appendChild(inner);
        }
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
    __getStyles : function(html)
    {
      var styles = {};

      styles.overflow = "hidden";
      if (html)
      {
        styles.whiteSpace = "normal";
      }
      else if (!qx.core.Environment.get("css.textoverflow") &&
        qx.core.Environment.get("html.xul"))
      {
        styles.display = "block";
      }
      else
      {
        styles.whiteSpace = "nowrap";
        styles[qx.core.Environment.get("css.textoverflow")] = "ellipsis";
      }

      return styles;
    },


    /**
     * Creates a label.
     *
     * The default mode is 'text' which means that the overlapping text is cut off
     * using ellipsis automatically. Text wrapping is disabled in this mode
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

      var el = win.document.createElement("div");

      if (html)
      {
        el.useHtml = true;
      }

      if (!qx.core.Environment.get("css.textoverflow") &&
        qx.core.Environment.get("html.xul"))
      {
        // Gecko as of Firefox 2.x and 3.0 does not support ellipsis
        // for text overflow. We use this feature from XUL instead.
        var xulel = win.document.createElementNS("http://www.mozilla.org/keymaster/gatekeeper/there.is.only.xul", "label");

        var style = xulel.style;
        style.cursor = "inherit";
        style.color = "inherit";
        style.overflow = "hidden";
        style.maxWidth = "100%";
        style.padding = "0";
        style.margin = "0";
        style.width = "auto";

        // Force style inheritance for font styles to omit usage of
        // CSS "label" selector, See bug #1349 for details.
        for (var key in this.__styles) {
          xulel.style[key] = "inherit";
        }

        xulel.setAttribute("crop", "end");

        el.appendChild(xulel);
      }
      else
      {
        qx.bom.element.Style.setStyles(el, this.__getStyles(html));
      }

      if (content) {
        this.setValue(el, content);
      }

      return el;
    },


    /** Sanitizer function */
    __sanitizer : null,


    /**
     * Sets a function to sanitize values. It will be used by {@link #setValue}.
     * The function to sanitize will get the <code>string</code> value and
     * should return a sanitized / cleared <code>string</code>.
     *
     * @param func {Function | null} Function to sanitize / clean HTML code
     *  from given string parameter
     */
    setSanitizer : function(func)
    {
      if (qx.core.Environment.get("qx.debug")) {
        if (func) {
          qx.core.Assert.assertFunction(func);
        }
      }

      qx.bom.Label.__sanitizer = func;
    },


    /**
     * Sets the content of the element.
     *
     * The possibilities of the value depends on the mode
     * defined using {@link #create}.
     *
     * @param element {Element} DOM element to modify.
     * @param value {String} Content to insert.
     */
    setValue : function(element, value)
    {
      value = value || "";

      if (element.useHtml) {
        if (qx.bom.Label.__sanitizer && typeof(qx.bom.Label.__sanitizer) === "function") {
          value = qx.bom.Label.__sanitizer(value);
        }
        element.innerHTML = value;
      } else if (!qx.core.Environment.get("css.textoverflow") &&
        qx.core.Environment.get("html.xul"))
      {
        element.firstChild.setAttribute("value", value);
      } else {
        qx.bom.element.Attribute.set(element, "text", value);
      }
    },


    /**
     * Returns the content of the element.
     *
     * @param element {Element} DOM element to query.
     * @return {String} Content stored in the element.
     */
    getValue : function(element)
    {
      if (element.useHtml) {
        return element.innerHTML;
      } else if (!qx.core.Environment.get("css.textoverflow") &&
        qx.core.Environment.get("html.xul"))
      {
        return element.firstChild.getAttribute("value") || "";
      } else {
        return qx.bom.element.Attribute.get(element, "text");
      }
    },


    /**
     * Returns the preferred dimensions of the given HTML content.
     *
     * @param content {String} The HTML markup to measure
     * @param styles {Map?null} Optional styles to apply
     * @param width {Integer} To support width for height it is possible to limit the width
     * @return {Map} A map with preferred <code>width</code> and <code>height</code>.
     */
    getHtmlSize : function(content, styles, width)
    {
      var element = this._htmlElement || this.__prepareHtml();

      // apply width
      element.style.width = width != undefined ? width + "px" : "auto";
      // insert content
      element.innerHTML = content;

      return this.__measureSize(element, styles);
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

      if (!qx.core.Environment.get("css.textoverflow") &&
        qx.core.Environment.get("html.xul"))
      {
        element.firstChild.setAttribute("value", text);
      } else {
        qx.bom.element.Attribute.set(element, "text", text);
      }

      return this.__measureSize(element, styles);
    },


    /**
     * Measure the size of the given element
     *
     * @param element {Element} The element to measure
     * @param styles {Map?null} Optional styles to apply
     * @return {Map} A map with preferred <code>width</code> and <code>height</code>.
     */
    __measureSize : function(element, styles)
    {
      // sync styles
      var keys = this.__styles;

      if (!styles) {
        styles = {};
      }

      for (var key in keys) {
        element.style[key] = styles[key] || "";
      }

      // detect size
      var size = qx.bom.element.Dimension.getSize(element);

      // all modern browser are needing one more pixel for width
      size.width++;

      return size;
    }
  }
});
