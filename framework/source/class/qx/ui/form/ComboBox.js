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
     * Jonathan Weiß (jonathan_rass)

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
  implement : [
    qx.ui.form.IFormElement,
    qx.ui.form.IStringForm
  ],



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
    },

    /**
     * Formatter to format <code>TextField</code> value when <code>ListItem</code>
     * is selected. Uses the default formatter {@link qx.ui.form.ComboBox#__defaultFormat}.
     */
    format :
    {
      check : "Function",
      init : function(item) {
        return this.__defaultFormat(item);
      },
      nullable : true
    },
    
    /**
     * Set the <code>TextField</code> with the value from the firt item if the
     * property is set to <code>true</code>, otherwise the <code>TextField</code>
     * is empty. 
     */
    selectFirstItem :
    {
      check : "Boolean",
      init : true 
    }
  },



  /*
  *****************************************************************************
     EVENTS
  *****************************************************************************
  */

  events :
  {
    /** The input event is fired on every keystroke modifying the value of the field 
     *  
     *  Event data: The new text value of the field.
     */
    "input" : "qx.event.type.Data",

    /** Whenever the value is changed this event is fired 
     * 
     *  Event data: The new text value of the field.
     */
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
          // @deprecated: remove the input event listener
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
          
        case "list":
          // Get the list from the AbstractSelectBox
          control = this.base(arguments, id)

          // Change selection mode
          control.setSelectionMode("single");
          this.addListener("appear", this._onAppear);
          break;
      }

      return control || this.base(arguments, id);
    },


    // overridden
    /**
     * @lint ignoreReferenceField(_forwardStates) 
     */
    _forwardStates : {
      focused : true
    },


    // overridden
    tabFocus : function()
    {
      var field = this.getChildControl("textfield");

      field.getFocusElement().focus();
      field.selectAll();
    },


    // interface implementation
    setValue : function(value)
    {
      // handle null values
      if (value === null) {
        value = "";
      }
      
      var textfield = this.getChildControl("textfield");
      if (textfield.getValue() == value) {
        return;
      }

      // Apply to text field
      textfield.setValue(value);

      // Sync to list
      var list = this.getChildControl("list");
      var item = list.findItem(value);
      if (item) {
        list.setSelection([item]);
      } else {
        list.resetSelection();
      }
    },


    // interface implementation
    getValue : function() {
      return this.getChildControl("textfield").getValue();
    },


    // interface implementation    
    resetValue : function() {
      this.getChildControl("textfield").setValue("");
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
        this.getChildControl("button").addState("selected");
        this.focus();
      }
    },


    // overridden
    _onKeyPress : function(e)
    {
      var popup = this.getChildControl("popup");
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
      if (target == this.getChildControl("button")) {
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
        var label = this.__preSelectedItem.getLabel();

        if (this.getFormat()!= null) {
          label = this.getFormat().call(this, this.__preSelectedItem);
        }

        this.setValue(label);
        this.__preSelectedItem = null;
      }
    },


    // overridden
    _onListChangeSelection : function(e)
    {
      var current = e.getData();
      if (current.length > 0)
      {
        // Ignore quick context (e.g. mouseover)
        // and configure the new value when closing the popup afterwards
        var list = this.getChildControl("list");
        if (list.getSelectionContext() == "quick")
        {
          this.__preSelectedItem = current[0];
        }
        else
        {
          var label = current[0].getLabel();

          if (this.getFormat()!= null) {
            label = this.getFormat().call(this, current[0]);
          }

          this.setValue(label);
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
      var popup = this.getChildControl("popup");
      if (popup.isVisible())
      {
        var list = this.getChildControl("list");
        var value = this.getValue();
        
        list.setSelection([list.findItem(value)]);
      }
      else
      {
        // When closing the popup text should selected and field should
        // have the focus. Identical to when reaching the field using the TAB key.
        this.tabFocus();
      }

      // In all cases: Remove focused state from button
      this.getChildControl("button").removeState("selected");
    },


    /**
     * Redirects the input event of the textfield to the combobox.
     *
     * @param e {qx.event.type.Data} Input event
     * @deprecated
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
      var list = this.getChildControl("list");
      var item = list.findItem(value);
      if (item) {
        list.setSelection([item]);
      } else {
        list.resetSelection();
      }

      // Fire event
      this.fireDataEvent("changeValue", value, e.getOldData());
    },
    
    /**
     * Initialize the <code>TextField</code> with the value of the first item, 
     * if the property {@link #selectFirstItem} is set to <code>true</code>.
     * 
     * @param e {qx.event.type.Event} Appear event
     */
    _onAppear : function (e)
    {
      if (!this.isSelectFirstItem()) {
        return;
      }
      
      var list = this.getChildControl("list");
      var firstItem = list.getSelectables()[0];
    
      if (firstItem && list.isSelectionEmpty())
      {
        list.setSelection([firstItem]);
      }
    },
    
    /*
    ---------------------------------------------------------------------------
      FORMAT HANDLING
    ---------------------------------------------------------------------------
    */
    /**
     * Return the formatted label text from the <code>ListItem</code>.
     * The formatter removes all HTML tags and converts all HTML entities
     * to string characters when the rich property is <code>true</code>.
     *
     * @param item {ListItem} The list item to format.
     * @return {String} The formatted text.
     */
    __defaultFormat : function(item)
    {
      var valueLabel = item ? item.getLabel() : "";
      var rich = item ? item.getRich() : false; 
      
      if (rich) {
        valueLabel = valueLabel.replace(/<[^>]+?>/g, "");
        valueLabel = qx.bom.String.unescape(valueLabel);
      }

      return valueLabel;
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
      return this.getChildControl("textfield").getSelection();
    },


    /**
     * Returns the current selection length.
     * This method only works if the widget is already created and
     * added to the document.
     *
     * @return {Integer|null}
     */
    getSelectionLength : function() {
      return this.getChildControl("textfield").getSelectionLength();
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
      this.getChildControl("textfield").setSelection(start, end);
    },


    /**
     * Clears the current selection.
     * This method only works if the widget is already created and
     * added to the document.
     *
     * @return {void}
     */
    clearSelection : function() {
      this.getChildControl("textfield").clearSelection();
    },


    /**
     * Selects the whole content
     *
     * @return {void}
     */
    selectAll : function() {
      this.getChildControl("textfield").selectAll();
    }
  }
});
