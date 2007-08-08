/* ************************************************************************

   qooxdoo - the new era of web development

   http://qooxdoo.org

   Copyright:
     2006 STZ-IDA, Germany, http://www.stz-ida.de

   License:
     LGPL: http://www.gnu.org/licenses/lgpl.html
     EPL: http://www.eclipse.org/org/documents/epl-v10.php
     See the LICENSE file in the project's top-level directory for details.

   Authors:
     * Til Schneider (til132)

************************************************************************ */

/* ************************************************************************

#module(ui_table)

************************************************************************ */

/**
 * An abstract data cell renderer that does the basic coloring
 * (borders, selected look, ...).
 */
qx.Class.define("qx.ui.table2.cellrenderer.Abstract",
{
  type : "abstract",
  implement : qx.ui.table2.cellrenderer.ICellRenderer,
  extend : qx.core.Object,

  construct : function() {
    var clazz = this.self(arguments);
    if (!clazz.stylesheet)
    {
      clazz.stylesheet = qx.html.StyleSheet.createElement(
        ".qooxdoo-table-cell-abstract {" +
        "  overflow:hidden;" +
        "  white-space:nowrap;" +
        "  border-right:1px solid #eeeeee;" +
        "  border-bottom:1px solid #eeeeee;" +
        "  padding-left:2px;" +
        "  padding-right:2px;" +
        "  cursor:default;" +
        (qx.core.Variant.isSet("qx.client", "mshtml") ? '' : ';-moz-user-select:none;') +
        "}"
      );
    }
  },


  /*
  *****************************************************************************
     STATICS
  *****************************************************************************
  */

  statics :
  {
    /** main style */
    TABLE_TD                      : '<td class="qooxdoo-table-cell-abstract" style="', //'<td style="height:',
    TABLE_TD_END                  : '</td>'
  },




  /*
  *****************************************************************************
     MEMBERS
  *****************************************************************************
  */

  members :
  {
    /**
     * Returns the CSS styles that should be applied to the main div of this cell.
     *
     * @type member
     * @param cellInfo {Map} The information about the cell.
     *          See {@link #createDataCellHtml}.
     * @return {var} the CSS styles of the main div.
     */
    _getCellStyle : function(cellInfo, htmlArr)
    {
      if (cellInfo.style) {
        htmlArr.push(cellInfo.style);
      };
    },


    /**
     * Returns the HTML that should be used inside the main div of this cell.
     *
     * @type member
     * @param cellInfo {Map} The information about the cell.
     *          See {@link #createDataCellHtml}.
     * @return {String} the inner HTML of the main div.
     */
    _getContentHtml : function(cellInfo, htmlArr)
    {
      if (cellInfo.value) {
        htmlArr.push(cellInfo.value);
      }
    },


    /**
     * TODOC
     *
     * @type member
     * @param cellInfo {var} TODOC
     * @param htmlArr {var} TODOC
     * @return {void}
     */
    createDataCellHtml : function(cellInfo, htmlArr)
    {
      var AbstractDataCellRenderer = qx.ui.table2.cellrenderer.Abstract;
      htmlArr.push(AbstractDataCellRenderer.TABLE_TD);
      this._getCellStyle(cellInfo, htmlArr)
      htmlArr.push('">');
      this._getContentHtml(cellInfo, htmlArr);
      htmlArr.push(AbstractDataCellRenderer.TABLE_TD_END);
    }

  }
});
