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
     * Martin Wittemann (martinwittemann)
     * Sebastian Werner (wpbasti)
     * Jonathan Rass (jonathan_rass)

************************************************************************ */

/**
 * Basically a text fields which allows a selection from a list of
 * preconfigured options. Allows custom user input. Public API is value
 * oriented.
 *
 * To work with selections without custom input the ideal candidates are
 * the {@link SelectBox} or the {@link RadioGroup}.
 */
qx.Class.define("qx.ui.form.ComboBox",
{
  extend  : qx.ui.form.AbstractSelectBox,
  implement : qx.ui.form.IFormElement,



  /*
  *****************************************************************************
     CONSTRUCTOR
  *****************************************************************************
  */

  construct : function()
  {
    this.base(arguments);

    this._createChildControl("textfield");
    this._createChildControl("button");

    this.addListener("click", this._onClick);
  },



  /*
  *****************************************************************************
     PROPERTIES
  *****************************************************************************
  */

  properties :
  {
    // overridden
    focusable :
    {
      refine : true,
      init : true
    },

    // overridden
    appearance :
    {
      refine : true,
      init : "combobox"
    }
  },



  /*
  *****************************************************************************
     EVENTS
  *****************************************************************************
  */

  events :
  {
    /** The input event is fired on every keystroke modifying the value of the field */
    "input" : "qx.event.type.Data"
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
      WIDGET API
    ---------------------------------------------------------------------------
    */

    // overridden
    _createChildControlImpl : function(id)
    {
      var control;

      switch(id)
      {
        case "textfield":
          control = new qx.ui.form.TextField();
          control.setFocusable(false);
          control.addState("inner");
          control.addListener("changeValue", this._onTextFieldChangeValue, this);
          control.addListener("input", this._onTextFieldInput, this);
          this._add(control, {flex: 1});
          break;

        case "button":
          control = new qx.ui.form.Button();
          control.setFocusable(false);
          control.addState("inner");
          control.addListener("activate", this._onActivateButton, this);
          this._add(control);
          break;
      }

      return control || this.base(arguments, id);
    },


    // overridden
    _forwardStates : {
      focused : true
    },


    // overridden
    tabFocus : function() {
      this._getChildControl("textfield").getFocusElement().focus();
    },


    // interface implementation
    setValue : function(value)
    {
      var textfield = this._getChildControl("textfield");
      if (textfield.getValue() == value) {
        return;
      }

      textfield.setValue(value);

      var list = this._getChildControl("list");
      var item = list.findItem(value);
      if (item) {
        list.select(item);
      } else {
        list.clearSelection();
      }
    },


    // interface implementation
    getValue : function() {
      return this._getChildControl("textfield").getValue();
    },




    /*
    ---------------------------------------------------------------------------
      EVENT LISTENERS
    ---------------------------------------------------------------------------
    */

    /**
     * Toggles the popup's visibility.
     *
     * @param e {qx.event.type.Mouse} Mouse click event
     */
    _onClick : function(e)
    {
      var target = e.getTarget();
      if (target == this._getChildControl("button")) {
        this._togglePopup();
      } else {
        this._hidePopup();
      }
    },


    /**
     * Redirect activation to the main widget
     *
     * @param e {Object} Activation event
     */
    _onActivateButton : function(e)
    {
      this.activate();
      e.stopPropagation();
    },


    // overridden
    _onListChangeSelection : function(e)
    {
      var current = e.getData();
      if (current.length > 0) {
        this.setValue(current[0].getLabel());
      }
    },


    // overridden
    _onListChangeValue : function(e) {
      // empty implementation
    },


    /**
     * Redirects the input event of the textfield to the combobox.
     *
     * @param e {qx.event.type.Data} Input event
     */
    _onTextFieldInput : function(e) {
      this.fireDataEvent("input", e.getData());
    },


    /**
     * Reacts on value changes of the text field and syncs the
     * value to the combobox.
     *
     * @param e {qx.event.type.Data} Change event
     */
    _onTextFieldChangeValue : function(e) {
      this.setValue(e.getData());
    },


    /*
    ---------------------------------------------------------------------------
      TEXTFIELD SELECTION API
    ---------------------------------------------------------------------------
    */

    /**
     * Returns the current selection.
     * This method only works if the widget is already created and
     * added to the document.
     *
     * @type member
     * @return {String|null}
     */
    getSelection : function() {
      return this._getChildControl("textfield").getSelection();
    },


    /**
     * Returns the current selection length.
     * This method only works if the widget is already created and
     * added to the document.
     *
     * @type member
     * @return {Integer|null}
     */
    getSelectionLength : function() {
      return this._getChildControl("textfield").getSelectionLength();
    },


    /**
     * Set the selection to the given start and end (zero-based).
     * If no end value is given the selection will extend to the
     * end of the textfield's content.
     * This method only works if the widget is already created and
     * added to the document.
     *
     * @param start {Integer} start of the selection (zero-based)
     * @param end {Integer} end of the selection
     * @return {void}
     */
    setSelection : function(start, end) {
      this._getChildControl("textfield").setSelection(start, end);
    },


    /**
     * Clears the current selection.
     * This method only works if the widget is already created and
     * added to the document.
     *
     * @return {void}
     */
    clearSelection : function() {
      this._getChildControl("textfield").clearSelection();
    },
    
    
    /**
     * Selects the whole content
     * 
     * @type member
     * @return {void}
     */
    selectAll : function()
    {
      this._getChildControl("textfield").setSelection(0);
    },
  }
});
