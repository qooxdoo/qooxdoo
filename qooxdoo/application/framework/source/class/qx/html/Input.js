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
     * Fabian Jakobs (fjakobs)

************************************************************************ */

/**
 * A Input wrap any valid HTML input element and make it accessible
 * through the normalized qooxdoo element interface.
 */
qx.Class.define("qx.html.Input",
{
  extend : qx.html.Element,



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
   */
  construct : function(type)
  {
    this.base(arguments);

    this.__type = type;

    // Update node name correctly
    if (type === "select" || type === "textarea") {
      this._nodeName = type;
    } else {
      this._nodeName = "input";
    }
  },




  /*
  *****************************************************************************
     MEMBERS
  *****************************************************************************
  */

  members :
  {
    /*
    ---------------------------------------------------------------------------
      ELEMENT API
    ---------------------------------------------------------------------------
    */

    // overridden
    _createDomElement : function() {
      return qx.bom.Input.create(this.__type);
    },


    // overridden
    _applyProperty : function(name, value)
    {
      this.base(arguments, name, value);

      if (name === "value") {
        qx.bom.Input.setValue(this._element, value);
      } else if (name === "wrap") {
        qx.bom.Input.setWrap(this._element, value);
      }
    },





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
    setValue : function(value)
    {
      if (this._element)
      {
        // Do not overwrite when already correct (on input events)
        // This is needed to keep caret position while typing.
        if (this._element.value != value) {
          qx.bom.Input.setValue(this._element, value);
        }
      }
      else
      {
        this._setProperty("value", value);
      }

      return this;
    },


    /**
     * Get the current value.
     *
     * @return {String} The element's current value.
     */
    getValue : function()
    {
      if (this._element) {
        return qx.bom.Input.getValue(this._element);
      }

      return this._getProperty("value") || "";
    },


    /**
     * Sets the text wrap behaviour of a text area element.
     *
     * This property uses the style property "wrap" (IE) respectively "whiteSpace"
     *
     * @param wrap {Boolean} Whether to turn text wrap on or off.
     * @return {qx.html.Input} This instance for for chaining support.
     */
    setWrap : function(wrap)
    {
      if (this.__type === "textarea") {
        this._setProperty("wrap", wrap);
      } else {
        throw new Error("Text wrapping is only support by textareas!");
      }

      return this;
    },


    /**
     * Gets the text wrap behaviour of a text area element.
     *
     * This property uses the style property "wrap" (IE) respectively "whiteSpace"
     *
     * @return {Boolean} Whether wrapping is enabled or disabled.
     */
    getWrap : function()
    {
      if (this.__type === "textarea") {
        return this._getProperty("wrap");
      } else {
        throw new Error("Text wrapping is only support by textareas!");
      }
    }
  }
});