/* ************************************************************************

   qooxdoo - the new era of web development

   http://qooxdoo.org

   Copyright:
     2004-2010 1&1 Internet AG, Germany, http://www.1und1.de

   License:
     LGPL: http://www.gnu.org/licenses/lgpl.html
     EPL: http://www.eclipse.org/org/documents/epl-v10.php
     See the LICENSE file in the project's top-level directory for details.

   Authors:
     * Christian Hagendorn (chris_schmidt)

************************************************************************ */

/* ************************************************************************

#asset(qx/icon/${qx.icontheme}/16/places/folder.png)

************************************************************************ */

/**
 * @tag test
 */
qx.Class.define("demobrowser.demo.test.Opacity",
{
  extend : qx.application.Standalone,

  members :
  {
    main: function()
    {
      this.base(arguments);

      var root = this.getRoot();
      var scroller = new qx.ui.container.Scroll();
      root.add(scroller, {edge: 0});

      var container = new qx.ui.container.Composite(new qx.ui.layout.Canvas());
      container.setAllowStretchX(false);
      scroller.add(container);

      var widgets = [];

      // spinner
      widgets.push(new qx.ui.form.Spinner());
      container.add(widgets[0], {left: 20, top: 70});

      // slider
      widgets.push(new qx.ui.form.Slider());
      widgets[1].setWidth(200);
      container.add(widgets[1], {left: 20, top: 100});

      // textfield
      widgets.push(new qx.ui.form.TextField());
      container.add(widgets[2], {left: 20, top: 130});

      // textarea
      widgets.push(new qx.ui.form.TextArea());
      container.add(widgets[3], {left: 20, top: 160});

      // passwordfield
      widgets.push(new qx.ui.form.PasswordField());
      container.add(widgets[4], {left: 20, top: 250});

      // combobox
      widgets.push(new qx.ui.form.ComboBox());
      container.add(widgets[5], {left: 20, top: 280});
      for (var i = 0; i < 10; i++) {
        widgets[5].add(new qx.ui.form.ListItem("Item " + (i + 1), "icon/16/places/folder.png"));
      }

      // selectbox
      widgets.push(new qx.ui.form.SelectBox());
      container.add(widgets[6], {left: 20, top: 310});
      for (var i = 0; i < 10; i++) {
        widgets[6].add(new qx.ui.form.ListItem("Item " + (i + 1), "icon/16/places/folder.png"));
      }

      // checkbox
      widgets.push(new qx.ui.form.CheckBox());
      container.add(widgets[7], {left: 20, top: 340});

      // radiobutton
      widgets.push(new qx.ui.form.RadioButton());
      container.add(widgets[8], {left: 20, top: 360});

      // group box
      widgets.push(new qx.ui.groupbox.GroupBox("I am a box"));
      container.add(widgets[9], {left: 240, top: 70});
      widgets[9].setLayout(new qx.ui.layout.Canvas());
      widgets[9].add(new qx.ui.basic.Label("I am a label"));

      // radio group box
      widgets.push(new qx.ui.groupbox.RadioGroupBox("I am a box"));
      container.add(widgets[10], {left: 240, top: 140});
      widgets[10].setLayout(new qx.ui.layout.Canvas());
      widgets[10].add(new qx.ui.basic.Label("I am a label"));

      // check group box
      widgets.push(new qx.ui.groupbox.CheckGroupBox("I am a box"));
      container.add(widgets[11], {left: 240, top: 210});
      widgets[11].setLayout(new qx.ui.layout.Canvas());
      widgets[11].add(new qx.ui.basic.Label("I am a label"));

      // button
      widgets.push(new qx.ui.form.Button("Button", "icon/16/places/folder.png"));
      container.add(widgets[12], {left: 240, top: 280});

      // toggle button
      widgets.push(new qx.ui.form.ToggleButton("Toggle Button", "icon/16/places/folder.png"));
      container.add(widgets[13], {left: 240, top: 310});

      // repeat button
      widgets.push(new qx.ui.form.RepeatButton("Repeat Button", "icon/16/places/folder.png"));
      container.add(widgets[14], {left: 240, top: 340});

      // hover button
      widgets.push(new qx.ui.form.HoverButton("Hover Button", "icon/16/places/folder.png"));
      container.add(widgets[15], {left: 240, top: 370});

      // list
      widgets.push(new qx.ui.form.List());
      container.add(widgets[16], {left: 390, top: 70});
      for (var i = 0; i < 10; i++) {
        widgets[16].add(new qx.ui.form.ListItem("Item " + (i + 1), "icon/16/places/folder.png"));
      }

      // date field
      widgets.push(new qx.ui.form.DateField());
      container.add(widgets[17], {left: 390, top: 280});

      // date chooser
      widgets.push(new qx.ui.control.DateChooser());
      container.add(widgets[18], {left: 530, top: 70});

      // radioGroup
      widgets.push(new qx.ui.form.RadioGroup());
      widgets.push(new qx.ui.form.RadioButton("RadioGroup 1"));
      widgets[19].add(widgets[20]);
      container.add(widgets[20], {left: 530, top: 250});
      widgets.push(new qx.ui.form.RadioButton("RadioGroup 2"));
      widgets[19].add(widgets[21]);
      container.add(widgets[21], {left: 530, top: 270});

      // tree
      widgets.push(new qx.ui.tree.Tree());
      container.add(widgets[22], {left: 530, top: 300});
      widgets.push(new qx.ui.tree.TreeFolder("root"));
      widgets[23].setOpen(true);
      widgets[22].setRoot(widgets[23]);
      widgets[23].add(new qx.ui.tree.TreeFile("File 1"));
      widgets[23].add(new qx.ui.tree.TreeFile("File 2"));
      widgets[23].add(new qx.ui.tree.TreeFile("File 3"));

      // table
      var tableModel = new qx.ui.table.model.Simple();
      tableModel.setColumns([ "ID", "A number", "A date", "Boolean" ]);
      tableModel.setData([
        [0, 123.44, new Date(), true],
        [1, 567.88, new Date(), false],
        [2, 901.22, new Date(), true],
        [3, 345.66, new Date(), false]
      ]);
      tableModel.setColumnEditable(1, true);
      tableModel.setColumnEditable(2, true);
      tableModel.setColumnSortable(3, false);

      widgets.push(new qx.ui.table.Table(tableModel));
      container.add(widgets[24], {left: 20, top: 400});

      widgets[24].set({
        width: 500,
        height: 100
      });

      var tcm = widgets[24].getTableColumnModel();
      tcm.setDataCellRenderer(3, new qx.ui.table.cellrenderer.Boolean());
      tcm.setHeaderCellRenderer(2, new qx.ui.table.headerrenderer.Icon("icon/16/places/folder.png", "A date"));


      /* ***********************************************
       * CONTROLS
       * ********************************************* */
      var controls = new qx.ui.container.Composite(new qx.ui.layout.HBox(8));
      container.add(controls, {top: 20, left: 20});

      var label = new qx.ui.basic.Label("Is AlphaImageLoader enabled: " + qx.bom.element.Decoration.isAlphaImageLoaderEnabled());
      controls.add(label);

      var opacaty = new qx.ui.form.ToggleButton("Apply opacity on root");
      opacaty.addListener("changeValue", function(e) {
        if (e.getData()) {
          root.setOpacity(0.5);
        } else {
          root.setOpacity(1);
        }
      });
      controls.add(opacaty);

      opacaty = new qx.ui.form.ToggleButton("Apply opacity on container");
      opacaty.addListener("changeValue", function(e) {
        if (e.getData()) {
          container.setOpacity(0.5);
        } else {
          container.setOpacity(1);
        }
      });
      controls.add(opacaty);
    }
  }
});
