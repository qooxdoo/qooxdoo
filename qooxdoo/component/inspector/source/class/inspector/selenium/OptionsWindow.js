/* ************************************************************************

   qooxdoo - the new era of web development

   http://qooxdoo.org

   Copyright:
     2010 1&1 Internet AG, Germany, http://www.1and1.org

   License:
     LGPL: http://www.gnu.org/licenses/lgpl.html
     EPL: http://www.eclipse.org/org/documents/epl-v10.php
     See the LICENSE file in the project's top-level directory for details.

   Authors:
     * Daniel Wagner (d_wagner)

************************************************************************ */

qx.Class.define("inspector.selenium.OptionsWindow", {

  extend : qx.ui.window.Window,
  
  construct : function(caption, icon, mainWindow)
  {
    this.base(arguments, caption, icon);
    
    this.set({
      layout : new qx.ui.layout.Basic(),
      modal : true
    });
    this.moveTo(160, 0);
    
    var form = new qx.ui.form.Form();
    form.addGroupHeader("Script Locations");
         
    var coreScripts = new qx.ui.form.TextField();
    coreScripts.setToolTipText("Path (URI or local file system) of a directory holding the contents of a Selenium Core Zip file (seleniumhq.org/download)");
    coreScripts.setRequired(true);
    form.add(coreScripts, "Selenium Core");
    var userExt = new qx.ui.form.TextField();
    userExt.setToolTipText("Path (URI or local file system) of the qooxdoo Selenium user extensions from the Simulator contribution");
    userExt.setRequired(true);
    form.add(userExt, "qooxdoo User Extensions");

    var okButton = new qx.ui.form.Button("OK");
    okButton.addListener("execute", function() {
      if (form.validate()) {
        this.setSeleniumScripts([coreScripts.getValue(), userExt.getValue()]);
        this._optionsWindow.close();
      }
    }, mainWindow);
    form.addButton(okButton);

    var cancelButton = new qx.ui.form.Button("Cancel");
    cancelButton.addListener("execute", function() {
      coreScripts.setValue(this.getSeleniumScripts()[0]);
      userExt.setValue(this.getSeleniumScripts()[1]);
      this._optionsWindow.close();
    }, mainWindow);
    form.addButton(cancelButton);

    this.add(new qx.ui.form.renderer.Single(form), {left: 10, top: 10});
    
    // bind the seleniumScripts property to the form fields
    var prop2formCore = {
      converter: function(data, modelObj) {
        if (!data) {
          return "";
        }
        return data[0];
      }
    };
    mainWindow.bind("seleniumScripts", coreScripts, "value", prop2formCore);
    
    var prop2formExt = {
      converter: function(data, modelObj) {
        if (!data) {
          return "";
        }
        return data[1];
      }
    };
    mainWindow.bind("seleniumScripts", userExt, "value", prop2formExt);
      
  }

});