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

qx.Class.define("demobrowser.demo.widget.Label",
{
  extend : qx.application.Standalone,

  members :
  {
    main: function()
    {
      this.base(arguments);

      var container = new qx.ui.container.Composite(new qx.ui.layout.VBox(20)).set({
        padding: 20
      });
      this.getRoot().add(container);

      var label1 = new qx.ui.basic.Label("text label").set({
        decorator: "main",
        width: 200
      });
      container.add(label1);
      this.getRoot().add(this.createConfigureButton(label1, "configure text label"), {left: 240, top: 20});

      var label2 = new qx.ui.basic.Label("rich label").set({
        decorator: "main",
        rich: true
      });
      container.add(label2);
      this.getRoot().add(this.createConfigureButton(label2, "configure rich label"), {left: 240, top: 60});

      var label3 = new qx.ui.basic.Label("My First Long Label Cutted").set({
        decorator: "main",
        width: 80
      });
      container.add(label3);

      var label4 = new qx.ui.basic.Label().set({
        value: "A long label text with auto-wrapping. This also may contain <b style='color:red'>rich HTML</b> markup.",
        decorator: "main",
        rich : true,
        width: 120
      });
      container.add(label4);

      var label5 = new qx.ui.basic.Label("Big Long Label").set({
        decorator: "main",
        font : new qx.bom.Font(28, ["Verdana", "sans-serif"])
      });
      container.add(label5);

      var label6 = new qx.ui.basic.Label("Big Long Label Cutted").set({
        decorator: "main",
        font : new qx.bom.Font(28, ["Verdana", "sans-serif"]),
        width : 150
      });
      container.add(label6);
    },


    createConfigureButton : function(widget, caption)
    {
      var button = new qx.ui.form.Button(caption);

      var win;
      button.addListener("execute", function()
      {
        if (!win) {
          win = this.createEditDialog(widget, caption);
        }
        win.open();
      }, this);

      return button;
    },


    createEditDialog : function(widget, caption)
    {
      var win = new qx.ui.window.Window(caption).set({
        allowMinimize: false,
        showMinimize: false,
        allowMaximize: false,
        showMaximize: false
      });
      win.moveTo(350, 20);

      var layout = new qx.ui.layout.Grid(10, 10);
      layout.setColumnFlex(1, 1);
      layout.setColumnAlign(0, "right", "top");
      win.setLayout(layout);

      var controller = new qx.data.controller.Object(widget);

      win.add(new qx.ui.basic.Label("value").set({
        paddingTop: 5
      }), {row: 0, column: 0});
      var textarea = new qx.ui.form.TextArea().set({
        liveUpdate: true
      });
      controller.addTarget(textarea, "value", "value", true);
      win.add(textarea, {row: 0, column: 1});

      win.add(new qx.ui.basic.Label("selectable"), {row: 1, column: 0});
      var buttonSelectable = new qx.ui.form.CheckBox();
      controller.addTarget(buttonSelectable, "value", "selectable", true);
      win.add(buttonSelectable, {row: 1, column: 1});

      win.add(new qx.ui.basic.Label("native context menu"), {row: 2, column: 0});
      var buttonSelectable = new qx.ui.form.CheckBox();
      controller.addTarget(buttonSelectable, "value", "nativeContextMenu", true);
      win.add(buttonSelectable, {row: 2, column: 1});

      win.add(new qx.ui.basic.Label("rich"), {row: 3, column: 0});
      var buttonSelectable = new qx.ui.form.CheckBox().set({
        enabled: false
      });
      controller.addTarget(buttonSelectable, "value", "rich");
      win.add(buttonSelectable, {row: 3, column: 1});

      return win;
    }
  }
});
