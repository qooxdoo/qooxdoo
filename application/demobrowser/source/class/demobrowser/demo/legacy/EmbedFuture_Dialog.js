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
#asset(qx/icon/${qx.icontheme}/32/apps/dialog-information.png)

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
      this.compat();
      qx.theme.manager.Meta.getInstance().initialize();

      var root = new qx.ui.root.Page(document);

      // Create button
      var button = new qx.legacy.ui.form.Button("Open 0.8 widget dialog", "icon/32/status/dialog-information.png").set({
        top: 10,
        left: 10
      });
      button.addToDocument();

      var dlg = this.getDialog();
      root.add(dlg, {left: 100, top: 100});
      dlg.hide();

      // Add an event listener
      button.addListener("execute", function(e) {
        dlg.show();
      }, this);
    },


    getDialog : function()
    {
      var dialog = new qx.ui.container.Composite().set({
         backgroundColor: "yellow",
         decorator: "main",
         padding: 10
      });

      var layout = new qx.ui.layout.Grid();
      layout.setColumnFlex(0, 1);
      layout.setRowFlex(0, 1);
      layout.setSpacing(10);
      dialog.setLayout(layout);

      var pane = new qx.ui.basic.Label("Click here to resize ...").set({
        backgroundColor : "green",
        width: 600,
        height: 300,
        decorator: "main",
        padding: 10
      });

      dialog.add(pane, {row: 0, column: 0, colSpan: 3});

      var ok = new qx.ui.basic.Label("OK").set({
        backgroundColor : "green",
        decorator: "main",
        padding: [2, 5]
      });
      dialog.add(ok, {row: 1, column: 1});

      ok.addListener("click", dialog.hide, dialog);

      var cancel = new qx.ui.basic.Label("Cancel").set({
        backgroundColor : "green",
        decorator: "main",
        padding: [2, 5]
      });
      dialog.add(cancel, {row: 1, column: 2});

      cancel.addListener("click", dialog.hide, dialog);

      var grow = false;
      pane.addListener("click", function(e)
      {
        if (grow) {
          pane.set({
            width: 600,
            height: 300
          });
        }
        else
        {
          pane.set({
            width: 300,
            height: 200
          });
        }
        grow = !grow;
      });

      return dialog;
    }
  }
});
