/* ************************************************************************

   qooxdoo - the new era of web development

   http://qooxdoo.org

   Copyright:
     2004-2009 1&1 Internet AG, Germany, http://www.1und1.de

   License:
     LGPL: http://www.gnu.org/licenses/lgpl.html
     EPL: http://www.eclipse.org/org/documents/epl-v10.php
     See the LICENSE file in the project's top-level directory for details.

   Authors:
     * Martin Wittemann (martinwittemann)

************************************************************************ */
qx.Class.define("qx.ui.form.Manager", 
{
  extend : qx.core.Object,

  construct : function()
  {
    this.base(arguments);
    
    this.__formItems = [];
  },
  
  
  events : 
  {
    "changeValid" : "qx.event.type.Data"
  },
  
  
  properties : 
  {
    validator : 
    {  
      check : "Function",
      init : null,
      nullable : true
    },
    
    invalidMessage : 
    {
      check : "String",
      init: ""
    }
  },
  

  members :
  {
    __formItems : null,
    __valid : null,
    
    
    /**
     * validator return boolean or throw ValidationError
     */
    add: function(formItem, name, validator) {
      var dataEntry = 
      {
        item : formItem, 
        name : name,
        validator : validator,
        init : formItem.getValue()
      };
      this.__formItems.push(dataEntry);
    },
    
    
    validate : function() {
      var valid = true;
      var items = [];
      
      // check all validators for the added form items
      for (var i = 0; i < this.__formItems.length; i++) {
        var formItem = this.__formItems[i].item;
        var validator = this.__formItems[i].validator;
        
        // store the items in case of form validation
        items.push(formItem);
        
        // ignore all form items without a validator
        if (!qx.lang.Type.isFunction(validator)) {
          // check for the required property
          if (formItem.getRequired()) {
            var validatorResult = !!formItem.getValue();
            formItem.setValid(validatorResult);
            formItem.setInvalidMessage("Field is required.");
            valid = valid && validatorResult;            
          }
          continue;
        }
        
        var value = formItem.getValue();
        
        try {
          var validatorResult = validator(value, formItem);
          if (validatorResult === undefined) {
            validatorResult = true;
          }
          
        } catch (e) {
          if (e instanceof qx.core.ValidationError) {
            validatorResult = false;
            formItem.setInvalidMessage(e.message() || e.getComment());
          } else {
            throw e;
          }
        }
        
        formItem.setValid(validatorResult);
        valid = valid && validatorResult;        
      }
      
      // check the form validator (be sure to invoke it even if the form 
      // items are already false)
      var formValid = this.__validateForm(items);
      valid = valid && formValid;
      
      this.__setValid(valid);
      return valid;
    },
    
    
    __validateForm: function(items) {
      var formValidator = this.getValidator();
      if (formValidator != null) {
        // reset the invalidMessage
        this.setInvalidMessage("");
        try {
          var formValid = formValidator(items, this);
          if (formValid === undefined) {
            formValid = true;
          }          
        } catch (e) {
          if (e instanceof qx.core.ValidationError) {
            formValid = false;
            this.setInvalidMessage(e.message() || e.getComment());
          }
        }
        return formValid;
      }
      return true;      
    },
    
    
    __setValid: function(value) {
      var oldValue = this.__valid;
      this.__valid = value;
      // check for the change event
      if (oldValue != value) {
        this.fireDataEvent("changeValid", value, oldValue);
      }      
    },
    
    
    getValid: function() {
      return this.__valid;
    },
    
    isValid: function() {
      return this.getValid();
    },
    
    
    getInvalidMessages: function() {
      var messages = [];
      // combine the messages of all form items
      for (var i = 0; i < this.__formItems.length; i++) {
        var formItem = this.__formItems[i].item;
        if (!formItem.getValid()) {
          messages.push(formItem.getInvalidMessage());          
        }
      }
      // add the forms fail message
      if (this.getInvalidMessage() != "") {
        messages.push(this.getInvalidMessage());
      }
      
      return messages;
    },
    
    
    reset: function() {
      // reset all form items
      for (var i = 0; i < this.__formItems.length; i++) {
        var dataEntry = this.__formItems[i];
        // set the init value        
        dataEntry.item.setValue(dataEntry.init);
        // set the field to valid
        dataEntry.item.setValid(true);
      }
      // set the manager to its inital valid value
      this.__valid = null;
    }
  }
});
