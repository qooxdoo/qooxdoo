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

  construct : function(table)
  {
    this.base(arguments);

    this._fontStyleString = "";
    this._fontStyleString = {};

    this._colors = {};
    this._table = table;

    // link to font theme
    this._renderFont(qx.theme.manager.Font.getInstance().resolve("default"));

    // link to color theme
    var colorMgr = qx.theme.manager.Color.getInstance();
    this._colors.bgcolFocusedSelected = colorMgr.resolve("table-row-background-focused-selected");
    this._colors.bgcolFocused = colorMgr.resolve("table-row-background-focused");
    this._colors.bgcolSelected = colorMgr.resolve("table-row-background-selected");
    this._colors.bgcolEven = colorMgr.resolve("table-row-background-even");
    this._colors.bgcolOdd = colorMgr.resolve("table-row-background-odd");
    this._colors.colSelected = colorMgr.resolve("table-row-selected");
    this._colors.colNormal = colorMgr.resolve("table-row");
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
        this._fontStyle = font.getStyles();
        this._fontStyleString = qx.bom.element.Style.compile(this._fontStyle);
        this._fontStyleString = this._fontStyleString.replace(/"/g, "'");
      }
      else
      {
        this._fontStyleString = "";
        this._fontStyle = qx.bom.Font.getDefaultStyles();
      }

      this._postponedUpdateTableContent();
    },


    // interface implementation
    updateDataRowElement : function(rowInfo, rowElem)
    {
      var fontStyle = this._fontStyle;
      var style = rowElem.style;

      style.fontFamily = fontStyle.fontFamily;
      style.fontSize = fontStyle.fontSize;
      style.fontWeight = fontStyle.fontWeight;
      style.fontStyle = fontStyle.fontStyle;
      style.textDecoration = fontStyle.textDecoration;

      if (rowInfo.focusedRow && this.getHighlightFocusRow())
      {
        style.backgroundColor = rowInfo.selected ? this._colors.bgcolFocusedSelected : this._colors.bgcolFocused;
      }
      else
      {
        if (rowInfo.selected)
        {
          style.backgroundColor = this._colors.bgcolSelected;
        }
        else
        {
          style.backgroundColor = (rowInfo.row % 2 == 0) ? this._colors.bgcolEven : this._colors.bgcolOdd;
        }
      }

      style.color = rowInfo.selected ? this._colors.colSelected : this._colors.colNormal;
    },


    // interface implementation
    createRowStyle : function(rowInfo)
    {
      var rowStyle = [];
      rowStyle.push(";");
      rowStyle.push(this._fontStyleString);
      rowStyle.push("background-color:");

      if (rowInfo.focusedRow && this.getHighlightFocusRow())
      {
        rowStyle.push(rowInfo.selected ? this._colors.bgcolFocusedSelected : this._colors.bgcolFocused);
      }
      else
      {
        if (rowInfo.selected)
        {
          rowStyle.push(this._colors.bgcolSelected);
        }
        else
        {
          rowStyle.push((rowInfo.row % 2 == 0) ? this._colors.bgcolEven : this._colors.bgcolOdd);
        }
      }

      rowStyle.push(';color:');
      rowStyle.push(rowInfo.selected ? this._colors.colSelected : this._colors.colNormal);

      return rowStyle.join("");
    },


    getRowClass : function(rowInfo) {
      return "";
    },


    /**
     * Does a postponed update of the table content.
     *
     * @see #_updateTableContent
     */
    _postponedUpdateTableContent : function()
    {
      if (!this._updateContentPlanned)
      {
        qx.event.Timer.once(function()
        {
          if (this.isDisposed()) {
            return;
          }

          this._updateTableContent();
          this._updateContentPlanned = false;
        },
        this, 0);

        this._updateContentPlanned = true;
      }
    },


    /**
     * Update the table pane content to reflect visual changes.
     */
    _updateTableContent : function()
    {
      if(this._table) {
        this._table.updateContent();
      }
    }
  },




  /*
  *****************************************************************************
     DESTRUCTOR
  *****************************************************************************
  */

  destruct : function() {
    this._disposeFields("_colors", "_fontStyle", "__font", "_table");
  }
});
