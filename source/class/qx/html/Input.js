/* ************************************************************************

   qooxdoo - the new era of web development

   http://qooxdoo.org

   Copyright:
     2004-2008 1&1 Internet AG, Germany, http://www.1und1.de

   License:
     MIT: https://opensource.org/licenses/MIT
     See the LICENSE file in the project's top-level directory for details.

   Authors:
     * Fabian Jakobs (fjakobs)

************************************************************************ */

/**
 * A Input wrap any valid HTML input element and make it accessible
 * through the normalized qooxdoo element interface.
 */
qx.Class.define("qx.html.Input", {
  extend: qx.html.Element,

  /*
  *****************************************************************************
     CONSTRUCTOR
  *****************************************************************************
  */

  /**
   * @param type {String} The type of the input field. Valid values are
   *   <code>text</code>, <code>textarea</code>, <code>select</code>,
   *   <code>checkbox</code>, <code>radio</code>, <code>password</code>,
   *   <code>hidden</code>, <code>submit</code>, <code>image</code>,
   *   <code>file</code>, <code>search</code>, <code>reset</code>,
   *   <code>select</code> and <code>textarea</code>.
   * @param styles {Map?null} optional map of CSS styles, where the key is the name
   *    of the style and the value is the value to use.
   * @param attributes {Map?null} optional map of element attributes, where the
   *    key is the name of the attribute and the value is the value to use.
   */
  construct(type, styles, attributes) {
    // Update node name correctly
    if (type === "select" || type === "textarea") {
      var nodeName = type;
    } else {
      nodeName = "input";
    }

    super(nodeName, styles, attributes);

    this.__type = type;

    this.registerProperty(
      "value",
      this._getValueProperty,
      this._setValueProperty
    );

    this.registerProperty("wrap", null, this._setWrapProperty);
  },

  /*
  *****************************************************************************
     MEMBERS
  *****************************************************************************
  */

  members: {
    __type: null,
    // used for webkit only
    __selectable: null,
    __enabled: null,

    /*
    ---------------------------------------------------------------------------
      ELEMENT API
    ---------------------------------------------------------------------------
    */

    _useNodeImpl(domNode, newChildren) {
      super._useNodeImpl(domNode, newChildren);
    },

    //overridden
    _createDomElement() {
      return qx.bom.Input.create(this.__type);
    },

    /**
     * Implementation of setter for the "value" property
     *
     * @param value {String?} value to set
     */
    _setValueProperty(value) {
      var element = this.getDomElement();
      qx.bom.Input.setValue(element, value);
    },

    /**
     * Implementation of getter for the "value" property
     *
     * @return {String?} value on the dom
     */
    _getValueProperty() {
      var element = this.getDomElement();
      var value = qx.bom.Input.getValue(element);
      return value;
    },

    /**
     * Implementation of setter for the "wrap" property
     *
     * @param value {String?} value to set
     */
    _setWrapProperty(value) {
      var element = this.getDomElement();
      qx.bom.Input.setWrap(element, value);

      // qx.bom.Input#setWrap has the side-effect that the CSS property
      // overflow is set via DOM methods, causing queue and DOM to get
      // out of sync. Mirror all overflow properties to handle the case
      // when group and x/y property differ.
      this.setStyle("overflow", element.style.overflow, true);
      this.setStyle("overflowX", element.style.overflowX, true);
      this.setStyle("overflowY", element.style.overflowY, true);
    },

    /**
     * Set the input element enabled / disabled.
     * Webkit needs a special treatment because the set color of the input
     * field changes automatically. Therefore, we use
     * <code>-webkit-user-modify: read-only</code> and
     * <code>-webkit-user-select: none</code>
     * for disabling the fields in webkit. All other browsers use the disabled
     * attribute.
     *
     * @param value {Boolean} true, if the input element should be enabled.
     */
    setEnabled(value) {
      this.__enabled = value;

      this.setAttribute("disabled", value === false);

      if (qx.core.Environment.get("engine.name") == "webkit") {
        if (!value) {
          this.setStyles({
            userModify: "read-only",
            userSelect: "none"
          });
        } else {
          this.setStyles({
            userModify: null,
            userSelect: this.__selectable ? null : "none"
          });
        }
      }
    },

    /**
     * Set whether the element is selectable. It uses the qooxdoo attribute
     * qxSelectable with the values 'on' or 'off'.
     * In webkit, a special css property will be used and checks for the
     * enabled state.
     *
     * @param value {Boolean} True, if the element should be selectable.
     */
    setSelectable: qx.core.Environment.select("engine.name", {
      webkit(value) {
        this.__selectable = value;

        // Only apply the value when it is enabled
        super.webkit(this.__enabled && value);
      },

      default(value) {
        super.default(value);
      }
    }),

    /*
    ---------------------------------------------------------------------------
      INPUT API
    ---------------------------------------------------------------------------
    */

    /**
     * Sets the value of the input element.
     *
     * @param value {var} the new value
     * @return {qx.html.Input} This instance for for chaining support.
     */
    setValue(value) {
      var element = this.getDomElement();

      if (element) {
        // Do not overwrite when already correct (on input events)
        // This is needed to keep caret position while typing.
        if (element.value != value) {
          qx.bom.Input.setValue(element, value);
        }
      } else {
        this._setProperty("value", value);
      }

      return this;
    },

    /**
     * Get the current value.
     *
     * @return {String} The element's current value.
     */
    getValue() {
      var element = this.getDomElement();

      if (element) {
        return qx.bom.Input.getValue(element);
      }

      return this._getProperty("value") || "";
    },

    /**
     * Sets the text wrap behavior of a text area element.
     *
     * This property uses the style property "wrap" (IE) respectively "whiteSpace"
     *
     * @param wrap {Boolean} Whether to turn text wrap on or off.
     * @param direct {Boolean?false} Whether the execution should be made
     *  directly when possible
     * @return {qx.html.Input} This instance for for chaining support.
     */
    setWrap(wrap, direct) {
      if (this.__type === "textarea") {
        this._setProperty("wrap", wrap, direct);
      } else {
        throw new Error("Text wrapping is only support by textareas!");
      }

      return this;
    },

    /**
     * Gets the text wrap behavior of a text area element.
     *
     * This property uses the style property "wrap" (IE) respectively "whiteSpace"
     *
     * @return {Boolean} Whether wrapping is enabled or disabled.
     */
    getWrap() {
      if (this.__type === "textarea") {
        return this._getProperty("wrap");
      } else {
        throw new Error("Text wrapping is only support by textareas!");
      }
    }
  }
});
