/* ************************************************************************

   qooxdoo - the new era of web development

   http://qooxdoo.org

   Copyright:
     2006 STZ-IDA, Germany, http://www.stz-ida.de

   License:
     MIT: https://opensource.org/licenses/MIT
     See the LICENSE file in the project's top-level directory for details.

   Authors:
     * Til Schneider (til132)
     * Fabian Jakobs (fjakobs)

************************************************************************ */

/**
 * An abstract data cell renderer that does the basic coloring
 * (borders, selected look, ...).
 *
 * @require(qx.bom.Stylesheet)
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
      cr.__clazz = this.self(arguments);
      this._createStyleSheet();

      // add dynamic theme listener
      if (qx.core.Environment.get("qx.dyntheme")) {
        qx.theme.manager.Meta.getInstance().addListener(
          "changeTheme", this._onChangeTheme, this
        );
      }
    }
  },


  properties :
  {
    /**
     * The default cell style. The value of this property will be provided
     * to the cell renderer as cellInfo.style.
     */
    defaultCellStyle :
    {
      init : null,
      check : "String",
      nullable : true
    }
  },


  members :
  {
    /**
     * Handler for the theme change.
     * @signature function()
     */
    _onChangeTheme : qx.core.Environment.select("qx.dyntheme",
    {
      "true" : function() {
        qx.bom.Stylesheet.removeAllRules(
          qx.ui.table.cellrenderer.Abstract.__clazz.stylesheet
        );
        this._createStyleSheet();
      },
      "false" : null
    }),


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
     * Creates the style sheet used for the table cells.
     */
    _createStyleSheet : function() {
      var colorMgr = qx.theme.manager.Color.getInstance();
      var stylesheet =
        ".qooxdoo-table-cell {" +
        qx.bom.element.Style.compile(
        {
          position : "absolute",
          top: "0px",
          overflow: "hidden",
          whiteSpace : "nowrap",
          borderRight : "1px solid " + colorMgr.resolve("table-column-line"),
          padding : "0px 6px",
          cursor : "default",
          textOverflow : "ellipsis",
          userSelect : "none"
        }) +
        "} " +
        ".qooxdoo-table-cell-right { text-align:right } " +
        ".qooxdoo-table-cell-italic { font-style:italic} " +
        ".qooxdoo-table-cell-bold { font-weight:bold } ";

      if (qx.core.Environment.get("css.boxsizing")) {
        stylesheet += ".qooxdoo-table-cell {" + qx.bom.element.BoxSizing.compile("content-box") + "}";
      }

      qx.ui.table.cellrenderer.Abstract.__clazz.stylesheet =
        qx.bom.Stylesheet.createElement(stylesheet);
    },


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
     *          See {@link qx.ui.table.cellrenderer.Abstract#createDataCellHtml}.
     * @return {var} the CSS styles of the main div.
     */
    _getCellStyle : function(cellInfo) {
      return cellInfo.style || "";
    },


   /**
     * Retrieve any extra attributes the cell renderer wants applied to this
     * cell.
     *
     * @param cellInfo {Map} The information about the cell.
     *          See {@link qx.ui.table.cellrenderer.Abstract#createDataCellHtml}.
     *
     * @return {String}
     *   The extra attributes to be applied to this cell.
     */
    _getCellAttributes : function(cellInfo)
    {
      return "";
    },


    /**
     * Returns the HTML that should be used inside the main div of this cell.
     *
     * This method may be overridden by sub classes.
     *
     * @param cellInfo {Map} The information about the cell.
     *          See {@link qx.ui.table.cellrenderer.Abstract#createDataCellHtml}.
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
      if (qx.core.Environment.get("css.boxmodel") == "content")
      {
        width -= insetX;
        height -= insetY;
      }

      style += "width:" + Math.max(width, 0) + "px;";
      style += "height:" + Math.max(height, 0) + "px;";

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
        this._getCellStyle(cellInfo), '" ',
        this._getCellAttributes(cellInfo),
        '>' +
        this._getContentHtml(cellInfo),
        '</div>'
      );
    }

  },


  destruct : function() {
    // remove dynamic theme listener
    if (qx.core.Environment.get("qx.dyntheme")) {
      qx.theme.manager.Meta.getInstance().removeListener(
        "changeTheme", this._onChangeTheme, this
      );
    }
  }
});
