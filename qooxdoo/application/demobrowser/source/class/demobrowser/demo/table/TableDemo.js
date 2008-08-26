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

************************************************************************ */

/* ************************************************************************

#asset(qx/icon/${qx.icontheme}/16/apps/office-spreadsheet.png)
#asset(qx/icon/${qx.icontheme}/32/status/dialog-information.png)

************************************************************************ */

qx.Class.define("demobrowser.demo.table.TableDemo",
{
  extend : qx.application.Standalone,
  include : demobrowser.demo.table.MUtil,

  members :
  {
    main : function()
    {
      this.base(arguments);

      this._container = new qx.ui.window.Window(this.getCaption(), "icon/16/apps/office-spreadsheet.png").set({
        width: 600,
        height: 400,
        contentPadding : [ 0, 0, 0, 0 ],
        showClose: false,
        showMinimize: false
      });
      this._container.setLayout(new qx.ui.layout.VBox());
      this._container.open();

      this.getRoot().add(this._container, {left: 50, top: 10});

      this._table = this.createTable();
      this._controls = this.createControls();

      if (this._controls) {
        this._container.add(this._controls);
      }
      this._container.add(this._table, {flex: 1});
    },


    nextId : 0,
    createRandomRows : function(rowCount)
    {
      var rowData = [];
      var now = new Date().getTime();
      var dateRange = 400 * 24 * 60 * 60 * 1000; // 400 days
      for (var row = 0; row < rowCount; row++) {
        var date = new Date(now + Math.random() * dateRange - dateRange / 2);
        rowData.push([ this.nextId++, Math.random() * 10000, date, (Math.random() > 0.5) ]);
      }
      return rowData;
    },


    getCaption : function() {
      return "";
    },


    createTable : function() {
      throw new Error("abstract method call")
    },


    createControls : function() {
      return null;
    },


    showDialog : function(text)
    {
      if (!this.__dlg)
      {
        var dlg = this.__dlg = new qx.ui.window.Window().set({
          modal: true,
          showMinimize: false,
          showMaximize: false,
          width: 180,
          contentPadding: [10, 10, 10, 10]
        });
        dlg.moveTo(315, 100);

        var layout = new qx.ui.layout.Grid(15, 15);
        layout.setRowFlex(0, 1);
        layout.setColumnFlex(1, 1);
        dlg.setLayout(layout);

        dlg.add(
          new qx.ui.basic.Image("icon/32/status/dialog-information.png"),
          {row: 0, column: 0}
        );

        dlg.add(new qx.ui.basic.Label().set({
          rich: true,
          allowGrowY: true
        }), {row: 0, column: 1});

        var button = new qx.ui.form.Button("OK").set({
          alignX: "center",
          allowGrowX: false,
          padding: [2, 10]
        });
        button.addListener("execute", function(e) {
          dlg.close();
        }, this);
        dlg.add(button, {row: 1, column: 0, colSpan: 2});
      }

      this.__dlg.getChildren()[1].setContent(text);
      this.__dlg.open();
      this.__dlg.getChildren()[2].focus();
    }
  },


  destruct : function() {
    this._disposeFields("_table", "_controls", "_container");
  }
});

