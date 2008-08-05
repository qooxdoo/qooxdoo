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

/* ************************************************************************

#module(ui_table)

************************************************************************ */

/**
 * The default data row renderer.
 *
 * @appearance table-row
 */
qx.Class.define("qx.legacy.ui.table.rowrenderer.Default",
{
  extend : qx.core.Object,
  implement : qx.legacy.ui.table.IRowRenderer,




  /*
  *****************************************************************************
     CONSTRUCTOR
  *****************************************************************************
  */

  construct : function(table)
  {
    this.base(arguments);

    this._fontStyle = {};
    this._fontStyleString = "";

    this._colors = {};

    this._table = table;

    // link to font theme
    qx.legacy.theme.manager.Font.getInstance().connect(this._styleFont, this, "default");

    // link to color theme
    qx.legacy.theme.manager.Color.getInstance().connect(this._styleBgcolFocusedSelected, this, "table-row-background-focused-selected");
    qx.legacy.theme.manager.Color.getInstance().connect(this._styleBgcolFocused, this, "table-row-background-focused");
    qx.legacy.theme.manager.Color.getInstance().connect(this._styleBgcolSelected, this, "table-row-background-selected");
    qx.legacy.theme.manager.Color.getInstance().connect(this._styleBgcolEven, this, "table-row-background-even");
    qx.legacy.theme.manager.Color.getInstance().connect(this._styleBgcolOdd, this, "table-row-background-odd");
    qx.legacy.theme.manager.Color.getInstance().connect(this._styleColSelected, this, "table-row-selected");
    qx.legacy.theme.manager.Color.getInstance().connect(this._styleColNormal, this, "table-row");
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
    /*
    *****************************************************************************
       THEME STYLERS FOR COLOR PROPERTIES
    *****************************************************************************
    */

    /**
     * Theme styler for color property.
     *
     * @param value {String} new value
     * @param old {String} old value
     */
    _styleBgcolFocusedSelected     : function(value, old) {
      this._colors.bgcolFocusedSelected = value;
      this._postponedUpdateTableContent();
    },

    /**
     * Theme styler for color property.
     *
     * @param value {String} new value
     * @param old {String} old value
     */
    _styleBgcolFocused             : function(value, old) {
      this._colors.bgcolFocused = value;
      this._postponedUpdateTableContent();
    },

    /**
     * Theme styler for color property.
     *
     * @param value {String} new value
     * @param old {String} old value
     */
    _styleBgcolSelected            : function(value, old) {
      this._colors.bgcolSelected = value;
      this._postponedUpdateTableContent();
    },

    /**
     * Theme styler for color property.
     *
     * @param value {String} new value
     * @param old {String} old value
     */
    _styleBgcolEven                : function(value, old) {
      this._colors.bgcolEven = value;
      this._postponedUpdateTableContent();
    },

    /**
     * Theme styler for color property.
     *
     * @param value {String} new value
     * @param old {String} old value
     */
    _styleBgcolOdd                 : function(value, old) {
      this._colors.bgcolOdd = value;
      this._postponedUpdateTableContent();
    },

    /**
     * Theme styler for color property.
     *
     * @param value {String} new value
     * @param old {String} old value
     */
    _styleColSelected              : function(value, old) {
      this._colors.colSelected = value;
      this._postponedUpdateTableContent();
    },

    /**
     * Theme styler for color property.
     *
     * @param value {String} new value
     * @param old {String} old value
     */
    _styleColNormal                : function(value, old) {
      this._colors.colNormal = value;
      this._postponedUpdateTableContent();
    },


    /**
     * Utility method to render the given font. Calls the
     * {@link #_renderFont} method.
     *
     * @param value {qx.legacy.ui.core.Font} new font value to render
     */
    _styleFont : function(value) {
      this.__font = value;
      this._renderFont();
    },


    /**
     * Render the new font and update the table pane content
     * to reflect the font change.
     */
    _renderFont : function() {
      var value = this.__font;
      if(value) {
        value.renderStyle(this._fontStyle);
        this._fontStyleString = value.generateStyle();
      }
      else {
        qx.legacy.ui.core.Font.resetStyle(this._fontStyle);
        this._fontStyleString = "";
      }

      this._postponedUpdateTableContent();
    },

    // interface implementation
    updateDataRowElement : function(rowInfo, rowElem)
    {
      var fontStyle = this._fontStyle;
      var style = rowElem.style;

      style.fontFamily     = fontStyle.fontFamily;
      style.fontSize       = fontStyle.fontSize;
      style.fontWeight     = fontStyle.fontWeight;
      style.fontStyle      = fontStyle.fontStyle;
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
          qx.legacy.ui.core.Widget.flushGlobalQueues();
        },
        this, 0);

        this._updateContentPlanned = true;
      }
    },

    /**
     * Update the table pane content to reflect visual changes.
     *
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
