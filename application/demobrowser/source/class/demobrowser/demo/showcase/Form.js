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
     * Jonathan Rass (jonathan_rass)

************************************************************************ */

/* ************************************************************************

#asset(qx/icon/${qx.icontheme}/16/actions/go-previous.png)
#asset(qx/icon/${qx.icontheme}/16/actions/go-next.png)
#asset(qx/icon/${qx.icontheme}/16/actions/media-playback-start.png)
#asset(qx/icon/${qx.icontheme}/16/categories/internet.png)

************************************************************************ */

qx.Class.define("demobrowser.demo.showcase.Form",
{
  extend : qx.application.Standalone,

  members :
  {
    main: function()
    {
      this.base(arguments);

      var layout = new qx.ui.layout.Grid(9, 5);
      layout.setColumnAlign(0, "right", "top");
      layout.setColumnAlign(2, "right", "top");
      layout.setColumnWidth(1, 160);
      layout.setColumnWidth(2, 72);
      layout.setColumnWidth(3, 108);


      var container = new qx.ui.container.Composite(layout).set({
        decorator: "main",
        padding: 16
      });

      this.getRoot().add(container, {left:40, top:40});

      // buttons
      var paneLayout = new qx.ui.layout.HBox().set({
        spacing: 4,
        alignX : "right"
      });
      var buttonPane = new qx.ui.container.Composite(paneLayout).set({
        paddingTop: 11
      });
      container.add(buttonPane, {row:5, column: 0, colSpan: 4});

      okButton = new qx.ui.form.Button("OK").set({
        minWidth: 80
      });
      okButton.addState("default");
      buttonPane.add(okButton);

      cancelButton = new qx.ui.form.Button("Cancel").set({
        minWidth: 80
      });
      buttonPane.add(cancelButton);
      }
  }
});
