/* ************************************************************************

   qooxdoo - the new era of web development

   http://qooxdoo.org

   Copyright:
     2004-2011 1&1 Internet AG, Germany, http://www.1und1.de

   License:
     LGPL: http://www.gnu.org/licenses/lgpl.html
     EPL: http://www.eclipse.org/org/documents/epl-v10.php
     See the LICENSE file in the project's top-level directory for details.

   Authors:
     * Tino Butz (tbtz)

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
      var title = new qx.ui.mobile.form.Title("User Registration Form");
      this.getContent().add(title);
      this.__form = this.__createForm();
      this.getContent().add(new qx.ui.mobile.form.renderer.Single(this.__form));

      this.__submitButton = new qx.ui.mobile.form.Button("Submit");
      this.__submitButton.addListener("tap", this._onButtonTap, this);
      this.__submitButton.setEnabled(false);
      this.getContent().add(this.__submitButton);

      var title2 = new qx.ui.mobile.form.Title("Registration Result");
      this.getContent().add(title2);
      this.__result = new qx.ui.mobile.embed.Html();
      this.getContent().add(this.__result);
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

      form.add(this.__name, "Username: ");
      validationManager.add(this.__name, function(value, item){
        var valid = value != null && value.length>3;
        if(!valid) {
          item.setInvalidMessage("username should have more than 3 characters!");
        }
        return valid;
      }, this);

      this.__password = new qx.ui.mobile.form.PasswordField().set({placeholder:"Password"});
      form.add(this.__password, "Password: ");

      // NUMBER FIELD
      this.__numberField = new qx.ui.mobile.form.NumberField();
      this.__numberField.setValue("0");
      this.__numberField.setMaximum(150);
      this.__numberField.setMinimum(0);
      form.add(this.__numberField,"Enter your age:");

      this.__rememberPass = new qx.ui.mobile.form.CheckBox();
      form.add(this.__rememberPass, "Remember password? ");
      this.__rememberPass.setModel("password_reminder");
      this.__rememberPass.bind("model",this.__password,"value");
      this.__password.bind("value",this.__rememberPass,"model");

      form.addGroupHeader("Gender: ");
      this.__radio1 = new qx.ui.mobile.form.RadioButton();
      this.__radio2 = new qx.ui.mobile.form.RadioButton();

      var radioGroup = new qx.ui.mobile.form.RadioGroup();
      radioGroup.setAllowEmptySelection(true);
      radioGroup.add(this.__radio1, this.__radio2);
      form.add(this.__radio1, "Male");
      form.add(this.__radio2, "Female");

      this.__info = new qx.ui.mobile.form.TextArea().set({placeholder:"Terms of Service"});
      form.add(this.__info,"Terms of Service: ");
      this.__info.setValue("qooxdoo Licensing Information\n=============================\n\nqooxdoo is dual-licensed under the GNU Lesser General Public License (LGPL) and the Eclipse Public License (EPL). \n");

      this.__save = new qx.ui.mobile.form.ToggleButton(false,"Agree","Reject",13);
      this.__save.addListener("changeValue", this._enableFormSubmitting, this);
      form.add(this.__save, "Agree? ");

      this.__slide = new qx.ui.mobile.form.Slider();
      form.add(this.__slide,"Are you human? Drag the slider to prove it.");

      var dd = new qx.data.Array(["Web search", "From a friend", "Offline ad"]);
      var selQuestion = "How did you hear about us ?";
      this.__sel = new qx.ui.mobile.form.SelectBox();
      this.__sel.setDialogTitle(selQuestion);
      this.__sel.setModel(dd);

      form.add(this.__sel, selQuestion);

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
    _onButtonTap : function(evt)
    {
      if(this.__form.validate())
      {
        var result = [];
        result.push("Username: " +  this.__name.getValue());
        result.push("Password: " +  this.__password.getValue());
        result.push("Agree on our terms: " +  this.__save.getValue());
        result.push("How did you hear about us : " +  this.__sel.getValue());
        result.push("Are you human? : " +  this.__slide.getValue() +"%");
        this.__result.setHtml(result.join("<br>"));
      }
    },


    // overridden
    _back : function()
    {
      qx.core.Init.getApplication().getRouting().executeGet("/", {reverse:true});
    }
  }
});