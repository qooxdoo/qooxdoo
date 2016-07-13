/* ************************************************************************

   qooxdoo - the new era of web development

   http://qooxdoo.org

   Copyright:
     2007-2008 1&1 Internet AG, Germany, http://www.1und1.de

   License:
     MIT: https://opensource.org/licenses/MIT
     See the LICENSE file in the project's top-level directory for details.

   Authors:
     * Fabian Jakobs (fjakobs)

************************************************************************ */

qx.Class.define("qx.test.ui.Destroy",
{
  extend : qx.test.ui.LayoutTestCase,

  statics :
  {
    $$clazz : null,
    $$args : null
  },

  members :
  {
    /**
     * @lint ignoreDeprecated(eval)
     */
    assertLayoutDispose : function(clazz, args, layoutArgsArr)
    {
      this.assertDestroy(function()
      {
        var argStr = [];
        for (var i=0; i<args.length; i++) {
          argStr.push("qx.test.ui.Destroy.$$args[" + i + "]");
        }

        qx.test.ui.Destroy.$$clazz = clazz;
        qx.test.ui.Destroy.$$args = args;
        var str = "new qx.test.ui.Destroy.$$clazz(" + argStr.join(", ") + ");";
        var layout = eval(str);

        var widget = new qx.ui.container.Composite();
        widget.setLayout(layout);

        for (var i=0; i<layoutArgsArr.length; i++) {
          widget.add(new qx.ui.core.Widget(), layoutArgsArr[i]);
        }

        this.getRoot().add(widget);
        this.flush();

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
        this.assertLayoutDispose(layouts[i][0], layouts[i][1], layouts[i][2]);
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
        var menu = this.__createMenu();
        widget.setMenu(menu);

        this.getRoot().add(widget);
        this.flush();

        widget.destroy();
        menu.destroy();
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
        this.flush();

        widget.destroy();
      }, this, "Dispose color popup");

      this.assertDestroy(function()
      {
        var widget = new qx.ui.control.ColorPopup();
        widget.show();
        widget.getChildControl("selector-button").execute();
        this.flush();

        widget.destroy();
        qx.ui.core.queue.Dispose.flush();
      }, this, "Dispose color popup with selector open");
    },


    testCore : function()
    {
      var forms = [
        [qx.ui.core.scroll.ScrollBar, []],
        [qx.ui.core.scroll.NativeScrollBar, []],
        [qx.ui.core.scroll.ScrollPane, []],
        [qx.ui.core.scroll.ScrollSlider, []],
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
        this.flush();

        subMenu.destroy();
        menu.destroy();
      }, this, "Dispose configured menu");
    },


    testPopup : function()
    {
      this.assertDestroy(function()
      {
        var widget = new qx.ui.popup.Popup();
        widget.show();
        this.flush();

        widget.destroy();
      }, this, "Dispose configured menu");
    },


    testSplitPane : function()
    {
      this.assertDestroy(function()
      {
        var widget = new qx.ui.splitpane.Pane();
        widget.add(new qx.ui.core.Widget(), 1);
        widget.add(new qx.ui.core.Widget());

        this.getRoot().add(widget);
        this.flush();

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
        this.flush();

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
        var menu = this.__createMenu();
        widget.setMenu(menu);

        this.getRoot().add(widget);
        this.flush();

        widget.destroy();
        menu.destroy();
      }, this, "Dispose toolbar menu button");

      this.assertDestroy(function()
      {
        var widget = new qx.ui.toolbar.SplitButton("Juhu");
        var menu = this.__createMenu();
        widget.setMenu(menu);

        this.getRoot().add(widget);
        this.flush();

        widget.destroy();
        menu.destroy();
      }, this, "Dispose toolbar split button");

      this.assertDestroy(function()
      {
        var widget = new qx.ui.toolbar.ToolBar();
        widget.add(new qx.ui.toolbar.Button("juhu"));

        var part = new qx.ui.toolbar.Part();
        part.add(new qx.ui.toolbar.RadioButton());
        widget.add(part);

        this.getRoot().add(widget);
        this.flush();

        widget.destroy();
      }, this, "Dispose configured toolbar");
    },


    testTooltip : function()
    {
      this.assertDestroy(function()
      {
        var widget = new qx.ui.tooltip.ToolTip();
        widget.show();
        this.flush();

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
        this.flush();

        widget.destroy();
      }, this, "Dispose tree");
    },


    testRadioGroup : function()
    {
      this.assertDestroy(function()
      {
        var group = new qx.ui.form.RadioGroup(
          new qx.ui.form.RadioButton("one"),
          new qx.ui.form.RadioButton("two")
        );

        group.dispose();
      });
    },


    testRadioButtonGroup : function()
    {
      this.assertDestroy(function()
      {
        var group = new qx.ui.form.RadioButtonGroup(new qx.ui.layout.HBox());
        group.add(new qx.ui.form.RadioButton("one"));
        group.add(new qx.ui.form.RadioButton("two"));

        group.destroy();
      });
    },


    testWindow : function()
    {
      this.assertDestroy(function()
      {
        var widget = new qx.ui.window.Window();
        widget.show();
        this.flush();

        widget.destroy();
      }, this, "Dispose window");
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
