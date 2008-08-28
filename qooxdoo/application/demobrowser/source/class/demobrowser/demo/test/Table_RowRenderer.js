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

qx.Class.define("demobrowser.demo.test.Table_RowRenderer",
{
  extend : qx.application.Native,
  include : [demobrowser.demo.table.MUtil],

  members :
  {
    main: function()
    {
      this.base(arguments);
      qx.theme.manager.Meta.getInstance().initialize();

      this.setUp();
      this.testDefaultRenderer();
    },


    setUp : function()
    {
      // table mock
      this.tableMock = this.getTableMock();
    },


    testDefaultRenderer : function(renderer)
    {
      var renderer = new qx.ui.table.rowrenderer.Default();
      var width = 300;
      var height = 20;

      var rowDataOptions =
      {
        focusedRow : [true, false],
        selected : [true, false],
        row : [1,2],
        table : [this.tableMock]
      }

      var container = this._getNewTableDiv(width)
      var top = 0;
      var self = this;
      this.permute(rowDataOptions, function(rowInfo)
      {
        var content = [];
        for (var key in rowInfo) {
          if (key !== "table") {
            content.push(key + ": " + rowInfo[key]);
          }
        }
        content = content.join(", ");

        // update
        var row = self._createRowElement(container, width, height);
        var rowClass = renderer.getRowClass(rowInfo);
        if (rowClass) {
          row.className =  rowClass;
        }
        row.innerHTML = content + " (update)";
        renderer.updateDataRowElement(rowInfo, row);

        // init
        rowHtml = [];
        rowHtml.push('<div ');

        if (rowClass) {
          rowHtml.push('class="', rowClass, '" ');
        }

        var rowStyle = renderer.createRowStyle(rowInfo);
        rowStyle += ";position:relative;height:" + height + "px; width:" + width + "px;";
        if (rowStyle) {
          rowHtml.push('style="', rowStyle, '" ');
        }
        rowHtml.push('>', content, ' (init)</div>');
        container.innerHTML += rowHtml.join("");
        self._rowTop += height;

      });
    },


    _rowTop : 0,
    _createRowElement : function(parent, width, height)
    {
      var div = qx.bom.Element.create("div");
      qx.bom.element.Style.setStyles(div, {
        position : "relative",
        width: width + "px",
        height: height + "px"
      });
      this._rowTop += 20;
      parent.appendChild(div);
      return div;
    }
  }
});