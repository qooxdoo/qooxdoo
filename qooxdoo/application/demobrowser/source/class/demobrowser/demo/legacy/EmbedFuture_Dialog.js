/* ************************************************************************

   qooxdoo - the new era of web development

   http://qooxdoo.org

   Copyright:
     2004-2008 1&1 Internet AG, Germany, http://www.1und1.de

   License:
     LGPL: http://www.gnu.org/licenses/lgpl.html
     EPL: http://www.eclipse.org/org/documents/epl-v10.php
     See the LICENSE file in the project's top-level directory for details.

   Authors:
     * Sebastian Werner (wpbasti)
     * Fabian Jakobs (fjakobs)

************************************************************************ */

/* ************************************************************************

#use(qx.legacy.theme.ClassicRoyale)
#asset(qx/compat/icon/CrystalClear/32/status/dialog-information.png)

************************************************************************ */

/**
 * This example embeds a top level dialog based on the 0.8 ui widgets into a
 * legacy qooxdoo application.
 */
qx.Class.define("demobrowser.demo.legacy.EmbedFuture_Dialog",
{
  extend : qx.legacy.application.Gui,

  members :
  {
    main: function()
    {
      this.base(arguments);
      qx.theme.manager.Meta.getInstance().initialize();

      // Create button
      var button = new qx.legacy.ui.form.Button("Open 0.8 widget dialog", "icon/32/status/dialog-information.png").set({
        top: 10,
        left: 10
      });
      button.addToDocument();

      var dlg = this.getDialog();

      // Add an event listener
      button.addListener("execute", function(e) {
        dlg.open();
      }, this);
    },


    getDialog : function()
    {
      var dialog = new qx.ui.window.Window("Brave new world!");
      dialog.moveTo(100, 100);

      dialog.setLayout(new qx.ui.layout.Grow());
      dialog.add(new qx.ui.basic.Label("Brave new world!").set({
        font: qx.bom.Font.fromConfig({
          size: 100,
          bold: true
        })
      }));
      return dialog;
    }
  }
});
