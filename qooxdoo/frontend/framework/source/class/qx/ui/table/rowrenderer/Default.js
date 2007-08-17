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
     */
    appearance :
    {
      refine : true,
      init   : "table-row"
    },

    /**
     * Sets the row background for state focused, selected
     */
    bgcolFocusedSelected     : {
      check     : "Color",
      nullable  : true,
      themeable : true,
      init      : "table-row-background-focused-selected",
      apply     : "_applyBgcolFocusedSelected"
    },

    /**
     * Sets the row background for state focused, selected, blurred
     */
    bgcolFocusedSelectedBlur : {
      check     : "Color",
      nullable  : true,
      themeable : true,
      init      : "table-row-background-focused-selected-blur",
      apply     : "_applyBgcolFocusedSelectedBlur"
    },

    /**
     * Sets the row background for state focused
     */
    bgcolFocused             : {
      check     : "Color",
      nullable  : true,
      themeable : true,
      init      : "table-row-background-focused",
      apply     : "_applyBgcolFocused"
    },

    /**
     * Sets the row background for state focused, blurred
     */
    bgcolFocusedBlur         : {
      check     : "Color",
      nullable  : true,
      themeable : true,
      init      : "table-row-background-focused-blur",
      apply     : "_applyBgcolFocusedBlur"
    },

    /**
     * Sets the row background for state selected
     */
    bgcolSelected            : {
      check     : "Color",
      nullable  : true,
      themeable : true,
      init      : "table-row-background-selected",
      apply     : "_applyBgcolSelected"
    },

    /**
     * Sets the row background for state selected, blurred
     */
    bgcolSelectedBlur        : {
      check     : "Color",
      nullable  : true,
      themeable : true,
      init      : "table-row-background-selected-blur",
      apply     : "_applyBgcolSelectedBlur"
    },

    /**
     * Sets the row background for even row number
     */
    bgcolEven                : {
      check     : "Color",
      nullable  : true,
      themeable : true,
      init      : "table-row-background-even",
      apply     : "_applyBgcolEven"
    },

    /**
     * Sets the row background for odd row number
     */
    bgcolOdd                 : {
      check     : "Color",
      nullable  : true,
      themeable : true,
      init      : "table-row-background-odd",
      apply     : "_applyBgcolOdd"
    },

    /**
     * Sets the row background for state selected
     */
    colSelected              : {
      check     : "Color",
      nullable  : true,
      themeable : true,
      init      : "table-row-selected",
      apply     : "_applyColSelected"
    },

    /**
     * Sets the row background for state normal
     */
    colNormal                : {
      check     : "Color",
      nullable  : true,
      themeable : true,
      init      : "table-row",
      apply     : "_applyColNormal"
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
       APPLYERS FOR COLOR PROPERTIES
    *****************************************************************************
    */
    _applyBgcolFocusedSelected : function(value, old) {
      qx.theme.manager.Color.getInstance().connect(this._styleBgcolFocusedSelected, this, value);
    },

    _applyBgcolFocusedSelectedBlur : function(value, old) {
      qx.theme.manager.Color.getInstance().connect(this._styleBgcolFocusedSelectedBlur, this, value);
    },

    _applyBgcolFocused : function(value, old) {
      qx.theme.manager.Color.getInstance().connect(this._styleBgcolFocused, this, value);
    },

    _applyBgcolFocusedBlur : function(value, old) {
      qx.theme.manager.Color.getInstance().connect(this._styleBgcolFocusedBlur, this, value);
    },

    _applyBgcolSelected : function(value, old) {
      qx.theme.manager.Color.getInstance().connect(this._styleBgcolSelected, this, value);
    },

    _applyBgcolSelectedBlur : function(value, old) {
      qx.theme.manager.Color.getInstance().connect(this._styleBgcolSelectedBlur, this, value);
    },

    _applyBgcolEven : function(value, old) {
      qx.theme.manager.Color.getInstance().connect(this._styleBgcolEven, this, value);
    },

    _applyBgcolOdd : function(value, old) {
      qx.theme.manager.Color.getInstance().connect(this._styleBgcolOdd, this, value);
    },

    _applyColSelected : function(value, old) {
      qx.theme.manager.Color.getInstance().connect(this._styleColSelected, this, value);
    },

    _applyColNormal : function(value, old) {
      qx.theme.manager.Color.getInstance().connect(this._styleColNormal, this, value);
    },


    /*
    *****************************************************************************
       THEME STYLERS FOR COLOR PROPERTIES
    *****************************************************************************
    */
    _styleBgcolFocusedSelected     : function(value) {
      this._colors.bgcolFocusedSelected = value;
      this._postponedUpdateTableContent();
    },

    _styleBgcolFocusedSelectedBlur : function(value, old) {
      this._colors.bgcolFocusedSelectedBlur = value;
      this._postponedUpdateTableContent();
    },

    _styleBgcolFocused             : function(value, old) {
      this._colors.bgcolFocused = value;
      this._postponedUpdateTableContent();
    },

    _styleBgcolFocusedBlur         : function(value, old) {
      this._colors.bgcolFocusedBlur = value;
      this._postponedUpdateTableContent();
    },

    _styleBgcolSelected            : function(value, old) {
      this._colors.bgcolSelected = value;
      this._postponedUpdateTableContent();
    },

    _styleBgcolSelectedBlur        : function(value, old) {
      this._colors.bgcolSelectedBlur = value;
      this._postponedUpdateTableContent();
    },

    _styleBgcolEven                : function(value, old) {
      this._colors.bgcolEven = value;
      this._postponedUpdateTableContent();
    },

    _styleBgcolOdd                 : function(value, old) {
      this._colors.bgcolOdd = value;
      this._postponedUpdateTableContent();
    },

    _styleColSelected              : function(value, old) {
      this._colors.colSelected = value;
      this._postponedUpdateTableContent();
    },

    _styleColNormal                : function(value, old) {
      this._colors.colNormal = value;
      this._postponedUpdateTableContent();
    },


    /**
     * Set colors from a given color map and updates
     * the content of the table.
     *
     * The map may contain any or all of the
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
     *
     * @type member
     * @param colors {Map}
     * @return {void}
     */
    setRowColors : function(colors) {
      // stop continuous table updates while setting
      // multipe colors
      this._noTableContentUpdate = true;

      this.set(colors);

      // re-enable table updates
      delete this._noTableContentUpdate;

      this._postponedUpdateTableContent();
    },


    /**
     * Get a map with the row colors.
     *
     * The map contains the following properties:
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
     *
     * @type member
     * @return {Map}
     */
    getRowColors : function() {
      return {
        bgcolFocusedSelected     : this.getBgcolFocusedSelected(),
        bgcolFocusedSelectedBlur : this.getBgcolFocusedSelectedBlur(),
        bgcolFocused             : this.getBgcolFocused(),
        bgcolFocusedBlur         : this.getBgcolFocusedBlur(),
        bgcolSelected            : this.getBgcolSelected(),
        bgcolSelectedBlur        : this.getBgcolSelectedBlur(),
        bgcolEven                : this.getBgcolEven(),
        bgcolOdd                 : this.getBgcolOdd(),
        colSelected              : this.getColSelected(),
        colNormal                : this.getColNormal()
      };
    },

    /**
     * Font property applyer.
     *
     * @type member
     * @param value {var} Current value
     * @param old {var} Previous value
     * @return {void}
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
     * @type member
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

      this._postponedUpdateTableContent();
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
     * Does a postponed update of the table content.
     *
     * @type member
     * @return {void}
     * @see #_updateTableContent
     */
    _postponedUpdateTableContent : function()
    {
      if(this._noTableContentUpdate) {
        return;
      }

      if (!this._updateContentPlanned)
      {
        qx.client.Timer.once(function()
        {
          if (this.getDisposed()) {
            return;
          }

          this._updateTableContent();
          this._updateContentPlanned = false;
          qx.ui.core.Widget.flushGlobalQueues();
        },
        this, 0);

        this._updateContentPlanned = true;
      }
    },

    /**
     * Update the table pane content to reflect visual changes.
     *
     * @type member
     * @return {void}
     */
    _updateTableContent : function() {
      if(this._noTableContentUpdate) {
        return;
      }

      var table = this.getParent();
      if(table) {
        table.updateContent();
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
