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
     * Tino Butz (tbtz)

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
    __rememberPass : null,

    // overridden
    _initialize : function()
    {
      this.base(arguments);
      var title = new qx.ui.mobile.form.Title("Form");
      this.getContent().add(title);
      this.getContent().add(this.__createForm());

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

      var row = new qx.ui.mobile.form.Row();
      this.__name = new qx.ui.mobile.form.TextField().set({placeholder:"Username - value bound to checkbox's model"});
      row.add(this.__name);
      form.add(row);

      var row = new qx.ui.mobile.form.Row();
      form.add(row);
      this.__password = new qx.ui.mobile.form.PasswordField().set({placeholder:"Password"});
      row.add(this.__password);
      
      var row = new qx.ui.mobile.form.Row();
      this.__rememberPass = new qx.ui.mobile.form.CheckBox();
      row.add(this.__rememberPass);
      this.__rememberPass.setModel("checkbox model bound to textField value. check the Checkbox to see its model in the textarea");
      this.__rememberPass.bind("model",this.__name,"value");
      this.__name.bind("value",this.__rememberPass,"model");
      
      form.add(row);
      
      this.__rememberPass.addListener('tap', this._onCheckBoxClick, this);
      
      var row = new qx.ui.mobile.form.Row();
      this.__radio1 = new qx.ui.mobile.form.RadioButton();
      this.__radio2 = new qx.ui.mobile.form.RadioButton();
      this.__radio3 = new qx.ui.mobile.form.RadioButton();
      var radioGroup = new qx.ui.form.RadioGroup(this.__radio1, this.__radio2, this.__radio3);
      row.add(this.__radio1);row.add(new qx.ui.mobile.basic.Label("Germany"));
      row.add(this.__radio2);row.add(new qx.ui.mobile.basic.Label("UK"));
      row.add(this.__radio3);row.add(new qx.ui.mobile.basic.Label("USA"));
      
      form.add(row);

      var row = new qx.ui.mobile.form.Row();
      form.add(row);
      this.__info = new qx.ui.mobile.form.TextArea().set({placeholder:"Some Info"});
      row.add(this.__info);

      var row = new qx.ui.mobile.form.Row(new qx.ui.mobile.layout.HBox());
      form.add(row);
      row.add(new qx.ui.mobile.basic.Label("Save"), {flex:1});
      this.__save = new qx.ui.mobile.form.ToggleButton();
      row.add(this.__save);

      var row = new qx.ui.mobile.form.Row(new qx.ui.mobile.layout.HBox());
      form.add(row);
      this.__slide = new qx.ui.mobile.form.Slider();
      row.add(this.__slide, {flex:1});
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
      var result = [];
      result.push("Username: " +  this.__name.getValue());
      result.push("Password: " +  this.__password.getValue());
      result.push("Info: " +  this.__info.getValue());
      result.push("Save: " +  this.__save.getValue());
      result.push("Slider: " +  this.__slide.getValue());
      this.__result.setHtml(result.join("<br>"));
    },


    // overridden
    _back : function()
    {
      qx.ui.mobile.navigation.Manager.getInstance().executeGet("/", {reverse:true});
    }
  }
});