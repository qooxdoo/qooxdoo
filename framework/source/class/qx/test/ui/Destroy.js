/* ************************************************************************

   qooxdoo - the new era of web development

   http://qooxdoo.org

   Copyright:
     2007-2008 1&1 Internet AG, Germany, http://www.1und1.de

   License:
     LGPL: http://www.gnu.org/licenses/lgpl.html
     EPL: http://www.eclipse.org/org/documents/epl-v10.php
     See the LICENSE file in the project's top-level directory for details.

   Authors:
     * Fabian Jakobs (fjakobs)

************************************************************************ */

qx.Class.define("qx.test.ui.Destroy",
{
  extend : qx.test.ui.LayoutTestCase,

  members :
  {
    assertLayoutDispose : function(clazz, args, layoutArgsArr)
    {
      this.assertDestroy(function()
      {
        var argStr = [];
        for (var i=0; i<args.length; i++) {
          argStr.push("args[" + i + "]");
        }
        var layout;
        var str = "var layout = new clazz(" + argStr.join(", ") + ");"
        eval(str);

        var widget = new qx.ui.container.Composite();
        widget.setLayout(layout);

        for (var i=0; i<layoutArgsArr.length; i++) {
          widget.add(new qx.ui.core.Widget(), layoutArgsArr[i]);
        }

        this.getRoot().add(widget);
        qx.ui.core.queue.Manager.flush();

        widget.destroy();
      }, this);
    },


    testLayouts : function()
    {
      var layouts = [
        [qx.ui.layout.Basic, [], [{left: 10}, {top: 10}, {left: 10, top: 10}]],
        [qx.ui.layout.Canvas, [], [{left: 10}, {top: 10}, {right: 10, top: "10%"}]],
        [qx.ui.layout.Dock, [], [{edge: "north"}, {edge: "south"}, {edge: "west"}, {edge: "east"}]],
        [qx.ui.layout.Grow, [], [{}]],
        [qx.ui.layout.HBox, [], [{flex: 1}, {}, {}]],
        [qx.ui.layout.VBox, [], [{flex: 1}, {}, {}]],
        [qx.ui.layout.Grid, [], [{row: 0, column: 0}, {row: 4, column: 3}, {row: 2, column: 0, colSpan: 3}]]
      ];

      for (var i=0; i<layouts.length; i++) {
        this.assertLayoutDispose(layouts[1][0], layouts[1][1], layouts[1][2])
      }
    },


    testForms : function()
    {
      var forms = [
        [qx.ui.form.Button, ["Juhu"]],
        [qx.ui.form.ComboBox, []],
        [qx.ui.form.CheckBox, ["Juhu"]],
        [qx.ui.form.PasswordField, []],
        [qx.ui.form.RadioButton, []],
        [qx.ui.form.SelectBox, []],
        [qx.ui.form.Slider, []],
        [qx.ui.form.Spinner, []],
        [qx.ui.form.SplitButton, []],
        [qx.ui.form.TextArea, []],
        [qx.ui.form.TextField, []],
        [qx.ui.form.ToggleButton, []]
      ];
      for (var i=0; i<forms.length; i++) {
        this.assertWidgetDispose(forms[i][0], forms[i][1], "Disposing " + forms[i][0].classname);
      }

      this.assertDestroy(function()
      {
        var widget = new qx.ui.form.MenuButton();
        widget.setMenu(this.__createMenu());

        this.getRoot().add(widget);
        qx.ui.core.queue.Manager.flush();

        widget.destroy();
      }, this, "Dispose menu button");
    },


    testBasic : function()
    {
      var forms = [
        [qx.ui.basic.Atom, ["Juhu"]],
        [qx.ui.basic.Label, ["Juhu"]],
        [qx.ui.basic.Image, []]
      ];
      for (var i=0; i<forms.length; i++) {
        this.assertWidgetDispose(forms[i][0], forms[i][1], "Disposing " + forms[i][0].classname);
      }
    },


    testContainer : function()
    {
      var forms = [
        [qx.ui.container.Composite, []],
        [qx.ui.container.Resizer, []],
        [qx.ui.container.Scroll, []],
        [qx.ui.container.SlideBar, []],
        [qx.ui.container.Stack, []]
      ];
      for (var i=0; i<forms.length; i++) {
        this.assertWidgetDispose(forms[i][0], forms[i][1], "Disposing " + forms[i][0].classname);
      }
    },


    testControls : function()
    {
      var forms = [
        [qx.ui.control.ColorSelector, []],
        [qx.ui.control.DateChooser, []]
      ];
      for (var i=0; i<forms.length; i++) {
        this.assertWidgetDispose(forms[i][0], forms[i][1], "Disposing " + forms[i][0].classname);
      }

      this.assertDestroy(function()
      {
        var widget = new qx.ui.control.ColorPopup();
        widget.show();
        qx.ui.core.queue.Manager.flush();

        widget.destroy();
      }, this, "Dispose color popup");
    },


    testCore : function()
    {
      var forms = [
        [qx.ui.core.ScrollBar, []],
        [qx.ui.core.ScrollPane, []],
        [qx.ui.core.ScrollSlider, []],
        [qx.ui.core.Widget, []]
      ];
      for (var i=0; i<forms.length; i++) {
        this.assertWidgetDispose(forms[i][0], forms[i][1], "Disposing " + forms[i][0].classname);
      }
    },


    testEmbeds : function()
    {
      var forms = [
        [qx.ui.embed.Html, ["Juhu <b>Kinners</b>"]],
        [qx.ui.embed.Canvas, []],
        [qx.ui.embed.Iframe, []]
      ];
      for (var i=0; i<forms.length; i++) {
        this.assertWidgetDispose(forms[i][0], forms[i][1], "Disposing " + forms[i][0].classname);
      }
    },


    testGroupBox : function()
    {
      var forms = [
        [qx.ui.groupbox.CheckGroupBox, []],
        [qx.ui.groupbox.GroupBox, []],
        [qx.ui.groupbox.RadioGroupBox, []]
      ];
      for (var i=0; i<forms.length; i++) {
        this.assertWidgetDispose(forms[i][0], forms[i][1], "Disposing " + forms[i][0].classname);
      }
    },


    testMenu : function()
    {
      this.assertDestroy(function()
      {
        var menu = new qx.ui.menu.Menu();
        var btn = new qx.ui.menu.Button("Juhu");
        menu.add(btn);
        menu.add(new qx.ui.menu.CheckBox("Juhu"));
        menu.add(new qx.ui.menu.RadioButton("Juhu"));
        menu.add(new qx.ui.menu.Separator("Juhu"));

        var subMenu = new qx.ui.menu.Menu();
        subMenu.add(new qx.ui.menu.Button("Juhu"));
        btn.setMenu(subMenu);

        menu.setOpener(this.getRoot());
        menu.open();
        qx.ui.core.queue.Manager.flush();

        menu.destroy();
      }, this, "Dispose configured menu");
    },


    testPopup : function()
    {
      this.assertDestroy(function()
      {
        var widget = new qx.ui.popup.Popup();
        widget.show();
        qx.ui.core.queue.Manager.flush();

        widget.destroy();
      }, this, "Dispose configured menu");
    },


    testProgressive : function()
    {
      // TODO
    },


    testSplitPane : function()
    {
      this.assertDestroy(function()
      {
        var widget = new qx.ui.splitpane.Pane();
        widget.add(new qx.ui.core.Widget(), 1);
        widget.add(new qx.ui.core.Widget());

        this.getRoot().add(widget);
        qx.ui.core.queue.Manager.flush();

        widget.destroy();
      }, this, "Dispose split pane");
    },


    testTabView : function()
    {
      this.assertDestroy(function()
      {
        var widget = new qx.ui.tabview.TabView();
        widget.add(new qx.ui.tabview.Page("Juhu"));
        widget.add(new qx.ui.tabview.Page("Kinners"));

        this.getRoot().add(widget);
        qx.ui.core.queue.Manager.flush();

        widget.destroy();
      }, this, "Dispose tabview");
    },


    testToolbar : function()
    {
      var forms = [
        [qx.ui.toolbar.Button, ["Juhu"]],
        [qx.ui.toolbar.CheckBox, ["Juhu"]],
        [qx.ui.toolbar.Part, []],
        [qx.ui.toolbar.PartContainer, []],
        [qx.ui.toolbar.RadioButton, ["Juhu"]],
        [qx.ui.toolbar.Separator, []],
        [qx.ui.toolbar.ToolBar, []]
      ];
      for (var i=0; i<forms.length; i++) {
        this.assertWidgetDispose(forms[i][0], forms[i][1], "Disposing " + forms[i][0].classname);
      }

      this.assertDestroy(function()
      {
        var widget = new qx.ui.toolbar.MenuButton("juhu");
        widget.setMenu(this.__createMenu());

        this.getRoot().add(widget);
        qx.ui.core.queue.Manager.flush();

        widget.destroy();
      }, this, "Dispose toolbar menu button");

      this.assertDestroy(function()
      {
        var widget = new qx.ui.toolbar.SplitButton("Juhu");
        widget.setMenu(this.__createMenu());

        this.getRoot().add(widget);
        qx.ui.core.queue.Manager.flush();

        widget.destroy();
      }, this, "Dispose toolbar split button");

      this.assertDestroy(function()
      {
        var widget = new qx.ui.toolbar.ToolBar();
        widget.add(new qx.ui.toolbar.Button("juhu"));

        var part = new qx.ui.toolbar.Part();
        part.add(new qx.ui.toolbar.RadioButton());
        widget.add(part);

        this.getRoot().add(widget);
        qx.ui.core.queue.Manager.flush();

        widget.destroy();
      }, this, "Dispose configured toolbar");
    },


    testTooltip : function()
    {
      this.assertDestroy(function()
      {
        var widget = new qx.ui.tooltip.ToolTip();
        widget.show();
        qx.ui.core.queue.Manager.flush();

        widget.destroy();
      }, this, "Dispose tool tip");
    },


    testTree : function()
    {
      this.assertDestroy(function()
      {
        var widget = new qx.ui.tree.Tree();

        var root = new qx.ui.tree.TreeFolder("folder");
        root.setOpen(true);
        root.add(new qx.ui.tree.TreeFile("file"));
        widget.setRoot(root);

        widget.show();
        qx.ui.core.queue.Manager.flush();

        widget.destroy();
      }, this, "Dispose tool tip");
    },


    testTreeVirtual : function()
    {
      // TODO
    },


    testWindow : function()
    {
      this.assertDestroy(function()
      {
        var widget = new qx.ui.window.Window();
        widget.show();
        qx.ui.core.queue.Manager.flush();

        widget.destroy();
      }, this, "Dispose tool tip");
    },

    __createMenu : function()
    {
      var menu = new qx.ui.menu.Menu();
      menu.add(new qx.ui.menu.Button("Juhu"));
      menu.add(new qx.ui.menu.CheckBox("Juhu"));
      menu.add(new qx.ui.menu.RadioButton("Juhu"));
      menu.add(new qx.ui.menu.Separator("Juhu"));

      return menu;
    }

  }
});
