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
   * Fabian Jakobs (fjakobs)
   * Jonathan Weiß (jonathan_rass)

************************************************************************ */

/**
 * @tag test
 */
qx.Class.define("demobrowser.demo.virtual.Selection",
{
  extend : qx.application.Standalone,



  /*
  *****************************************************************************
     MEMBERS
  *****************************************************************************
  */

  members :
  {
    /**
     * This method contains the initial application code and gets called
     * during startup of the application
     */
    main : function()
    {
      // Call super class
      this.base(arguments);

      var fontStyles = qx.theme.manager.Font.getInstance().resolve("default").getStyles();
      this._fontCss = qx.bom.element.Style.compile(fontStyles);

      var layout = new qx.ui.layout.Grid(5, 0);
      layout.setRowFlex(2, 1);
      layout.setColumnFlex(0, 1);
      layout.setColumnFlex(1, 1);
      layout.setColumnFlex(2, 1);
      layout.setColumnFlex(3, 1);

      var managers = [];

      var container = new qx.ui.container.Composite(layout);
      this.getRoot().add(container, {edge: 5});

      // Row selection
      container.add(new qx.ui.basic.Label("Row Selection").set({
        font: "bold",
        decorator: "table-scroller-header",
        padding: 3,
        allowGrowX: true
      }), {row: 1, column: 0});
      var scroller = this.createRowSelectionScroller();
      managers.push(scroller.getUserData("manager"));
      container.add(scroller, {row: 2, column: 0});

      // Column selection
      container.add(new qx.ui.basic.Label("Column Selection").set({
        font: "bold",
        decorator: "table-scroller-header",
        padding: 3,
        allowGrowX: true
      }), {row: 1, column: 1});
      var scroller = this.createColumnSelectionScroller();
      managers.push(scroller.getUserData("manager"));
      container.add(scroller, {row: 2, column: 1});

      // Cell rectangle selection
      container.add(new qx.ui.basic.Label("Cell Rectangle Selection").set({
        font: "bold",
        decorator: "table-scroller-header",
        padding: 3,
        allowGrowX: true
      }), {row: 1, column: 2});
      var scroller = this.createCellRectangleSelectionScroller();
      managers.push(scroller.getUserData("manager"));
      container.add(scroller, {row: 2, column: 2});

      // Cell line selection
      container.add(new qx.ui.basic.Label("Cell Line Selection").set({
        font: "bold",
        decorator: "table-scroller-header",
        padding: 3,
        allowGrowX: true
      }), {row: 1, column: 3});
      var scroller = this.createCellLineSelectionScroller();
      managers.push(scroller.getUserData("manager"));
      container.add(scroller, {row: 2, column: 3});


      // Controls
      var grid = new qx.ui.layout.Grid(20, 4);
      var controls = new qx.ui.container.Composite(grid).set({
        padding: 15,
        backgroundColor: "white"
      });
      container.add(controls, {row: 0, column: 0, colSpan: 4});

      controls.add(new qx.ui.basic.Label("Selection Mode").set({
        font: "bold",
        padding: 3
      }), {row: 0, column: 0});

      var mode1 = new qx.ui.form.RadioButton("Single Selection");
      mode1.setUserData("value", "single");
      controls.add(mode1, {row: 1, column: 0});

      var mode2 = new qx.ui.form.RadioButton("Multi Selection");
      mode2.setUserData("value", "multi");
      mode2.setValue(true);
      controls.add(mode2, {row: 2, column: 0});

      var mode3 = new qx.ui.form.RadioButton("Additive Selection");
      mode3.setUserData("value", "additive");
      controls.add(mode3, {row: 3, column: 0});

      var mode4 = new qx.ui.form.RadioButton("One Selection");
      mode4.setUserData("value", "one");
      controls.add(mode4, {row: 4, column: 0});

      var rbm1 = new qx.ui.form.RadioGroup(mode1, mode2, mode3, mode4);
      rbm1.addListener("changeSelection", function(e)
      {
        var value = e.getData()[0].getUserData("value");
        managers.forEach(function(manager) {
          manager.setMode(value);
        });

        if (value == "single" || value == "one")
        {
          dragCheck.setEnabled(false);
          quickCheck.setEnabled(true);
        }
        else if (value == "multi" || value == "addaptive")
        {
          dragCheck.setEnabled(true);
          quickCheck.setEnabled(false);
        }
      });


      controls.add(new qx.ui.basic.Label("Options").set({
        font: "bold",
        padding: 3
      }), {row: 0, column: 1});

      var dragCheck = new qx.ui.form.CheckBox("Enable drag selection");
      controls.add(dragCheck, {row: 1, column: 1});
      dragCheck.addListener("changeValue", function(e)
      {
        if (e.getData())
        {
          var mode = managers[0].getMode();
          if (mode == "single" || mode == "one") {
            this.debug("Drag selection is only available for the modes multi or additive");
          }
        }
        managers.forEach(function(manager) {
          manager.setDrag(e.getData());
        });
      });

      var quickCheck = new qx.ui.form.CheckBox("Enable quick selection").set({
        enabled : false
      });
      controls.add(quickCheck, {row: 2, column: 1});
      quickCheck.addListener("changeValue", function(e)
      {
        if (e.getData())
        {
          var mode = managers[0].getMode();
          if (mode == "multi" || mode == "additive") {
            this.debug("Quick selection is only available for the modes multi or additive");
          }
        }
        managers.forEach(function(manager) {
          manager.setQuick(e.getData());
        });
      });
    },


    createRowSelectionScroller : function()
    {
      var scroller = new qx.ui.virtual.core.Scroller(1000, 100, 20, 100);

      var rowLayer = new qx.ui.virtual.layer.Row("white", "#EEE");
      scroller.getPane().addLayer(rowLayer);

      scroller.getPane().addLayer(new qx.ui.virtual.layer.GridLines("horizontal"));

      var cellRenderer = new qx.ui.virtual.cell.Cell();
      var cellLayer = new qx.ui.virtual.layer.HtmlCell({
        getCellProperties : function(row, column)
        {
          var states = {};
          if (manager.isItemSelected(row)) {
            states.selected = true;
          }
          return cellRenderer.getCellProperties(row + " / " + column, states);
        }
      });
      scroller.getPane().addLayer(cellLayer);

      var manager = new qx.ui.virtual.selection.Row(scroller.getPane(), {
        styleSelectable : function(item, type, wasAdded)
        {
          if (type !== "selected") {
            return;
          }
          if (wasAdded) {
            rowLayer.setBackground(item, "selected");
          } else {
            rowLayer.setBackground(item, null);
          }
          cellLayer.updateLayerData();
        }
      });
      manager.attachMouseEvents(scroller.getPane());
      manager.attachKeyEvents(scroller);
      manager.set({
        mode: "multi"
      });
      manager.addItem(0);

      scroller.setUserData("manager", manager);

      return scroller;
    },


    createColumnSelectionScroller : function()
    {
      var scroller = new qx.ui.virtual.core.Scroller(1000, 100, 20, 100);

      scroller.getPane().addLayer(new qx.ui.virtual.layer.Row("white", "#EEE"));

      var columnLayer = new qx.ui.virtual.layer.Column();
      scroller.getPane().addLayer(columnLayer);

      scroller.getPane().addLayer(new qx.ui.virtual.layer.GridLines("horizontal"));

      var cellRenderer = new qx.ui.virtual.cell.Cell();
      var cellLayer = new qx.ui.virtual.layer.HtmlCell({
        getCellProperties : function(row, column)
        {
          var states = {};
          if (manager.isItemSelected(column)) {
            states.selected = true;
          }

          return cellRenderer.getCellProperties(row + " / " + column, states);
        }
      });
      scroller.getPane().addLayer(cellLayer);

      var manager = new qx.ui.virtual.selection.Column(scroller.getPane(), {
        styleSelectable : function(item, type, wasAdded)
        {
          if (type !== "selected") {
            return;
          }
          if (wasAdded) {
            columnLayer.setBackground(item, "selected");
          } else {
            columnLayer.setBackground(item, null);
          }
          cellLayer.updateLayerData();
        }
      });
      manager.attachMouseEvents(scroller.getPane());
      manager.attachKeyEvents(scroller);
      manager.set({
        mode: "multi"
      });
      manager.addItem(0);

      scroller.setUserData("manager", manager);

      return scroller;
    },


    createCellRectangleSelectionScroller : function()
    {
      var scroller = new qx.ui.virtual.core.Scroller(1000, 100, 20, 100);

      scroller.getPane().addLayer(new qx.ui.virtual.layer.Row("white", "#EEE"));

      var cellRenderer = new qx.ui.virtual.cell.Cell();
      var selectedCell = new qx.ui.virtual.cell.Cell().set({
        backgroundColor: "table-row-background-selected"
      });
      var cellLayer = new qx.ui.virtual.layer.HtmlCell({
        getCellProperties : function(row, column)
        {
          var states = {};
          if (manager.isItemSelected({row: row, column: column})) {
            states.selected = true;
          }

          if (states.selected) {
            return selectedCell.getCellProperties(row + " / " + column, states);
          } else {
            cellRenderer.resetBackgroundColor();
            return cellRenderer.getCellProperties(row + " / " + column, states);
          }
        }
      });
      scroller.getPane().addLayer(cellLayer);
      scroller.getPane().addLayer(new qx.ui.virtual.layer.GridLines("horizontal"));

      var manager = new qx.ui.virtual.selection.CellRectangle(scroller.getPane(), {
        styleSelectable : function(item, type, wasAdded) {
          cellLayer.updateLayerData();
        }
      });
      manager.attachMouseEvents(scroller.getPane());
      manager.attachKeyEvents(scroller);
      manager.set({
        mode: "multi"
      });
      manager.addItem({row: 0, column: 0});

      scroller.setUserData("manager", manager);

      return scroller;
    },


    createCellLineSelectionScroller : function()
    {
      var scroller = new qx.ui.virtual.core.Scroller(1000, 100, 20, 100);

      scroller.getPane().addLayer(new qx.ui.virtual.layer.Row("white", "#EEE"));
      var cellRenderer = new qx.ui.virtual.cell.Cell();
      var selectedCell = new qx.ui.virtual.cell.Cell().set({
        backgroundColor: "table-row-background-selected"
      });
      var cellLayer = new qx.ui.virtual.layer.HtmlCell({
        getCellProperties : function(row, column)
        {
          var states = {};
          if (manager.isItemSelected({row: row, column: column})) {
            states.selected = true;
          }

          if (states.selected) {
            return selectedCell.getCellProperties(row + " / " + column, states);
          } else {
            cellRenderer.resetBackgroundColor();
            return cellRenderer.getCellProperties(row + " / " + column, states);
          }
        }
      });
      scroller.getPane().addLayer(cellLayer);
      scroller.getPane().addLayer(new qx.ui.virtual.layer.GridLines("horizontal"));

      var manager = new qx.ui.virtual.selection.CellLines(scroller.getPane(), {
        styleSelectable : function(item, type, wasAdded) {
          cellLayer.updateLayerData();
        }
      });
      manager.attachMouseEvents(scroller.getPane());
      manager.attachKeyEvents(scroller);
      manager.set({
        mode: "multi"
      });
      manager.addItem({row: 0, column: 0});

      scroller.setUserData("manager", manager);

      return scroller;
    }
  }
});
