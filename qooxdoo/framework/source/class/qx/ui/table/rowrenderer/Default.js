/* ************************************************************************

   qooxdoo - the new era of web development

   http://qooxdoo.org

   Copyright:
     2006 STZ-IDA, Germany, http://www.stz-ida.de
     2007 Visionet GmbH, http://www.visionet.de

   License:
     LGPL: http://www.gnu.org/licenses/lgpl.html
     EPL: http://www.eclipse.org/org/documents/epl-v10.php
     See the LICENSE file in the project's top-level directory for details.

   Authors:
     * Til Schneider (til132) STZ-IDA
     * Dietrich Streifert (level420) Visionet

************************************************************************ */

/**
 * The default data row renderer.
 *
 * @appearance table-row
 */
qx.Class.define("qx.ui.table.rowrenderer.Default",
{
  extend : qx.core.Object,
  implement : qx.ui.table.IRowRenderer,




  /*
  *****************************************************************************
     CONSTRUCTOR
  *****************************************************************************
  */

  construct : function()
  {
    this.base(arguments);

    this.__fontStyleString = "";
    this.__fontStyleString = {};

    this.__colors = {};

    // link to font theme
    this._renderFont(qx.theme.manager.Font.getInstance().resolve("default"));

    // link to color theme
    var colorMgr = qx.theme.manager.Color.getInstance();
    this.__colors.bgcolFocusedSelected = colorMgr.resolve("table-row-background-focused-selected");
    this.__colors.bgcolFocused = colorMgr.resolve("table-row-background-focused");
    this.__colors.bgcolSelected = colorMgr.resolve("table-row-background-selected");
    this.__colors.bgcolEven = colorMgr.resolve("table-row-background-even");
    this.__colors.bgcolOdd = colorMgr.resolve("table-row-background-odd");
    this.__colors.colSelected = colorMgr.resolve("table-row-selected");
    this.__colors.colNormal = colorMgr.resolve("table-row");
    this.__colors.horLine = colorMgr.resolve("table-row-line");
  },




  /*
  *****************************************************************************
     PROPERTIES
  *****************************************************************************
  */

  properties :
  {
    /** Whether the focused row should be highlighted. */
    highlightFocusRow :
    {
      check : "Boolean",
      init : true
    }
  },



  /*
  *****************************************************************************
     MEMBERS
  *****************************************************************************
  */

  members :
  {
    __colors : null,
    __fontStyle : null,
    __fontStyleString : null,


    /**
     * the sum of the vertical insets. This is needed to compute the box model
     * independent size
     */
    _insetY : 1, // borderBottom

    /**
     * Render the new font and update the table pane content
     * to reflect the font change.
     *
     * @param font {qx.bom.Font} The font to use for the table row
     */
    _renderFont : function(font)
    {
      if (font)
      {
        this.__fontStyle = font.getStyles();
        this.__fontStyleString = qx.bom.element.Style.compile(this.__fontStyle);
        this.__fontStyleString = this.__fontStyleString.replace(/"/g, "'");
      }
      else
      {
        this.__fontStyleString = "";
        this.__fontStyle = qx.bom.Font.getDefaultStyles();
      }
    },


    // interface implementation
    updateDataRowElement : function(rowInfo, rowElem)
    {
      var fontStyle = this.__fontStyle;
      var style = rowElem.style;

      // set font styles
      qx.bom.element.Style.setStyles(rowElem, fontStyle);

      if (rowInfo.focusedRow && this.getHighlightFocusRow())
      {
        style.backgroundColor = rowInfo.selected ? this.__colors.bgcolFocusedSelected : this.__colors.bgcolFocused;
      }
      else
      {
        if (rowInfo.selected)
        {
          style.backgroundColor = this.__colors.bgcolSelected;
        }
        else
        {
          style.backgroundColor = (rowInfo.row % 2 == 0) ? this.__colors.bgcolEven : this.__colors.bgcolOdd;
        }
      }

      style.color = rowInfo.selected ? this.__colors.colSelected : this.__colors.colNormal;
      style.borderBottom = "1px solid " + this.__colors.horLine;
    },


    /**
     * Get the row's height CSS style taking the box model into account
     *
     * @param height {Integer} The row's (border-box) height in pixel
     */
    getRowHeightStyle : function(height)
    {
      if (qx.bom.client.Feature.CONTENT_BOX) {
        height -= this._insetY;
      }

      return "height:" + height + "px;";
    },


    // interface implementation
    createRowStyle : function(rowInfo)
    {
      var rowStyle = [];
      rowStyle.push(";");
      rowStyle.push(this.__fontStyleString);
      rowStyle.push("background-color:");

      if (rowInfo.focusedRow && this.getHighlightFocusRow())
      {
        rowStyle.push(rowInfo.selected ? this.__colors.bgcolFocusedSelected : this.__colors.bgcolFocused);
      }
      else
      {
        if (rowInfo.selected)
        {
          rowStyle.push(this.__colors.bgcolSelected);
        }
        else
        {
          rowStyle.push((rowInfo.row % 2 == 0) ? this.__colors.bgcolEven : this.__colors.bgcolOdd);
        }
      }

      rowStyle.push(';color:');
      rowStyle.push(rowInfo.selected ? this.__colors.colSelected : this.__colors.colNormal);

      rowStyle.push(';border-bottom: 1px solid ', this.__colors.horLine);

      return rowStyle.join("");
    },


    getRowClass : function(rowInfo) {
      return "";
    }
  },




  /*
  *****************************************************************************
     DESTRUCTOR
  *****************************************************************************
  */

  destruct : function() {
    this._disposeFields("__colors", "__fontStyle", "__fontStyleString");
  }
});
