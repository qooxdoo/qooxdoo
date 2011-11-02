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

  members :
  {

    createTable: function()
    {
      var tableModel = this._tableModel = new demobrowser.demo.table.RemoteTableModel();
      var custom = {
        tableColumnModel : function(obj) {
          return new qx.ui.table.columnmodel.Resize(obj);
        }
      };

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

      return bar;
    }

  }
});

