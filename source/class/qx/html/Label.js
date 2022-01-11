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

************************************************************************ */

/**
 * A cross browser label instance with support for rich HTML and text labels.
 *
 * Text labels supports ellipsis to reduce the text width.
 *
 * The mode can be changed through the method {@link #setRich}
 * which accepts a boolean value. The default mode is "text" which is
 * a good choice because it has a better performance.
 */
qx.Class.define("qx.html.Label", {
  extend: qx.html.Element,

  /**
   * Creates a new Image
   *
   * @see constructor for {Element}
   */
  construct(tagName, styles, attributes) {
    super(tagName, styles, attributes);
    this.registerProperty("value", null, this._setValueProperty);
  },

  /*
  *****************************************************************************
     MEMBERS
  *****************************************************************************
  */

  members: {
    __rich: null,

    /*
    ---------------------------------------------------------------------------
      ELEMENT API
    ---------------------------------------------------------------------------
    */

    /**
     * Implementation of setter for the "value" property
     *
     * @param value {String?} value to set
     */
    _setValueProperty(value) {
      var element = this.getDomElement();
      qx.bom.Label.setValue(element, value);
    },

    // overridden
    _createDomElement() {
      var rich = this.__rich;
      var el = qx.bom.Label.create(this._content, rich);
      el.style.overflow = "hidden";
      return el;
    },

    // overridden
    // be sure that style attributes are merged and not overwritten
    _copyData(fromMarkup, propertiesFromDom) {
      return super._copyData(true, propertiesFromDom);
    },

    /*
    ---------------------------------------------------------------------------
      LABEL API
    ---------------------------------------------------------------------------
    */

    /**
     * Toggles between rich HTML mode and pure text mode.
     *
     * @param value {Boolean} Whether the HTML mode should be used.
     * @return {qx.html.Label} This instance for chaining support.
     */
    setRich(value) {
      var element = this.getDomElement();

      if (element) {
        throw new Error(
          "The label mode cannot be modified after initial creation"
        );
      }

      value = !!value;

      if (this.__rich == value) {
        return this;
      }

      this.__rich = value;
      return this;
    },

    /**
     * Sets the HTML/text content depending on the content mode.
     *
     * @param value {String} The content to be used.
     * @return {qx.html.Label} This instance for for chaining support.
     */
    setValue(value) {
      this._setProperty("value", value);
      return this;
    },

    /**
     * Get the current content.
     *
     * @return {String} The labels's content
     */
    getValue() {
      return this._getProperty("value");
    },

    /**
     * Reset the current content
     *
     * @return {qx.html.Label} This instance for for chaining support.
     */
    resetValue() {
      return this._removeProperty("value");
    }
  }
});
