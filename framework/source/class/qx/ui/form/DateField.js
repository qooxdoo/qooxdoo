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

************************************************************************ */

/**
 * A *date field* is like a combo box with the date as popup. As button to
 * open the calendeer a calender icon is shown at the right to the textfield.
 *
 * To be conform with all form widgets, the {@link qx.ui.form.IFormElement} interface
 * is implemented.
 *
 * The following example creates a date field and sets the current
 * date as selected.
 *
 * <pre>
 * var dateField = new qx.ui.form.DateField();
 * this.getRoot().add(dateField, {top: 20, left: 20});
 * dateField.setDate(new Date());
 * </pre>
 */
qx.Class.define("qx.ui.form.DateField",
{
  extend  : qx.ui.form.ComboBox,




  /*
  *****************************************************************************
     CONSTRUCTOR
  *****************************************************************************
  */

  construct : function()
  {
    this.base(arguments);

    // create a default date format
    var currentDateFormat = qx.locale.Date.getDateFormat("short").toString();
    this.setDateFormat(new qx.util.format.DateFormat(currentDateFormat));
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
      init : "datefield"
    },

    /** The formater, which convertes the selected date to a string. **/
    dateFormat :
    {
      check : "qx.util.format.DateFormat",
      apply : "_applyDateFormat",
      dispose : true
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
      PUBLIC METHODS
    ---------------------------------------------------------------------------
    */

    /**
     * This method sets the date corresponding to the {@link dateFormat} to the
     * date field. It will also select the date in the calender popup.
     *
     * @param date {Date} The date to set.
     */
    setDate : function(date)
    {
      // set the date to the textfield
      var textField = this._getChildControl("textfield");
      textField.setValue(this.getDateFormat().format(date));

      // set the date in the datechooser
      var dateChooser = this._getChildControl("list");
      dateChooser.setDate(date);
    },


    /**
     * Returns the current set date corresponding to the {@link dateFormat}.
     * If the given text could not be parsed, <code>null</code> will be returned.
     *
     * @return {Date} The currently set date.
     */
    getDate : function()
    {
      // get the value of the textfield
      var textfieldValue = this._getChildControl("textfield").getValue();

      // return the parsed date
      try {
        return this.getDateFormat().parse(textfieldValue);
      } catch (e) {
        return null;
      }
    },


    /**
     * Sets the given value to the textfield. If the value could be
     * a date corresponding to the set {@link dateFormat}, the date is
     * selected in the calender popup.
     *
     * @param value {String} The String value to set.
     */
    setValue : function(value)
    {
      var textfield = this._getChildControl("textfield");
      if (textfield.getValue() == value) {
        return;
      }

      textfield.setValue(value);

      try
      {
        var date = this.getDateFormat().parse(value);
        this._getChildControl("list").setDate(date);
      }
      catch (e)
      {
        // remove the selection of the date chooser
        this._getChildControl("list").resetDate();
      }
    },


    /**
     * Returns the value in the textfield.
     *
     * @return {String} The string value of the textfield.
     */
    getValue : function() {
      return this._getChildControl("textfield").getValue();
    },





    /*
    ---------------------------------------------------------------------------
      PROPERTY APPLY METHODS
    ---------------------------------------------------------------------------
    */

    // property apply routine
    _applyDateFormat : function(value, old)
    {
      // get the date with the old date format
      try
      {
        var textfield = this._getChildControl("textfield");
        var currentDate = old.parse(textfield.getValue());
        textfield.setValue(value.format(currentDate));
      }
      catch (e) {
        // do nothing if the former date could not be parsed
      }
    },




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
        case "list":
          control = new qx.ui.control.DateChooser();
          control.setFocusable(false);
          control.setKeepFocus(true);
          control.addListener("execute", this._onChangeDate, this);
          break;

        case "popup":
          control = new qx.ui.popup.Popup(new qx.ui.layout.VBox);
          control.setAutoHide(false);
          control.add(this._getChildControl("list"));
          control.addListener("mouseup", this._onChangeDate, this);
          control.addListener("changeVisibility", this._onPopupChangeVisibility, this);
          break;
      }

      return control || this.base(arguments, id);
    },




   /*
   ---------------------------------------------------------------------------
     EVENT LISTENERS
   ---------------------------------------------------------------------------
   */

   /**
    * Handler method which handles the click on the calender popup.
    *
    * @param e {qx.event.type.Mouse} The mouse event of the click.
    */
    _onChangeDate : function(e)
    {
      var textField = this._getChildControl("textfield");

      var selectedDate = this._getChildControl("list").getDate();

      textField.setValue(this.getDateFormat().format(selectedDate));
      this.close();
    },


    /**
     * Handler method which hadles the key press. It forwards all key event
     * to the opened date chooser except the escape key event. Escape closes
     * the popup.
     * If the list is clodes, all key events will not be processed further.
     *
     * @param e {qx.event.type.KeyEvent} Keypress event
     */
    _onKeyPress : function(e)
    {
      // get the key identifier
      var iden = e.getKeyIdentifier();
      if (iden == "Down" && e.isAltPressed())
      {
        this.toggle();
        e.stopPropagation();
        return;
      }

      // if the popup is closed, ignore all
      var popup = this._getChildControl("popup");
      if (popup.getVisibility() == "hidden") {
        return;
      }

      // hide the list always on escape
      if (iden == "Escape")
      {
        this.close();
        e.stopPropagation();
        return;
      }

      // Stop navigation keys when popup is open
      if (iden === "Left" || iden === "Right" || iden === "Down" || iden === "Up") {
        e.preventDefault();
      }

      // forward the rest of the events to the date chooser
      this._getChildControl("list").handleKeyPress(e);
    },


    // overridden
    _onPopupChangeVisibility : function(e)
    {
      // Synchronize the chooser with the current value on every
      // opening of the popup. This is needed when the value has been
      // modified and not saved yet (e.g. no blur)
      var popup = this._getChildControl("popup");
      if (popup.isVisible())
      {

        this.__initialAfterOpen = true;
        var chooser = this._getChildControl("list");
        var date = this.getDate();
        chooser.setDate(date);
      }
    },


    /**
     * Reacts on value changes of the text field and syncs the
     * value to the combobox.
     *
     * @param e {qx.event.type.Data} Change event
     */
    _onTextFieldChangeValue : function(e)
    {
      // Apply to popup
      var date = this.getDate();
      if (date != null)
      {
        var list = this._getChildControl("list");
        list.setDate(date);
      }

      // Fire event
      this.fireDataEvent("changeValue", e.getData());
    }
  }
});
