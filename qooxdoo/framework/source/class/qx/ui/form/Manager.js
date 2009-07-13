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
/**
 * EXPERIMENTAL
 * 
 * This form manager is responsible for validation and synchronisation.
 */
qx.Class.define("qx.ui.form.Manager", 
{
  extend : qx.core.Object,

  construct : function()
  {
    this.base(arguments);
    
    this.__formItems = [];
    this.__asyncResults = {};    
  },
  
  
  events : 
  {
    "changeValid" : "qx.event.type.Data",
    "comlete" : "qx.event.type.Event"
  },
  
  
  properties : 
  {
    validator : 
    {  
      check : "value instanceof Function || qx.Class.isSubClassOf(value.constructor, qx.ui.form.AsyncValidator)",
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
    __asyncResults : null,
    __syncValid : null,
    
    /**
     * validator return boolean or throw ValidationError
     */
    add: function(formItem, name, validator) {
      var dataEntry = 
      {
        item : formItem, 
        name : name,
        validator : validator,
        init : formItem.getValue(),
        valid : null
      };
      this.__formItems.push(dataEntry);
    },
    
    
    validate : function() {
      var valid = true;
      this.__syncValid = true; // collaboration of all synchrony validations
      var items = [];

      // check all validators for the added form items
      for (var i = 0; i < this.__formItems.length; i++) {
        var formItem = this.__formItems[i].item;
        var validator = this.__formItems[i].validator;
        
        // store the items in case of form validation
        items.push(formItem);
        
        // ignore all form items without a validator
        if (validator == null) {
          // check for the required property
          if (formItem.getRequired()) {
            var validatorResult = !!formItem.getValue();
            formItem.setValid(validatorResult);
            formItem.setInvalidMessage("Field is required.");
            valid = valid && validatorResult;            
          }
          continue;
        }
        
        validatorResult = this.__validateItem(
          this.__formItems[i], formItem.getValue()
        );
        // keep that order to ensure that null is returnd on async cases
        valid = validatorResult && valid;
        if (validatorResult != null) {
          this.__syncValid = validatorResult && this.__syncValid;
        }
      }
      
      // check the form validator (be sure to invoke it even if the form 
      // items are already false, so keep the order!)
      valid = this.__validateForm(items) && valid;
      
      this.__setValid(valid);
      return valid;
    },

    
    __validateItem : function(dataEntry, value) {
      var formItem = dataEntry.item;
      var validator = dataEntry.validator;

      if (this.__isAsyncValidator(validator)) {
        this.__asyncResults[formItem.toHashCode()] = null;
        validator.validate(formItem, formItem.getValue(), this);          
        return null;
      }
      
      var validatorResult = null;      

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
      dataEntry.valid = validatorResult;
              
      return validatorResult;
    },
    
    
    __validateForm: function(items) {
      var formValidator = this.getValidator();
      
      if (formValidator == null) {
        return true;
      }
      
      // reset the invalidMessage
      this.setInvalidMessage("");
      
      if (this.__isAsyncValidator(formValidator)) {
        this.__asyncResults[this.toHashCode()] = null;
        formValidator.validateForm(items, this);
        return null;        
      }  
        
      try {
        var formValid = formValidator(items, this);
        if (formValid === undefined) {
          formValid = true;
        }          
      } catch (e) {
        if (e instanceof qx.core.ValidationError) {
          formValid = false;
          this.setInvalidMessage(e.message() || e.getComment());
        } else {
          throw e;
        }
      }
      return formValid;
    },
    
    
    __isAsyncValidator : function(validator) {
      var async = false;
      if (!qx.lang.Type.isFunction(validator)) {
        async = qx.Class.isSubClassOf(
          validator.constructor, qx.ui.form.AsyncValidator
        );
      }
      return async;      
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
    },
    
    
    setItemValid: function(formItem, valid) {
      // store the result
      this.__asyncResults[formItem.toHashCode()] = valid;
      formItem.setValid(valid);
      this.__checkValidationComplete();
    },
    
    
    setFormValid : function(valid) {
      this.__asyncResults[this.toHashCode()] = valid;
      this.__checkValidationComplete();
    },
    
    
    __checkValidationComplete : function() {
      var valid = this.__syncValid;
      
      // check if all async validators are done
      for (var hash in this.__asyncResults) {
        var currentResult = this.__asyncResults[hash];
        valid = currentResult && valid;
        // the validation is not done so just do nothing
        if (currentResult == null) {
          return;
        }
      }
      // set the actual valid state of the manager
      this.__setValid(valid);
      // reset the results
      this.__asyncResults = {};
      // fire the comlete event (no entry in the results with null)
      this.fireEvent("complete");      
    }
  }
});
