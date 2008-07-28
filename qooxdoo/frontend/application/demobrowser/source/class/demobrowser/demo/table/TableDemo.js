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
      //qx.theme.manager.Meta.getInstance().setTheme(qx.theme.Modern);

      this._container = new qx.ui.window.Window(this.getCaption(), "icon/16/apps/office-spreadsheet.png").set({
        width: 600,
        height: 400,
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
    }
  }
});

