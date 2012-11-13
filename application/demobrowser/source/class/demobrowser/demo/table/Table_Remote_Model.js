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
     * Tobias Oetiker

************************************************************************ */

/* ************************************************************************

#asset(qx/icon/${qx.icontheme}/22/actions/view-refresh.png)

************************************************************************ */

/**
 * Table using the Remote table model. For this demo, a modified Remote model is
 * used that generates row data itself instead of making calls to a backend.
 * @tag noPlayground
 */
qx.Class.define("demobrowser.demo.table.Table_Remote_Model",
{
  extend : demobrowser.demo.table.TableDemo,

  construct : function()
  {
    this.base(arguments);
    this.__timer = new qx.event.Timer(1000);
  },

  members :
  {
    __timer : null,

    createTable: function()
    {
      var tableModel = this._tableModel = new demobrowser.demo.table.RemoteTableModel();
      var custom = {
        tableColumnModel : function(obj) {
          return new qx.ui.table.columnmodel.Resize(obj);
        }
      };

      this.__timer.addListener("interval", tableModel.reloadData, tableModel);


      var table = new qx.ui.table.Table(tableModel,custom);
      var col = table.getTableColumnModel().getBehavior();
      col.setWidth(0,'10%');
      col.setWidth(1,'90%');

      return table;
    },

    createControls: function()
    {
      var bar = new qx.ui.toolbar.ToolBar();
      var part = new qx.ui.toolbar.Part();
      bar.add(part);

      var reload = new qx.ui.toolbar.Button('Reload', "icon/22/actions/view-refresh.png");
      reload.addListener('execute',function(){
        this._tableModel.reloadData();
      }, this);
      part.add(reload);

      var poll = new qx.ui.toolbar.CheckBox('Poll');
      poll.addListener("execute", function() {
        if (poll.getValue()) {
          this.__timer.start();
        } else {
          this.__timer.stop();
        }
      }, this);
      part.add(poll);

      // disable the reload button on poll
      poll.bind("value", reload, "enabled", {converter : function(data) {return !data;}});

      return bar;
    }
  }
});