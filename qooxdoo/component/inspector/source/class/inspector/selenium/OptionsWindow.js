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

/**
 * Window used to define settings for SeleniumWindow
 */

qx.Class.define("inspector.selenium.OptionsWindow", {

  extend : qx.ui.window.Window,

  /**
   * @param caption {String} Window title
   * @param icon {String} Window icon
   * @param mainWindow {inspector.selenium.View} Reference to the main View
   */
  construct : function(caption, icon, mainWindow)
  {
    this.base(arguments, caption, icon);

    this.set({
      layout : new qx.ui.layout.VBox(20),
      modal : true,
      width: 500
    });
    this.moveTo(160, 0);

    var containerTop = new qx.ui.container.Composite(new qx.ui.layout.Grow());
    this.add(containerTop);

    var form = new qx.ui.form.Form();
    form.addGroupHeader("Script Locations");

    var coreScripts = new qx.ui.form.TextField();
    coreScripts.setToolTipText("URI of a directory containing the contents of a Selenium Core Zip file (seleniumhq.org/download)");
    coreScripts.setRequired(true);
    form.add(coreScripts, "Selenium Core");
    var userExt = new qx.ui.form.TextField();
    userExt.setToolTipText("URI of the qooxdoo Selenium user extensions from the Simulator contribution");
    userExt.setRequired(true);
    form.add(userExt, "qooxdoo User Extensions");

    if (window.location.protocol == "http:") {
      var defaultButton = new qx.ui.form.Button("Set default URIs");
      defaultButton.addListener("execute", function() {
        coreScripts.setValue(qx.core.Setting.get("qx.inspector.selenium.core"));
        userExt.setValue(qx.core.Setting.get("qx.inspector.selenium.extensions"));
      }, this);
      form.addButton(defaultButton);
    }
    
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
      if (this.getSeleniumScripts()) {
        coreScripts.setValue(this.getSeleniumScripts()[0]);
        userExt.setValue(this.getSeleniumScripts()[1]);
      }
      this._optionsWindow.close();
    }, mainWindow);
    form.addButton(cancelButton);

    var renderer = new qx.ui.form.renderer.Single(form);
    renderer._getLayout().setColumnFlex(0, 0);
    renderer._getLayout().setColumnFlex(1, 1);
    containerTop.add(renderer);

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

    var containerBottom = new qx.ui.container.Composite(new qx.ui.layout.Grow());
    this.add(containerBottom);
    var noticeText = 'See the <a href="http://manual.qooxdoo.org/1.3/pages/application/inspector_selenium.html" target="_blank">manual page</a> for an explanation of these settings.';
    var notice = new qx.ui.basic.Label("");
    notice.setRich(true);
    notice.setValue(noticeText);
    containerBottom.add(notice);

  }

});
