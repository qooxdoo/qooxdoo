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

/* ************************************************************************

#asset(custom/*)

************************************************************************ */

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

      // Cell selection
      container.add(new qx.ui.basic.Label("Cell Selection").set({
        font: "bold",
        decorator: "table-scroller-header",
        padding: 3,
        allowGrowX: true
      }), {row: 1, column: 2});
      var scroller = this.createCellSelectionScroller();
      managers.push(scroller.getUserData("manager"));
      container.add(scroller, {row: 2, column: 2});
      
      
      // Controls
      var grid = new qx.ui.layout.Grid(20, 4);
      var controls = new qx.ui.container.Composite(grid).set({
        padding: 15,
        backgroundColor: "white"
      });
      container.add(controls, {row: 0, column: 0, colSpan: 3});
      
      controls.add(new qx.ui.basic.Label("Selection Mode").set({
        font: "bold",
        padding: 3
      }), {row: 0, column: 0});
      
      var mode1 = new qx.ui.form.RadioButton("Single Selection");
      mode1.setValue("single");
      controls.add(mode1, {row: 1, column: 0});
      
      var mode2 = new qx.ui.form.RadioButton("Multi Selection");
      mode2.setValue("multi");
      mode2.setChecked(true);
      controls.add(mode2, {row: 2, column: 0});
      
      var mode3 = new qx.ui.form.RadioButton("Additive Selection");
      mode3.setValue("additive");
      controls.add(mode3, {row: 3, column: 0});
      
      var mode4 = new qx.ui.form.RadioButton("One Selection");
      mode4.setValue("one");
      controls.add(mode4, {row: 4, column: 0});

      var rbm1 = new qx.ui.form.RadioGroup(mode1, mode2, mode3, mode4);      
      rbm1.addListener("changeValue", function(e)
      {
        var value = e.getData();        
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
      dragCheck.addListener("changeChecked", function(e)
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
      quickCheck.addListener("changeChecked", function(e)
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
      scroller.pane.addLayer(rowLayer);
      
      scroller.pane.addLayer(new qx.ui.virtual.layer.GridLines("horizontal"));
      
      var cellLayer = new qx.ui.virtual.layer.HtmlCell({
        getCellHtml : function(row, column, left, top, width, height)
        {    
          if (manager.isItemSelected(row)) {
            var color = "color: white;"
          } else {
            color = ""
          }
        
          var html = [
            "<div style='position:absolute;",
            "left:", left, "px;",
            "top:", top, "px;",
            "width:", width, "px;",
            "height:", height, "px;",
            color,
            this._fontCss,
            "'>",
            column, "x", row,
            "</div>"                 
          ];
          return html.join("");
        }          
      });      
      scroller.pane.addLayer(cellLayer);
      
      var manager = new qx.ui.virtual.selection.Row(scroller.pane, {
        styleSelectable : function(item, type, wasAdded)
        {
          if (type !== "selected") {
            return;
          }
          if (wasAdded) {
            rowLayer.setColor(item, "#00398D");
          } else {
            rowLayer.setColor(item, null);
          }
          qx.ui.core.queue.Widget.add(cellLayer);
        }
      });
      manager.attachMouseEvents(scroller.pane);
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
      
      scroller.pane.addLayer(new qx.ui.virtual.layer.Row("white", "#EEE"));
      
      var columnLayer = new qx.ui.virtual.layer.Column();
      scroller.pane.addLayer(columnLayer);
      
      scroller.pane.addLayer(new qx.ui.virtual.layer.GridLines("horizontal"));
      
      var cellLayer = new qx.ui.virtual.layer.HtmlCell({
        getCellHtml : function(row, column, left, top, width, height)
        {    
          if (manager.isItemSelected(column)) {
            var color = "color: white;"
          } else {
            color = ""
          }
        
          var html = [
            "<div style='position:absolute;",
            "left:", left, "px;",
            "top:", top, "px;",
            "width:", width, "px;",
            "height:", height, "px;",
            color,
            this._fontCss,
            "'>",
            column, "x", row,
            "</div>"                 
          ];
          return html.join("");
        }          
      });      
      scroller.pane.addLayer(cellLayer);
      
      var manager = new qx.ui.virtual.selection.Column(scroller.pane, {
        styleSelectable : function(item, type, wasAdded)
        {
          if (type !== "selected") {
            return;
          }
          if (wasAdded) {
            columnLayer.setColor(item, "#00398D");
          } else {
            columnLayer.setColor(item, null);
          }          
          qx.ui.core.queue.Widget.add(cellLayer);
        }
      });
      manager.attachMouseEvents(scroller.pane);
      manager.attachKeyEvents(scroller);
      manager.set({
        mode: "multi"
      });
      manager.addItem(0);
      
      scroller.setUserData("manager", manager);
      
      return scroller;
    },
    
    
    createCellSelectionScroller : function()
    {
      var scroller = new qx.ui.virtual.core.Scroller(1000, 100, 20, 100);
      
      scroller.pane.addLayer(new qx.ui.virtual.layer.Row("white", "#EEE"));            
      var cellLayer = new qx.ui.virtual.layer.HtmlCell({
        getCellHtml : function(row, column, left, top, width, height)
        {    
          if (manager.isItemSelected({row: row, column: column})) {
            var color = "color: white; background-color: #00398D;"
          } else {
            color = ""
          }
        
          var html = [
            "<div style='position:absolute;",
            "left:", left, "px;",
            "top:", top, "px;",
            "width:", width, "px;",
            "height:", height, "px;",
            color,
            this._fontCss,
            "'>",
            column, "x", row,
            "</div>"                 
          ];
          return html.join("");
        }          
      });      
      scroller.pane.addLayer(cellLayer);
      scroller.pane.addLayer(new qx.ui.virtual.layer.GridLines("horizontal"));
      
      var manager = new qx.ui.virtual.selection.Cell(scroller.pane, {
        styleSelectable : function(item, type, wasAdded) {
          qx.ui.core.queue.Widget.add(cellLayer);
        }
      });
      manager.attachMouseEvents(scroller.pane);
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
