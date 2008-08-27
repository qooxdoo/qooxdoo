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
     * Fabian Jakobs (fjakobs)

************************************************************************ */

/* ************************************************************************

#require(qx.bom.Stylesheet)

************************************************************************ */

/**
 * An abstract data cell renderer that does the basic coloring
 * (borders, selected look, ...).
 */
qx.Class.define("qx.ui.table.cellrenderer.Abstract",
{
  type : "abstract",
  implement : qx.ui.table.ICellRenderer,
  extend : qx.core.Object,

  construct : function()
  {
    this.base(arguments);

    var cr = qx.ui.table.cellrenderer.Abstract;
    if (!cr.__clazz)
    {
      var colorMgr = qx.theme.manager.Color.getInstance();
      cr.__clazz = this.self(arguments);
      var stylesheet =
        ".qooxdoo-table-cell {" +
        qx.bom.element.Style.compile(
        {
          position : "absolute",
          top: "0px",
          overflow: "hidden",
          whiteSpace : "nowrap",
          borderRight : "1px solid " + colorMgr.resolve("table-row-line"),
          padding : "0px 6px",
          cursor : "default",
          textOverflow : "ellipsis",
          userSelect : "none"
        }) +
        "} " +
        ".qooxdoo-table-cell-right { text-align:right } " +
        ".qooxdoo-table-cell-italic { font-style:italic} " +
        ".qooxdoo-table-cell-bold { font-weight:bold } ";

      if (!qx.core.Variant.isSet("qx.client", "mshtml")) {
        stylesheet += ".qooxdoo-table-cell {" + qx.bom.element.BoxSizing.compile("content-box") + "}";
      }

      cr.__clazz.stylesheet = qx.bom.Stylesheet.createElement(stylesheet);
    }
  },


  members :
  {
    /**
     * the sum of the horizontal insets. This is needed to compute the box model
     * independent size
     */
    _insetX : 6+6+1, // paddingLeft + paddingRight + borderRight

    /**
     * the sum of the vertical insets. This is needed to compute the box model
     * independent size
     */
    _insetY : 0,



    /**
     * Get a string of the cell element's HTML classes.
     *
     * This method may be overridden by sub classes.
     *
     * @param cellInfo {Map} cellInfo of the cell
     * @return {String} The table cell HTML classes as string.
     */
    _getCellClass : function(cellInfo) {
      return "qooxdoo-table-cell";
    },


    /**
     * Returns the CSS styles that should be applied to the main div of this
     * cell.
     *
     * This method may be overridden by sub classes.
     *
     * @param cellInfo {Map} The information about the cell.
     *          See {@link #createDataCellHtml}.
     * @return {var} the CSS styles of the main div.
     */
    _getCellStyle : function(cellInfo) {
      return cellInfo.style || "";
    },


    /**
     * Returns the HTML that should be used inside the main div of this cell.
     *
     * This method may be overridden by sub classes.
     *
     * @param cellInfo {Map} The information about the cell.
     *          See {@link #createDataCellHtml}.
     * @return {String} the inner HTML of the cell.
     */
    _getContentHtml : function(cellInfo) {
      return cellInfo.value || "";
    },


    /**
     * Get the cell size taking the box model into account
     *
     * @param width {Integer} The cell's (border-box) width in pixel
     * @param height {Integer} The cell's (border-box) height in pixel
     * @param insetX {Integer} The cell's horizontal insets, i.e. the sum of
     *    horizontal paddings and borders
     * @param insetY {Integer} The cell's vertical insets, i.e. the sum of
     *    vertical paddings and borders
     * @return {String} The CSS style string for the cell size
     */
    _getCellSizeStyle : function(width, height, insetX, insetY)
    {
      var style = "";
      if (qx.bom.client.Feature.CONTENT_BOX)
      {
        width -= insetX;
        height -= insetY;
      }

      style += "width:" +  width + "px;";
      style += "height:" + height + "px;";

      return style;
    },


    // interface implementation
    createDataCellHtml : function(cellInfo, htmlArr)
    {
      htmlArr.push(
        '<div class="',
        this._getCellClass(cellInfo),
        '" style="',
        'left:', cellInfo.styleLeft, 'px;',
        this._getCellSizeStyle(cellInfo.styleWidth, cellInfo.styleHeight, this._insetX, this._insetY),
        this._getCellStyle(cellInfo),
        '">' +
        this._getContentHtml(cellInfo),
        '</div>'
      );
    }

  }
});
