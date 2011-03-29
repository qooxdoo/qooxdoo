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
  
  events :
  {
    "show" : "qx.event.type.Data"
  },


  members :
  {
    __password : null,
    __name : null,
    __info : null,
    __save : null,
    __result : null,

    // overridden
    _initialize : function()
    {
      this.base(arguments);
      var title = new qx.ui.mobile.form.Title("Form");
      this.getContent().add(title);
      this.getContent().add(this.__createForm());
      
      var title = new qx.ui.mobile.form.Title("Form Content");
      this.getContent().add(title);
      this.__result = new qx.ui.mobile.embed.Html();
      this.getContent().add(this.__result);
    },


    __createForm : function()
    {
      var form = new qx.ui.mobile.form.Form();
      var row = new qx.ui.mobile.form.Row();
      this.__name = new qx.ui.mobile.form.TextField().set({placeholder:"Username"});
      row.add(this.__name);
      form.add(row);
      var row = new qx.ui.mobile.form.Row();
      form.add(row);
      this.__password = new qx.ui.mobile.form.PasswordField().set({placeholder:"Password"});
      row.add(this.__password);
      var row = new qx.ui.mobile.form.Row();
      form.add(row);
      this.__info = new qx.ui.mobile.form.TextArea().set({placeholder:"Some Info"});
      row.add(this.__info);
      var row = new qx.ui.mobile.form.Row(new qx.ui.mobile.layout.HBox());
      form.add(row);
      row.add(new qx.ui.mobile.basic.Label("Save"), {flex:1});
      this.__save = new qx.ui.mobile.form.ToggleButton();
      row.add(this.__save);
      var row = new qx.ui.mobile.form.Row();
      form.add(row);
      var button = new qx.ui.mobile.form.Button("Submit");
      button.addListener("tap", this._onButtonTap, this);
      row.add(button);
      
      return form;
    },


    _onButtonTap : function()
    {
      var result = [];
      result.push("Username: " +  this.__name.getValue());
      result.push("Password: " +  this.__password.getValue());
      result.push("Info: " +  this.__info.getValue());
      result.push("Save: " +  this.__save.getValue());
      this.__result.setHtml(result.join("<br>"));
    },


    // overridden
    _back : function()
    {
      qx.ui.mobile.navigation.Manager.getInstance().executeGet("/", {reverse:true});
    }
  } 
});