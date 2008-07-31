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

    var curerntDateFormat = qx.locale.Date.getDateFormat("short").toString();
    this.setDateFormat(new qx.util.format.DateFormat(curerntDateFormat));
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

  members :
  {
    
    setDate : function(date) {
      // set the date to the textfield
      var textField = this._getChildControl("textfield");
      textField.setValue(this.getDateFormat().format(date));
      // set the date in the datechooser
      var dateChooser = this._getChildControl("list");
      dateChooser.setDate(date);
    },
    
    
    getDate : function() {
      // get the value of the textfield
      var textfieldValue = this._getChildControl("textfield").getValue();

      try {
        // return the parsed date
        return this.getDateFormat().parse(textfieldValue);        
      } catch (e) {
        // if the text could not be parsed, null will be returned
        return null;        
      }      
    },   
    
    
    // apply method
    _applyDateFormat : function(value, old) {
      // get the date with the old date format
      try {
        var textfield = this._getChildControl("textfield");
        var currentDate = old.parse(textfield.getValue());
        textfield.setValue(value.format(currentDate));                
      } catch (e) {
        // do nothing if the former date could not be parsed        
      }
    },
    
    
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
          control.addListener("activate", this._onActivateList, this);
          control.addListener("mouseup", this._onChangeDate, this);
          break;          
      }

      return control || this.base(arguments, id);
    },
    
    
    _onChangeDate : function(e) {     
      var textField = this._getChildControl("textfield");      
      var selectedDate = this._getChildControl("list").getDate();
      
      textField.setValue(this.getDateFormat().format(selectedDate));
      this.close();
    }, 
    
    
    // interface implementation
    setValue : function(value)
    {
      var textfield = this._getChildControl("textfield");
      if (textfield.getValue() == value) {
        return;
      }

      textfield.setValue(value);
      
      try {
        var date = this.getDateFormat().parse(value);
        this._getChildControl("list").setDate(date);
      } catch (e) {
        // remove the selection of the date chooser
        this._getChildControl("list").setDate(null);        
      }     
    },


    // interface implementation
    getValue : function() {
      return this._getChildControl("textfield").getValue();
    },

    
    _onKeyPress : function(e)
    {
      // if the popup is closed, ignore all 
      var popup = this._getChildControl("popup");
      if (popup.getVisibility() == "hidden") {
        return;
      }
      
      // get the key identifier
      var identifier = e.getKeyIdentifier();

      // hide the list always on escape
      if (identifier == "Escape")
      {
        this.close();
        e.stopPropagation();
        return;
      }
      
      // forward the rest of the events to the list
      this._getChildControl("list").handleKeyPress(e);
    }
  }
});
