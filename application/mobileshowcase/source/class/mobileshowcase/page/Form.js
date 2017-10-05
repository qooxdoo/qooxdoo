/* ************************************************************************

   qooxdoo - the new era of web development

   http://qooxdoo.org

   Copyright:
     2004-2012 1&1 Internet AG, Germany, http://www.1und1.de

   License:
     MIT: https://opensource.org/licenses/MIT
     See the LICENSE file in the project's top-level directory for details.

   Authors:
     * Tino Butz (tbtz)
     * Christopher Zuendorf (czuendorf)

************************************************************************ */

/**
 * Mobile page responsible for showing the "form" showcase.
 */
qx.Class.define("mobileshowcase.page.Form",
{
  extend : mobileshowcase.page.Abstract,

  construct : function()
  {
    this.base(arguments);
    this.setTitle("Form");
  },


  members :
  {
    __password : null,
    __name : null,
    __info : null,
    __save : null,
    __result : null,
    __resultPopup : null,
    __closeResultPopup : null,
    __slide : null,
    __sel : null,
    __rememberPass : null,
    __radio1 : null,
    __radio2 : null,
    __form : null,
    __submitButton : null,
    __resetButton : null,
    __numberField : null,


    // overridden
    _initialize : function()
    {
      this.base(arguments);
      this.__form = this.__createForm();

      this.getContent().add(new qx.ui.mobile.form.renderer.Single(this.__form));

      this.__submitButton = this._createSubmitButton();
      this.getContent().add(this.__submitButton);

      this.__resetButton = this._createResetButton();
      this.getContent().add(this.__resetButton);

      this.__result = new qx.ui.mobile.form.Label();
      this.__result.addCssClass("registration-result");

      var popupContent = new qx.ui.mobile.container.Composite();
      this.__closeResultPopup = new qx.ui.mobile.form.Button("OK");
      this.__closeResultPopup.addListener("tap", function() {
        this.__resultPopup.hide();
      },this);

      popupContent.add(this.__result);
      popupContent.add(this.__closeResultPopup);

      this.__resultPopup = new qx.ui.mobile.dialog.Popup(popupContent);
      this.__resultPopup.setTitle("Registration Result");
    },


    /**
    * Factory for the Submit Button.
    * @return {qx.ui.mobile.form.Button} reset button
    */
    _createSubmitButton : function() {
      var submitButton = new qx.ui.mobile.form.Button("Submit");
      submitButton.addListener("tap", this._onSubmitButtonTap, this);
      submitButton.setEnabled(false);
      return submitButton;
    },


    /**
    * Factory for the Reset Button.
    * @return {qx.ui.mobile.form.Button} reset button
    */
    _createResetButton : function() {
      var resetButton = new qx.ui.mobile.form.Button("Reset");
      resetButton.addListener("tap", this._onResetButtonTap, this);
      return resetButton;
    },


    /**
     * Creates the form for this showcase.
     *
     * @return {qx.ui.mobile.form.Form} the created form.
     */
    __createForm : function()
    {
      var form = new qx.ui.mobile.form.Form();

      // NAME FIELD
      this.__name = new qx.ui.mobile.form.TextField().set({placeholder:"Username"});
      this.__name.setRequired(true);
      this.__name.setLiveUpdate(true);

      form.addGroupHeader("Contact");
      form.add(this.__name, "Username");

      // PASSWORD FIELD
      this.__password = new qx.ui.mobile.form.PasswordField().set({placeholder:"Password"});
      this.__password.setLiveUpdate(true);
      form.add(this.__password, "Password");

      // REMEMBER PASSWORD CHECKBOX
      this.__rememberPass = new qx.ui.mobile.form.CheckBox();
      form.add(this.__rememberPass, "Remember password? ");
      this.__rememberPass.setModel("password_reminder");
      this.__rememberPass.bind("model",this.__password,"value");

      this.__password.bind("value",this.__rememberPass,"model");

      // NUMBER FIELD
      this.__numberField = new qx.ui.mobile.form.NumberField();
      this.__numberField.setMaximum(150);
      this.__numberField.setMinimum(0);
      this.__numberField.setLiveUpdate(true);
      form.add(this.__numberField,"Age");

      form.addGroupHeader("Gender");
      this.__radio1 = new qx.ui.mobile.form.RadioButton();
      this.__radio2 = new qx.ui.mobile.form.RadioButton();

      var radioGroup = new qx.ui.mobile.form.RadioGroup();
      radioGroup.setAllowEmptySelection(true);
      radioGroup.add(this.__radio1, this.__radio2);
      form.add(this.__radio1, "Male");
      form.add(this.__radio2, "Female");

      form.addGroupHeader("Feedback");
      var dd = new qx.data.Array(["Web search", "From a friend", "Offline ad", "Magazine", "Twitter", "Other"]);
      var selQuestion = "How did you hear about us ?";

      this.__sel = new qx.ui.mobile.form.SelectBox();
      this.__sel.set({required: true});
      this.__sel.set({placeholder:"Unknown"});
      this.__sel.setClearButtonLabel("Clear");
      this.__sel.setDialogTitle(selQuestion);
      this.__sel.setModel(dd);

      form.add(this.__sel, selQuestion);

      form.addGroupHeader("License");
      this.__info = new qx.ui.mobile.form.TextArea().set({
        placeholder: "Terms of Service",
        readOnly: true
      });
      form.add(this.__info,"Terms of Service");
      this.__info.setValue("qooxdoo Licensing Information\n=============================\n\nqooxdoo is licensed under the MIT License (MIT). \n The above holds for any newer qooxdoo release. Only legacy versions 5.0 and below were licensed under LGPL/EPL.");

      this.__slide = new qx.ui.mobile.form.Slider();
      this.__slide.setDisplayValue("percent");
      form.add(this.__slide,"Are you human? Drag the slider to prove it.");

      this.__save = new qx.ui.mobile.form.ToggleButton(false,"YES","NO",13);
      this.__save.addListener("changeValue", this._enableFormSubmitting, this);
      form.add(this.__save, "Agree?");

      this._createValidationRules(form.getValidationManager());

      // make sure to restore the defaults on reset
      form.redefineResetter();

      return form;
    },


    /**
     * Adds all validation rules of the form.
     * @param validationManager {qx.ui.form.validation.Manager} the created form.
     */
    _createValidationRules : function(validationManager) {
      // USERNAME validation
      validationManager.add(this.__name, function(value, item){
        var valid = value != null && value.length>3;
        if(!valid) {
          item.setInvalidMessage("Username should have more than 3 characters!");
        }
        return valid;
      }, this);

      // PASSWORD validation
      validationManager.add(this.__password, function(value, item){
        var valid = value != null && value.length>3;
        if(!valid) {
          item.setInvalidMessage("Password should have more than 3 characters!");
        }
        return valid;
      }, this);

      // AGE validation
      validationManager.add(this.__numberField, function(value, item) {
        if(value == null || value == "0") {
          item.setInvalidMessage("Please enter your age.");
          return false;
        }

        if (value.length == 0 || value.match(/[\D]+/)) {
          item.setInvalidMessage("Please enter a valid age.");
          return false;
        }

        if(value < item.getMinimum() || value > item.getMaximum()) {
          item.setInvalidMessage("Value out of range: "+ item.getMinimum()+"-"+item.getMaximum());
          return false;
        }
        return true;
      }, this);
    },


    _enableFormSubmitting : function(evt) {
      this.__submitButton.setEnabled(evt.getData());
    },


    /**  Event handler */
    _onResetButtonTap : function() {
      this.__form.reset();
    },


    /** Event handler. */
    _onSubmitButtonTap : function()
    {
      if(this.__form.validate())
      {
        var result = [];
        result.push("Username: " +  this.__name.getValue());
        result.push("Password: " +  this.__password.getValue());
        result.push("Age: " +  this.__numberField.getValue());
        result.push("Male: " +  this.__radio1.getValue());
        result.push("Female: " +  this.__radio2.getValue());
        result.push("Agree on our terms: " +  this.__save.getValue());
        result.push("How did you hear about us : " +  this.__sel.getValue());
        result.push("Are you human? : " +  this.__slide.getValue() +"%");
        this.__result.setValue(result.join("<br>"));
        this.__resultPopup.show();
      } else {
        // Scroll to invalid field.
        var invalidItems = this.__form.getInvalidItems();

        this._getScrollContainer().scrollToWidget(invalidItems[0].getLayoutParent(), 500);
      }
    },


    // overridden
    _stop : function() {
      if(this.__resultPopup) {
        this.__resultPopup.hide();
      }
      this.base(arguments);
    }
  }
});
