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
     * Andreas Ecker (ecker)
     * Jonathan Weiß (jonathan_rass)

************************************************************************ */

/**
 * The TextField is a multi-line text input field.
 */
qx.Class.define("qx.ui.form.TextArea",
{
  extend : qx.ui.form.AbstractField,



  /*
  *****************************************************************************
     CONSTRUCTOR
  *****************************************************************************
  */

  /**
   * @param value {String?""} The text area's initial value
   */
  construct : function(value)
  {
    this.base(arguments, value);
    this.initWrap();
    this.addListener("keyup", this._onkeyup, this);
    this.addListener("changeValue", this._onChangeValue, this);
  },




  /*
  *****************************************************************************
     PROPERTIES
  *****************************************************************************
  */

  properties :
  {
    /** Controls whether text wrap is activated or not. */
    wrap :
    {
      check : "Boolean",
      init : true,
      apply : "_applyWrap"
    },

    // overridden
    appearance :
    {
      refine : true,
      init : "textarea"
    },

    /** Maximal number of characters that can be entered in the TextArea. */
    maxlength :
    {
      check : "PositiveInteger",
      init : Infinity
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
      FIELD API
    ---------------------------------------------------------------------------
    */

    // overridden
    _createInputElement : function() {
      return new qx.html.Input("textarea");
    },




    /*
    ---------------------------------------------------------------------------
      APPLY ROUTINES
    ---------------------------------------------------------------------------
    */

    // overridden
    _applyWrap : function(value, old) {
      this.getContentElement().setWrap(value);
    },

    /*
    ---------------------------------------------------------------------------
      LAYOUT
    ---------------------------------------------------------------------------
    */

    // overridden
    _getContentHint : function()
    {
      var hint = this.base(arguments);

      // four lines of text by default
      hint.height = hint.height * 4;

      // 20 character wide
      hint.width = this._getTextSize().width * 20;

      return hint;
    },

    /*
    ---------------------------------------------------------------------------
      EVENT HANDLER
    ---------------------------------------------------------------------------
    */

    /**
     * Event listener for the <code>keyup</code> event of the TextArea.
     *
     * @param e {qx.event.type.KeySequence} Event object
     */
    _onkeyup : function(e) {
      this.setValue(this.__trim(this.getValue()));
    },

    /**
     * Event listener for the <code>changeValue</code> event of the TextArea.
     *
     * @param e {qx.event.type.Data} Incoming data event
     */
    _onChangeValue : function(e) {
      this.setValue(this.__trim(e.getData()));
    },
    
    /*
    ---------------------------------------------------------------------------
      INTERNALS
    ---------------------------------------------------------------------------
    */

    /**
     * Trims the incoming value according to the maxlength.
     *
     * @internal
     * @param value {String} Incoming string value.
     * @return {String} The trimmed string.
     */
    __trim : function(value)
    {
      var maxLength = this.getMaxlength();
      if (value.length > maxLength) {
        value = value.substr(0, maxLength);
      }
      return value;
    }


  }
});
