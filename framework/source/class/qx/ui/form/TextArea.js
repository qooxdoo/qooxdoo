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
    maxLength :
    {
      check : "PositiveInteger",
      init : Infinity,
      apply : "_applyMaxLength"
    }
  },




  /*
  *****************************************************************************
     MEMBERS
  *****************************************************************************
  */

  members :
  {
    /**
      * {Boolean} Flag indicating whether listeneres for input and changeValue
      * are attachted.
      */
    __listeneresAttached : false,
    
    /*
    ---------------------------------------------------------------------------
      TEXTFIELD VALUE API
    ---------------------------------------------------------------------------
    */

    // overridden
    setValue : function(value)
    {
      if (qx.lang.Type.isString(value) && value.length < this.getMaxLength()) {
        this.base(arguments, value);
      } else {
        this.getContentElement().setValue(value.substr(0, this.getMaxLength()));
      }
    },    
    
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

    // property apply
    _applyWrap : function(value, old) {
      this.getContentElement().setWrap(value);
    },

    // property apply
    _applyMaxLength : function(value, old)
    {
      if (value == Infinity)
      {
        this.removeListener("input", this._processValue, this);
        this.removeListener("changeValue", this._processValue, this);
        this.__listeneresAttached = false;
      }
      else if (!this.__listeneresAttached)
      {
        this.addListener("input", this._processValue, this);
        this.addListener("changeValue", this._processValue, this);
        this.__listeneresAttached = true;
      }
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
      INTERNALS
    ---------------------------------------------------------------------------
    */


    /**
     * Trims the incoming value according to the maxLength propery, if needed.
     *
     * @param e {qx.event.type.Data} Incoming data event
     */
    _processValue : function(e)
    {
      var value = e.getData();
      var maxLength = this.getMaxLength();
      if (value.length > maxLength) {
        value = value.substr(0, maxLength);
      }

      this.setValue(value);
    }

  }
});
