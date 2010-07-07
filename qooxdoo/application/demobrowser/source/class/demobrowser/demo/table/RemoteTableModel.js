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

qx.Class.define('demobrowser.demo.table.RemoteTableModel', {

  extend : qx.ui.table.model.Remote,

  construct : function() {
    this.base(arguments);
    this.setColumns(["Id","Text"],["id","text"]);
  },

  members : {

     // overloaded - called whenever the table requests the row count
    _loadRowCount : function()
    {
      this._onRowCountLoaded(1000000);
    },

    _loadRowData : function(firstRow, lastRow)
    {
      var data = [];
      for (var i=firstRow;i<=lastRow;i++){
        data.push({id:i,text:'Hello '+i+' Generated on:'+(new Date())});
      }
      this._onRowDataLoaded(data);
    }
  }
});
