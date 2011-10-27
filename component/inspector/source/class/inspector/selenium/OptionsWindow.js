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
    form.addGroupHeader("Script Location");

    var coreScripts = new qx.ui.form.TextField();
    coreScripts.setToolTipText("URI of a directory containing the contents of a Selenium Core Zip file (seleniumhq.org/download)");
    coreScripts.setRequired(true);
    form.add(coreScripts, "Selenium Core");

    if (window.location.protocol == "http:") {
      var defaultButton = new qx.ui.form.Button("Use default URI");
      defaultButton.addListener("execute", function() {
        coreScripts.setValue(qx.core.Environment.get("inspector.selenium.core"));
      }, this);
      form.addButton(defaultButton);
    }

    var okButton = new qx.ui.form.Button("OK");
    okButton.addListener("execute", function() {
      if (form.validate()) {
        this.setSeleniumScripts(coreScripts.getValue());
        this._optionsWindow.close();
      }
    }, mainWindow);
    form.addButton(okButton);

    var cancelButton = new qx.ui.form.Button("Cancel");
    cancelButton.addListener("execute", function() {
      if (this.getSeleniumScripts()) {
        coreScripts.setValue(this.getSeleniumScripts());
      }
      this._optionsWindow.close();
    }, mainWindow);
    form.addButton(cancelButton);

    var renderer = new qx.ui.form.renderer.Single(form);
    renderer._getLayout().setColumnFlex(0, 0);
    renderer._getLayout().setColumnFlex(1, 1);
    containerTop.add(renderer);

    // bind the seleniumScripts property to the form field
    mainWindow.bind("seleniumScripts", coreScripts, "value");

    var containerBottom = new qx.ui.container.Composite(new qx.ui.layout.Grow());
    this.add(containerBottom);
    var noticeText = 'See the <a href="http://manual.qooxdoo.org/' + qx.core.Environment.get("qx.version") + '/pages/application/inspector_selenium.html" target="_blank">manual page</a> for an explanation of this setting.';
    var notice = new qx.ui.basic.Label("");
    notice.setRich(true);
    notice.setValue(noticeText);
    containerBottom.add(notice);

  }

});
