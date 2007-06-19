/* ************************************************************************

   qooxdoo - the new era of web development

   http://qooxdoo.org

   Copyright:
     2006 STZ-IDA, Germany, http://www.stz-ida.de
     2007 Visionet Gmbh, http://www.visionet.de

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
qx.Class.define("qx.ui.table.rowrenderer.Default",
{
  extend : qx.ui.table.rowrenderer.Basic,




  /*
  *****************************************************************************
     CONSTRUCTOR
  *****************************************************************************
  */

  construct : function()
  {
    this.base(arguments);

    this._fontStyle = {};
    this._fontStyleString = "";
    
    this._colors = {};
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
    },

    /**
     * Whether the focused row and the selection should be grayed out when the
     * table hasn't the focus.
     */
    visualizeFocusedState :
    {
      check : "Boolean",
      init : true
    },

    /**
     * Refine the appearance of the data row renderer.
     * 
     * TODO: create an appearance in the themes. For test purposes
     * the client-document appearance is used because it contains
     * a font definition. 
     * 
     */
    appearance :
    {
      refine : true,
      init   : "table-row"
    },
    
    /**
     * The value of each property in the map is a string containing either a
     * number (e.g. "#518ad3") or color name ("white") representing the color
     * for that type of display.  The map may contain any or all of the
     * following properties:
     * <ul>
     *   <li>bgcolFocusedSelected</li>
     *   <li>bgcolFocusedSelectedBlur</li>
     *   <li>bgcolFocused</li>
     *   <li>bgcolFocusedBlur</li>
     *   <li>bgcolSelected</li>
     *   <li>bgcolSelectedBlur</li>
     *   <li>bgcolEven</li>
     *   <li>bgcolOdd</li>
     *   <li>colSelected</li>
     *   <li>colNormal</li>
     * </ul>
     */
    rowColors :
    {
      check     : "Map",
      apply     : "_applyRowColors",
      themeable : true,
      init      : {
        bgcolFocusedSelected     : "table-row-background-focused-selected",
        bgcolFocusedSelectedBlur : "table-row-background-focused-selected-blur",
        bgcolFocused             : "table-row-background-focused",
        bgcolFocusedBlur         : "table-row-background-focused-blur",
        bgcolSelected            : "table-row-background-selected",
        bgcolSelectedBlur        : "table-row-background-selected-blur",
        bgcolEven                : "table-row-background-even",
        bgcolOdd                 : "table-row-background-odd",
        colSelected              : "table-row-selected",
        colNormal                : "table-row"
      }
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
     * Font property applyer.
     *
     * @type member
     * @param value {var} Current value
     * @param old {var} Previous value
     */
    _applyFont : function(value, old) {
      qx.theme.manager.Font.getInstance().connect(this._styleFont, this, value);
    },


    /**
     * Utility method to render the given font. Calls the
     * {@link #_renderFont} method.
     *
     * @type member
     * @param value {qx.ui.core.Font} new font value to render
     * @return {void}
     */
    _styleFont : function(value) {
      this.__font = value;
      this._renderFont();
    },


    /**
     * Render the new font and update the table pane content
     * to reflect the font change.
     *
     * @return {void}
     */
    _renderFont : function() {
      var value = this.__font;
      if(value) {
        value.renderStyle(this._fontStyle);
        this._fontStyleString = value.generateStyle();
      }
      else {
        qx.ui.core.Font.resetStyle(this._fontStyle);
        this._fontStyleString = "";
      }

      var table = this.getParent();
      if(table) {
        var scrollerArr = table._getPaneScrollerArr();
        for (var i=0; i<scrollerArr.length; i++) {
          scrollerArr[i]._tablePane._updateContent();
        }
      }
    },

    // overridden
    /**
     * TODOC
     *
     * @type member
     * @param rowInfo {var} TODOC
     * @param rowElem {var} TODOC
     * @return {void}
     */
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
        if (rowInfo.table.getFocused() || !this.getVisualizeFocusedState()) {
          style.backgroundColor = rowInfo.selected ? this._colors.bgcolFocusedSelected : this._colors.bgcolFocused;
        } else {
          style.backgroundColor = rowInfo.selected ? this._colors.bgcolFocusedSelectedBlur : this._colors.bgcolFocusedBlur;
        }
      }
      else
      {
        if (rowInfo.selected)
        {
          if (rowInfo.table.getFocused() || !this.getVisualizeFocusedState()) {
            style.backgroundColor = this._colors.bgcolSelected;
          } else {
            style.backgroundColor = this._colors.bgcolSelectedBlur;
          }
        }
        else
        {
          style.backgroundColor = (rowInfo.row % 2 == 0) ? this._colors.bgcolEven : this._colors.bgcolOdd;
        }
      }

      style.color = rowInfo.selected ? this._colors.colSelected : this._colors.colNormal;
    },

    // Array join test
    /**
     * TODOC
     *
     * @type member
     * @param rowInfo {var} TODOC
     * @param htmlArr {var} TODOC
     * @return {void}
     */
    _createRowStyle_array_join : function(rowInfo, htmlArr)
    {
      htmlArr.push(";");
      htmlArr.push(this._fontStyleString);
      htmlArr.push("background-color:");

      if (rowInfo.focusedRow && this.getHighlightFocusRow())
      {
        if (rowInfo.table.getFocused() || !this.getVisualizeFocusedState()) {
          htmlArr.push(rowInfo.selected ? this._colors.bgcolFocusedSelected : this._colors.bgcolFocused);
        } else {
          htmlArr.push(rowInfo.selected ? this._colors.bgcolFocusedSelectedBlur : this._colors.bgcolFocusedBlur);
        }
      }
      else
      {
        if (rowInfo.selected)
        {
          if (rowInfo.table.getFocused() || !this.getVisualizeFocusedState()) {
            htmlArr.push(this._colors.bgcolSelected);
          } else {
            htmlArr.push(this._colors.bgcolSelectedBlur);
          }
        }
        else
        {
          htmlArr.push((rowInfo.row % 2 == 0) ? this._colors.bgcolEven : this._colors.bgcolOdd);
        }
      }

      htmlArr.push(';color:');
      htmlArr.push(rowInfo.selected ? this._colors.colSelected : this._colors.colNormal);
    },

    /**
     * rowColors property applyer.
     *
     * @type member
     * @param colors {var} Current value
     * @param oldColors {var} Previous value
     */
    _applyRowColors : function(colors, oldColors) {
      this._styleRowColors(colors);
    },

    _styleRowColors : function(colors) {
      var cm = qx.theme.manager.Color.getInstance();
      
      for (var color in colors) {
        this._colors[color] = cm.isDynamic(colors[color]) ? cm.resolveDynamic(colors[color]) : colors[color];
      }
    }
  },




  /*
  *****************************************************************************
     DESTRUCTOR
  *****************************************************************************
  */

  destruct : function() {
    this._fontStyle = null;
    this._colors = null;
  }
});
