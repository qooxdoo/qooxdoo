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
qx.Class.define("qx.ui.table.cellrenderer.Abstract",
{
  type : "abstract",
  extend : qx.ui.table.cellrenderer.Basic,




  /*
  *****************************************************************************
     STATICS
  *****************************************************************************
  */

  statics :
  {
    MAIN_DIV_START                : '<div style="',
    MAIN_DIV_START_END            : '">',
    MAIN_DIV_END                  : '</div>',

    /** main style */
    MAIN_DIV_STYLE                : ';overflow:hidden;white-space:nowrap;border-right:1px solid #eeeeee;border-bottom:1px solid #eeeeee;padding-left:2px;padding-right:2px;cursor:default' + (qx.core.Variant.isSet("qx.client", "mshtml") ? '' : ';-moz-user-select:none;'),

    ARRAY_JOIN_MAIN_DIV_LEFT      : '<div style="position:absolute;left:',
    ARRAY_JOIN_MAIN_DIV_WIDTH     : 'px;top:0px;width:',
    ARRAY_JOIN_MAIN_DIV_HEIGHT    : 'px;height:',
    ARRAY_JOIN_MAIN_DIV_START_END : '">',
    ARRAY_JOIN_MAIN_DIV_END       : '</div>',

    TABLE_TD                      : '<td style="height:',
    TABLE_TD_END                  : '</td>'
  },




  /*
  *****************************************************************************
     MEMBERS
  *****************************************************************************
  */

  members :
  {
    // overridden
    /**
     * TODOC
     *
     * @type member
     * @param cellInfo {var} TODOC
     * @return {var} TODOC
     */
    createDataCellHtml : function(cellInfo)
    {
      var AbstractDataCellRenderer = qx.ui.table.cellrenderer.Abstract;
      return AbstractDataCellRenderer.MAIN_DIV_START + this._getCellStyle(cellInfo) + AbstractDataCellRenderer.MAIN_DIV_START_END + this._getContentHtml(cellInfo) + AbstractDataCellRenderer.MAIN_DIV_END;
    },

    // overridden
    /**
     * TODOC
     *
     * @type member
     * @param cellInfo {var} TODOC
     * @param cellElement {var} TODOC
     * @return {void}
     */
    updateDataCellElement : function(cellInfo, cellElement) {
      cellElement.innerHTML = this._getContentHtml(cellInfo);
    },


    /**
     * Returns the CSS styles that should be applied to the main div of this cell.
     *
     * @type member
     * @param cellInfo {Map} The information about the cell.
     *          See {@link #createDataCellHtml}.
     * @return {var} the CSS styles of the main div.
     */
    _getCellStyle : function(cellInfo) {
      return cellInfo.style + qx.ui.table.cellrenderer.Abstract.MAIN_DIV_STYLE;
    },


    /**
     * Returns the HTML that should be used inside the main div of this cell.
     *
     * @type member
     * @param cellInfo {Map} The information about the cell.
     *          See {@link #createDataCellHtml}.
     * @return {String} the inner HTML of the main div.
     */
    _getContentHtml : function(cellInfo) {
      return cellInfo.value;
    },


    /**
     * TODOC
     *
     * @type member
     * @param cellInfo {var} TODOC
     * @param htmlArr {var} TODOC
     * @return {void}
     */
    createDataCellHtml_array_join : function(cellInfo, htmlArr)
    {
      var AbstractDataCellRenderer = qx.ui.table.cellrenderer.Abstract;

      if (qx.ui.table.pane.Pane.USE_TABLE)
      {
        htmlArr.push(AbstractDataCellRenderer.TABLE_TD);
        htmlArr.push(cellInfo.styleHeight);
        htmlArr.push("px");
      }
      else
      {
        htmlArr.push(AbstractDataCellRenderer.ARRAY_JOIN_MAIN_DIV_LEFT);
        htmlArr.push(cellInfo.styleLeft);
        htmlArr.push(AbstractDataCellRenderer.ARRAY_JOIN_MAIN_DIV_WIDTH);
        htmlArr.push(cellInfo.styleWidth);
        htmlArr.push(AbstractDataCellRenderer.ARRAY_JOIN_MAIN_DIV_HEIGHT);
        htmlArr.push(cellInfo.styleHeight);
        htmlArr.push("px");
      }

      this._createCellStyle_array_join(cellInfo, htmlArr);

      htmlArr.push(AbstractDataCellRenderer.ARRAY_JOIN_MAIN_DIV_START_END);

      this._createContentHtml_array_join(cellInfo, htmlArr);

      if (qx.ui.table.pane.Pane.USE_TABLE) {
        htmlArr.push(AbstractDataCellRenderer.TABLE_TD_END);
      } else {
        htmlArr.push(AbstractDataCellRenderer.ARRAY_JOIN_MAIN_DIV_END);
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
    _createCellStyle_array_join : function(cellInfo, htmlArr) {
      htmlArr.push(qx.ui.table.cellrenderer.Abstract.MAIN_DIV_STYLE);
    },


    /**
     * TODOC
     *
     * @type member
     * @param cellInfo {var} TODOC
     * @param htmlArr {var} TODOC
     * @return {void}
     */
    _createContentHtml_array_join : function(cellInfo, htmlArr) {
      htmlArr.push(cellInfo.value);
    }
  }
});
