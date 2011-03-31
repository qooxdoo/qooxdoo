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
 * open the calendar a calendar icon is shown at the right to the textfield.
 *
 * To be conform with all form widgets, the {@link qx.ui.form.IForm} interface
 * is implemented.
 *
 * The following example creates a date field and sets the current
 * date as selected.
 *
 * <pre class='javascript'>
 * var dateField = new qx.ui.form.DateField();
 * this.getRoot().add(dateField, {top: 20, left: 20});
 * dateField.setValue(new Date());
 * </pre>
 *
 * @childControl list {qx.ui.control.DateChooser} date chooser component
 * @childControl popup {qx.ui.popup.Popup} popup which shows the list control
 */
qx.Class.define("qx.ui.form.DateField",
{
  extend : qx.ui.form.ComboBox,
  implement : [qx.ui.form.IDateForm],



  /*
  *****************************************************************************
     CONSTRUCTOR
  *****************************************************************************
  */

  construct : function()
  {
    this.base(arguments);

    // create a default date format
    this.setDateFormat(qx.ui.form.DateField.getDefaultDateFormatter());

    // listen for locale changes
    if (qx.core.Environment.get("qx.dynlocale"))
    {
      this.__localeListenerId =
        qx.locale.Manager.getInstance().addListener("changeLocale", function() {
          this.setDateFormat(qx.ui.form.DateField.getDefaultDateFormatter());
        }, this);
    }
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

    /** The formatter, which converts the selected date to a string. **/
    dateFormat :
    {
      check : "qx.util.format.DateFormat",
      apply : "_applyDateFormat"
    }
  },




  /*
  *****************************************************************************
     MEMBERS
  *****************************************************************************
  */

  statics :
  {
    __dateFormat : null,
    __formatter : null,

    /**
     * Get the shared default date formatter
     *
     * @return {qx.util.format.DateFormat} The shared date formatter
     */
    getDefaultDateFormatter : function()
    {
      var format = qx.locale.Date.getDateFormat("medium").toString();

      if (format == this.__dateFormat) {
        return this.__formatter;
      }

      if (this.__formatter) {
        this.__formatter.dispose();
      }

      this.__formatter = new qx.util.format.DateFormat(format, qx.locale.Manager.getInstance().getLocale());
      this.__dateFormat = format;

      return this.__formatter;
    }
  },




  /*
  *****************************************************************************
     MEMBERS
  *****************************************************************************
  */

  members :
  {
    __localeListenerId : null,

    /*
    ---------------------------------------------------------------------------
      PUBLIC METHODS
    ---------------------------------------------------------------------------
    */


    /**
    * This method sets the date corresponding to the {@link #dateFormat} to the
    * date field. It will also select the date in the calendar popup.
    *
    * @param value {Date} The date to set.
     */
    setValue : function(value)
    {
      // set the date to the textfield
      var textField = this.getChildControl("textfield");
      textField.setValue(this.getDateFormat().format(value));

      // set the date in the datechooser
      var dateChooser = this.getChildControl("list");
      dateChooser.setValue(value);
    },


    /**
     * Returns the current set date corresponding to the {@link #dateFormat}.
     * If the given text could not be parsed, <code>null</code> will be returned.
     *
     * @return {Date} The currently set date.
     */
    getValue : function()
    {
      // get the value of the textfield
      var textfieldValue = this.getChildControl("textfield").getValue();

      // return the parsed date
      try {
        return this.getDateFormat().parse(textfieldValue);
      } catch (ex) {
        return null;
      }
    },


    /**
     * Resets the DateField. The textfield will be empty and the datechooser
     * will also have no selection.
     */
    resetValue: function()
    {
      // set the date to the textfield
      var textField = this.getChildControl("textfield");
      textField.setValue("");

      // set the date in the datechooser
      var dateChooser = this.getChildControl("list");
      dateChooser.setValue(null);
    },


    /*
    ---------------------------------------------------------------------------
      PROPERTY APPLY METHODS
    ---------------------------------------------------------------------------
    */

    // property apply routine
    _applyDateFormat : function(value, old)
    {
      // if old is undefined or null do nothing
      if (!old) {
        return;
      }

      // get the date with the old date format
      try
      {
        var textfield = this.getChildControl("textfield");
        var dateStr = textfield.getValue();
        var currentDate = old.parse(dateStr);
        textfield.setValue(value.format(currentDate));
      }
      catch (ex) {
        // do nothing if the former date could not be parsed
      }
    },




    /*
    ---------------------------------------------------------------------------
      WIDGET API
    ---------------------------------------------------------------------------
    */

    // overridden
    _createChildControlImpl : function(id, hash)
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
          control.add(this.getChildControl("list"));
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
      var textField = this.getChildControl("textfield");

      var selectedDate = this.getChildControl("list").getValue();

      textField.setValue(this.getDateFormat().format(selectedDate));
      this.close();
    },


    /**
     * Handler method which handles the key press. It forwards all key event
     * to the opened date chooser except the escape key event. Escape closes
     * the popup.
     * If the list is cloned, all key events will not be processed further.
     *
     * @param e {qx.event.type.KeySequence} Keypress event
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
      var popup = this.getChildControl("popup");
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
      this.getChildControl("list").handleKeyPress(e);
    },


    // overridden
    _onPopupChangeVisibility : function(e)
    {
      // Synchronize the chooser with the current value on every
      // opening of the popup. This is needed when the value has been
      // modified and not saved yet (e.g. no blur)
      var popup = this.getChildControl("popup");
      if (popup.isVisible())
      {
        var chooser = this.getChildControl("list");
        var date = this.getValue();
        chooser.setValue(date);
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
      var date = this.getValue();
      if (date != null)
      {
        var list = this.getChildControl("list");
        list.setValue(date);
      }

      // Fire event
      this.fireDataEvent("changeValue", this.getValue());
    },


    /**
     * Checks if the textfield of the DateField is empty.
     *
     * @return {Boolean} True, if the textfield of the DateField is empty.
     */
    isEmpty: function()
    {
      var value = this.getChildControl("textfield").getValue();
      return value == null || value == "";
    }
  },


  destruct : function() {
    // listen for locale changes
    if (qx.core.Environment.get("qx.dynlocale"))
    {
      if (this.__localeListenerId) {
        this.removeListenerById(this.__localeListenerId);
      }
    }
  }
});
