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
    this.addListener("keydown", this._onKeyDown);
  },



  /*
  *****************************************************************************
     PROPERTIES
  *****************************************************************************
  */

  properties :
  {
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
    "input" : "qx.event.type.Data",

    /** Whenever the value is changed this event is fired */
    "changeValue" : "qx.event.type.Data"
  },




  /*
  *****************************************************************************
     MEMBERS
  *****************************************************************************
  */

  members :
  {
    __preSelectedItem : null,



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
          control.addListener("blur", this.close, this);
          this._add(control, {flex: 1});
          break;

        case "button":
          control = new qx.ui.form.Button();
          control.setFocusable(false);
          control.setKeepActive(true);
          control.addState("inner");
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
    tabFocus : function()
    {
      var field = this._getChildControl("textfield");

      field.getFocusElement().focus();
      field.selectAll();
    },


    // interface implementation
    setValue : function(value)
    {
      var textfield = this._getChildControl("textfield");
      if (textfield.getValue() == value) {
        return;
      }

      // Apply to text field
      textfield.setValue(value);

      // Sync to list
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
     * Event listener for <code>keydown</code> event.
     *
     * @param e {qx.event.type.KeySequence} Key event
     */
    _onKeyDown : function(e)
    {
      if (e.isAltPressed())
      {
        this._getChildControl("button").addState("selected");
        this.focus();
      }
    },


    // overridden
    _onKeyPress : function(e)
    {
      var popup = this._getChildControl("popup");
      var iden = e.getKeyIdentifier();

      if (iden == "Down" && e.isAltPressed())
      {
        this.toggle();
        e.stopPropagation();
      }
      else if (iden == "Enter")
      {
        if (popup.isVisible())
        {
          this.close();
          e.stop();
        }
      }
      else if (popup.isVisible())
      {
        this.base(arguments, e);
      }
    },


    /**
     * Toggles the popup's visibility.
     *
     * @param e {qx.event.type.Mouse} Mouse click event
     */
    _onClick : function(e)
    {
      var target = e.getTarget();
      if (target == this._getChildControl("button")) {
        this.toggle();
      } else {
        this.close();
      }
    },


    // overridden
    _onListMouseDown : function(e)
    {
      // Apply pre-selected item (translate quick selection to real selection)
      if (this.__preSelectedItem)
      {
        this.setValue(this.__preSelectedItem.getLabel());
        this.__preSelectedItem = null;
      }
    },


    // overridden
    _onListChangeSelection : function(e)
    {
      if (this.__initialAfterOpen)
      {
        delete this.__initialAfterOpen;
        return;
      }

      var current = e.getData();
      if (current.length > 0)
      {
        // Ignore quick context (e.g. mouseover)
        // and configure the new value when closing the popup afterwards
        var list = this._getChildControl("list");
        if (list.getSelectionContext() == "quick")
        {
          this.__preSelectedItem = current[0];
        }
        else
        {
          this.setValue(current[0].getLabel());
          this.__preSelectedItem = null;
        }
      }
    },


    // overridden
    _onPopupChangeVisibility : function(e)
    {
      // Synchronize the list with the current value on every
      // opening of the popup. This is useful because through
      // the quick selection mode, the list may keep an invalid
      // selection on close or the user may enter text while
      // the combobox is closed and reopen it afterwards.
      var popup = this._getChildControl("popup");
      if (popup.isVisible())
      {
        this.__initialAfterOpen = true;
        var list = this._getChildControl("list");
        list.setValue(this.getValue());
      }
      else
      {
        // When closing the popup text should selected and field should
        // have the focus. Identical to when reaching the field using the TAB key.
        this.tabFocus();
      }

      // In all cases: Remove focused state from button
      this._getChildControl("button").removeState("selected");
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
    _onTextFieldChangeValue : function(e)
    {
      var value = e.getData();

      // Select item when possible
      var list = this._getChildControl("list");
      var item = list.findItem(value);
      if (item) {
        list.select(item);
      } else {
        list.clearSelection();
      }

      // Fire event
      this.fireDataEvent("changeValue", value);
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
     * @return {void}
     */
    selectAll : function() {
      this._getChildControl("textfield").selectAll();
    }
  }
});
