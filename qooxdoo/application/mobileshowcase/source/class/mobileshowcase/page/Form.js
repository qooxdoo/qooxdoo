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

    // overridden
    _initialize : function()
    {
      this.base(arguments);
      var title = new qx.ui.mobile.form.Title("Form");
      this.getContent().add(title);
      this.__form = this.__createForm();
      this.getContent().add(new qx.ui.mobile.form.renderer.Single(this.__form));

      var button = new qx.ui.mobile.form.Button("Submit");
      button.addListener("tap", this._onButtonTap, this);
      this.getContent().add(button);

      var title = new qx.ui.mobile.form.Title("Form Content");
      this.getContent().add(title);
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

      this.__name = new qx.ui.mobile.form.TextField().set({placeholder:"Username - value bound to checkbox's model"});
      this.__name.setRequired(true);
      form.add(this.__name, "Username: ");
      validationManager.add(this.__name, function(value, item){
        var valid = value != null && value.length>3;
        if(!valid) {
          item.setInvalidMessage("value should have more than 3 characters!");
        }
        return valid;
      }, this);

      this.__password = new qx.ui.mobile.form.PasswordField().set({placeholder:"Password"});
      form.add(this.__password, "Password: ");
      
      this.__rememberPass = new qx.ui.mobile.form.CheckBox();
      form.add(this.__rememberPass, "Remember password? ");
      this.__rememberPass.setModel("checkbox model bound to textField value. check the Checkbox to see its model in the textarea");
      this.__rememberPass.bind("model",this.__name,"value");
      this.__name.bind("value",this.__rememberPass,"model");
      
      this.__rememberPass.addListener('tap', this._onCheckBoxClick, this);
      form.addGroupHeader("Countries");
      this.__radio1 = new qx.ui.mobile.form.RadioButton();
      this.__radio2 = new qx.ui.mobile.form.RadioButton();
      this.__radio3 = new qx.ui.mobile.form.RadioButton();
      var radioGroup = new qx.ui.form.RadioGroup(this.__radio1, this.__radio2, this.__radio3);
      form.add(this.__radio1, "Germany");
      form.add(this.__radio2, "UK");
      form.add(this.__radio3, "USA");
      
      this.__info = new qx.ui.mobile.form.TextArea().set({placeholder:"Some Info"});
      form.add(this.__info,"Some Info: ");

      this.__save = new qx.ui.mobile.form.ToggleButton();
      form.add(this.__save, "Save: ");

      this.__slide = new qx.ui.mobile.form.Slider();
      form.add(this.__slide,"Go: ");
      
      var dd = new qx.data.Array(["item 1", "Item 2", "Item 3"]);
      this.__sel = new qx.ui.mobile.form.SelectBox();
      this.__sel.setModel(dd);
      form.add(this.__sel, "Items ");
      
      return form;
      
    },

    _onCheckBoxClick : function(evt)
    {
      this.__info.setValue(this.__rememberPass.getValue() ? this.__rememberPass.getModel().toString() : "");
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
        result.push("Info: " +  this.__info.getValue());
        result.push("Save: " +  this.__save.getValue());
        result.push("Slider: " +  this.__slide.getValue());
        this.__result.setHtml(result.join("<br>"));
      }
    },


    // overridden
    _back : function()
    {
      qx.ui.mobile.navigation.Manager.getInstance().executeGet("/", {reverse:true});
    }
  }
});