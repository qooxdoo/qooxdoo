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
     * martinwittemann (martinwittemann)

************************************************************************ */
/* ************************************************************************

#asset(demobrowser/backend/remote_table.php)

************************************************************************ */

qx.Class.define('demobrowser.demo.table.RemoteTableModel', {

  extend : qx.ui.table.model.Remote,

  construct : function() {
    this.base(arguments);
    this.setColumns(["Id","Text"],["id","text"]);
  },

  members : {
    __PHPSupported : null,
    __checkingForPHP : false,

     // overloaded - called whenever the table requests the row count
    _loadRowCount : function()
    {
      this.__checkPHP();
      if (this.__checkingForPHP) {
        return;
      }

      if (this.__PHPSupported) {
        this.__loadPHPRowCount();
      } else {
        this.__setRowCount();
      }
    },


    _loadRowData : function(firstRow, lastRow)
    {
      this.__checkPHP();
      if (this.__checkingForPHP) {
        return;
      }

      if (this.__PHPSupported) {
        this.__loadPHPRowData(firstRow, lastRow);
      } else {
        this.__rowDataLoadded(firstRow, lastRow);
      }
    },


    // Server communication

    __checkPHP : function() {
      if (this.__checkingForPHP || this.__PHPSupported !== null) {
        return;
      }

      this.__checkingForPHP = true;

      this.__call("method=checkphp", function(data) {
        this.__checkingForPHP = false;
        this.__PHPSupported = (data == "WTF PHP");
        this._loadRowCount();
      });
    },


    __loadPHPRowCount : function() {
      var param = "method=getRowCount";
      this.__call(param, function(data) {
        this._onRowCountLoaded(parseInt(data));
      });
    },

    __loadPHPRowData : function(firstRow, lastRow) {
      var param = "method=getRowData&start=" + firstRow + "&end=" + lastRow;
      this.__call(param, function(data) {
        this._onRowDataLoaded(qx.lang.Json.parse(data));
      });
    },


    __call : function(param, callback) {
      var req = new qx.io.request.Xhr();
      req.setUrl("../../resource/demobrowser/backend/remote_table.php?" + param);
      req.addListener("success", function() {
        callback.call(this, req.getResponseText())
      }, this);
      req.send();
    },


    // Fake the server localy

    __setRowCount : function() {
      var self = this;
      window.setTimeout(function() {
        self._onRowCountLoaded(1000000);
      }, 0);
    },


    __rowDataLoadded : function(firstRow, lastRow) {
      var self = this;
      window.setTimeout(function() {
        var data = [];
        for (var i=firstRow;i<=lastRow;i++){
          data.push({id:i,text:'Hello '+i+' Generated on:'+(new Date())});
        }
        self._onRowDataLoaded(data);
      }, 0);
    }
  }
});
