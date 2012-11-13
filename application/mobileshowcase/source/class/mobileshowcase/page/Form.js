/* ************************************************************************

   qooxdoo - the new era of web development

   http://qooxdoo.org

   Copyright:
     2004-2012 1&1 Internet AG, Germany, http://www.1und1.de

   License:
     LGPL: http://www.gnu.org/licenses/lgpl.html
     EPL: http://www.eclipse.org/org/documents/epl-v10.php
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
  extend : qx.ui.mobile.page.NavigationPage,

  construct : function()
  {
    this.base(arguments);
    this.setTitle("Form");
    this.setShowBackButton(true);
    this.setBackButtonText("Back");
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
    __numberField : null,


    // overridden
    _initialize : function()
    {
      this.base(arguments);
      this.__form = this.__createForm();
      this.getContent().add(new qx.ui.mobile.form.renderer.Single(this.__form));

      this.__submitButton = new qx.ui.mobile.form.Button("Submit");
      this.__submitButton.addListener("tap", this._onButtonTap, this);
      this.__submitButton.setEnabled(false);
      this.getContent().add(this.__submitButton);

      this.__result = new qx.ui.mobile.form.Label();
      this.__result.addCssClass("registration-result");
      var popupContent = new qx.ui.mobile.container.Composite();
      this.__closeResultPopup = new qx.ui.mobile.form.Button("OK");
      this.__closeResultPopup.addListener("tap", function() {
        this.__resultPopup.hide();
      },this);

      popupContent.add(this.__result);
      popupContent.add(this.__closeResultPopup);

      this.__resultPopup = new qx.ui.mobile.dialog.Dialog(popupContent);
      this.__resultPopup.setTitle("Registration Result");
    },


    /**
     * Creates the form for this showcase.
     *
     * @return {qx.ui.mobile.form.Form} the created form.
     */
    __createForm : function()
    {

      var form = new qx.ui.mobile.form.Form();
      var validationManager = form.getValidationManager();

      this.__name = new qx.ui.mobile.form.TextField().set({placeholder:"Username"});
      this.__name.setRequired(true);

      form.addGroupHeader("Contact");
      form.add(this.__name, "Username");

      this.__password = new qx.ui.mobile.form.PasswordField().set({placeholder:"Password"});
      form.add(this.__password, "Password");

      this.__rememberPass = new qx.ui.mobile.form.CheckBox();
      form.add(this.__rememberPass, "Remember password? ");
      this.__rememberPass.setModel("password_reminder");
      this.__rememberPass.bind("model",this.__password,"value");
      this.__password.bind("value",this.__rememberPass,"model");

      // NUMBER FIELD
      this.__numberField = new qx.ui.mobile.form.NumberField();
      this.__numberField.setValue("0");
      this.__numberField.setMaximum(150);
      this.__numberField.setMinimum(0);
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
      var dd = new qx.data.Array(["Web search", "From a friend", "Offline ad"]);
      var selQuestion = "How did you hear about us ?";
      this.__sel = new qx.ui.mobile.form.SelectBox();
      this.__sel.set({required: true});
      this.__sel.set({placeholder:"Unknown"});
      this.__sel.setClearButtonLabel("Clear");
      this.__sel.setNullable(true);
      this.__sel.setDialogTitle(selQuestion);
      this.__sel.setModel(dd);
      this.__sel.setSelection(null);

      form.add(this.__sel, selQuestion);

      form.addGroupHeader("License");
      this.__info = new qx.ui.mobile.form.TextArea().set({placeholder:"Terms of Service"});
      form.add(this.__info,"Terms of Service");
      this.__info.setValue("qooxdoo Licensing Information\n=============================\n\nqooxdoo is dual-licensed under the GNU Lesser General Public License (LGPL) and the Eclipse Public License (EPL). \n The above holds for any newer qooxdoo release. Only legacy versions 0.6.4 and below were licensed solely under the GNU Lesser General Public License (LGPL). For a full understanding of your rights and obligations under these licenses, please see the full text of the LGPL and/or EPL. \n \n One important aspect of both licenses (so called \"weak copyleft\" licenses) is that if you make any modification or addition to the qooxdoo code itself, you MUST put your modification under the same license, the LGPL or EPL. \n  \n \n  \n Note that it is explicitly NOT NEEDED to put any application under the LGPL or EPL, if that application is just using qooxdoo as intended by the framework (this is where the \"weak\" part comes into play - contrast this with the GPL, which would only allow using qooxdoo to create an application that is itself governed by the GPL).");

      this.__slide = new qx.ui.mobile.form.Slider();
      form.add(this.__slide,"Are you human? Drag the slider to prove it.");

      this.__save = new qx.ui.mobile.form.ToggleButton(false,"Agree","Reject",13);
      this.__save.addListener("changeValue", this._enableFormSubmitting, this);
      form.add(this.__save, "Agree? ");

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
      validationManager.add(this.__numberField, function(value, item){
        var valid = value != null && value!="0";
        if(!valid) {
          item.setInvalidMessage("Please enter your age.");
        }
        return valid;
      }, this);

      return form;
    },


    _enableFormSubmitting : function(evt) {
      this.__submitButton.setEnabled(evt.getData());
    },


    /**
     * Event handler.
     *
     * @param evt {qx.event.type.Tap} The tap event.
     */
    _onButtonTap : function()
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
        this.scrollToWidget(invalidItems[0].getLayoutParent(), 500);
      }
    },


    // overridden
    _back : function()
    {
      qx.core.Init.getApplication().getRouting().executeGet("/", {reverse:true});
    }
  }
});
