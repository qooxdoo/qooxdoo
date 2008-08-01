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
#require(qx.legacy.html.StyleSheet)

************************************************************************ */

/**
 * An abstract data cell renderer that does the basic coloring
 * (borders, selected look, ...).
 */
qx.Class.define("qx.legacy.ui.table.cellrenderer.Abstract",
{
  type : "abstract",
  implement : qx.legacy.ui.table.ICellRenderer,
  extend : qx.core.Object,

  construct : function() {
    var cr = qx.legacy.ui.table.cellrenderer.Abstract;
    if (!cr.__clazz)
    {
      cr.__clazz = this.self(arguments);
      var stylesheet =
        ".qooxdoo-table-cell {" +
        cr.__tableCellStyleSheet +
        "} " +
        ".qooxdoo-table-cell-right {" +
        cr.__tableCellRightStyleSheet +
        "} " +
        ".qooxdoo-table-cell-italic {" +
        cr.__tableCellItalicStyleSheet +
        "} " +
        ".qooxdoo-table-cell-bold {" +
        cr.__tableCellBoldStyleSheet +
        "} ";
      cr.__clazz.stylesheet = qx.legacy.html.StyleSheet.createElement(stylesheet);
    }
  },


  statics :
  {
    __clazz : null,

    __tableCellStyleSheet :
      "position:absolute;" +
      "top:0px;" +
      "height:100%;" +
      "overflow:hidden;" +
      "white-space:nowrap;" +
      "border-right:1px solid #eeeeee;" +
      "border-bottom:1px solid #eeeeee;" +
      "padding:0px 6px;" +
      "cursor:default;" +

      // (deal text overflow)
      // http://www.css3.info/preview/text-overflow/
      (qx.core.Variant.isSet("qx.client", "mshtml|webkit") ? " text-overflow:ellipsis;" : "") +
      (qx.core.Variant.isSet("qx.client", "opera") ? " -o-text-overflow:ellipsis;" : "") +

      // (avoid text selection)
      // http://www.xulplanet.com/references/elemref/ref_StyleProperties.html
      (qx.core.Variant.isSet("qx.client", "gecko") ? " -moz-user-select:none;" : "") +
      // http://www.colorjack.com/software/dhtml+color+picker.html
      (qx.core.Variant.isSet("qx.client", "khtml") ? " -khtml-user-select:none;" : "") +

      // (deal text overflow)
      // http://www.css3.info/preview/text-overflow/
      (qx.core.Variant.isSet("qx.client", "mshtml|webkit") ? " text-overflow:ellipsis;" : "") +
      (qx.core.Variant.isSet("qx.client", "opera") ? " -o-text-overflow:ellipsis;" : "") +

      // (avoid text selection)
      // http://www.xulplanet.com/references/elemref/ref_StyleProperties.html
      (qx.core.Variant.isSet("qx.client", "gecko") ? " -moz-user-select:none;" : "") +
      // http://www.colorjack.com/software/dhtml+color+picker.html
      (qx.core.Variant.isSet("qx.client", "khtml") ? " -khtml-user-select:none;" : ""),


    __tableCellRightStyleSheet :
      "text-align:right;",

    __tableCellItalicStyleSheet :
      "font-style:italic;",

    __tableCellBoldStyleSheet :
      "font-weight:bold;",


    /**
     * Get the current standard cell style settings for table cells.
     */
    getTableCellStyleSheet : function(style)
    {
      return qx.legacy.ui.table.cellrenderer.Abstract.__tableCellStyleSheet;
    },

    /**
     * Set the standard cell style settings for table cells.
     */
    setTableCellStyleSheet : function(style)
    {
      var cr = qx.legacy.ui.table.cellrenderer.Abstract;
      if (cr.__clazz)
      {
        qx.legacy.html.StyleSheet.removeRule(cr.__clazz.stylesheet,
                                      ".qooxdoo-table-cell");
        cr.__tableCellStyleSheet = style;
        qx.legacy.html.StyleSheet.addRule(cr.__clazz.stylesheet,
                                   ".qooxdoo-table-cell",
                                   cr.__tableCellStyleSheet);
      }
      else
      {
        cr.__tableCellStyleSheet = style;
      }
    },

    /**
     * Get the current right-align cell style settings for table cells.
     */
    getTableCellRightStyleSheet : function(style)
    {
      return qx.legacy.ui.table.cellrenderer.Abstract.__tableCellRightStyleSheet;
    },

    /**
     * Set the right-align cell style settings for table cells.
     */
    setTableCellRightStyleSheet : function(style)
    {
      var cr = qx.legacy.ui.table.cellrenderer.Abstract;
      if (cr.__clazz)
      {
        qx.legacy.html.StyleSheet.removeRule(cr.__clazz.stylesheet,
                                      ".qooxdoo-table-cell-right");
        cr.__tableCellRightStyleSheet = style;
        qx.legacy.html.StyleSheet.addRule(cr.__clazz.stylesheet,
                                   ".qooxdoo-table-cell-right",
                                   cr.__tableCellStyleRightSheet);
      }
      else
      {
        cr.__tableCellRightStyleSheet = style;
      }
    },

    /**
     * Get the current italic cell style settings for table cells.
     */
    getTableCellItalicStyleSheet : function(style)
    {
      return qx.legacy.ui.table.cellrenderer.Abstract.__tableCellItalicStyleSheet;
    },

    /**
     * Set the italic cell style settings for table cells.
     */
    setTableCellItalicStyleSheet : function(style)
    {
      var cr = qx.legacy.ui.table.cellrenderer.Abstract;
      if (cr.__clazz)
      {
        qx.legacy.html.StyleSheet.removeRule(cr.__clazz.stylesheet,
                                      ".qooxdoo-table-cell-italic");
        cr.__tableCellItalicStyleSheet = style;
        qx.legacy.html.StyleSheet.addRule(cr.__clazz.stylesheet,
                                   ".qooxdoo-table-cell-italic",
                                   cr.__tableCellItalicStyleSheet);
      }
      else
      {
        cr.__tableCellStyleItalicSheet = style;
      }
    },

    /**
     * Get the current bold cell style settings for table cells.
     */
    getTableCellBoldStyleSheet : function(style)
    {
      return qx.legacy.ui.table.cellrenderer.Abstract.__tableCellBoldStyleSheet;
    },

    /**
     * Set the standard cell style settings for table cells.
     */
    setTableCellBoldStyleSheet : function(style)
    {
      var cr = qx.legacy.ui.table.cellrenderer.Abstract;
      if (cr.__clazz)
      {
        qx.legacy.html.StyleSheet.removeRule(cr.__clazz.stylesheet,
                                      ".qooxdoo-table-cell-bold");
        cr.__tableCellBoldStyleSheet = style;
        qx.legacy.html.StyleSheet.addRule(cr.__clazz.stylesheet,
                                   ".qooxdoo-table-cell-bold",
                                   cr.__tableCellBoldStyleSheet);
      }
      else
      {
        cr.__tableCellBoldStyleSheet = style;
      }
    }
  },


  members :
  {
    /**
     * Get a string of the cell element's HTML classes.
     *
     * This method may be overridden by sub classes.
     *
     * @param cellInfo {Map} cellInfo of the cell
     * @return {String} The table cell HTML classes as string.
b     */
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


    // interface implementation
    createDataCellHtml : function(cellInfo, htmlArr)
    {
      htmlArr.push(
        '<div class="',
        this._getCellClass(cellInfo),
        '" style="',
        'left:', cellInfo.styleLeft, 'px;',
        'width:', cellInfo.styleWidth, 'px;',
        this._getCellStyle(cellInfo),
        // deal with unselectable text in Opera 9.2x - not effective in 9.5 beta
        // http://dev.fckeditor.net/ticket/21
        (qx.core.Variant.isSet("qx.client", "opera") ? '" unselectable="on">' : '">'),
        this._getContentHtml(cellInfo),
        '</div>'
      );
    }

  }
});
