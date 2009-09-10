/* ************************************************************************

   qooxdoo - the new era of web development

   http://qooxdoo.org

   Copyright:
     2004-2008 1&1 Internet AG, Germany, http://www.1und1.de

   License:
     LGPL: http://www.gnu.org/licenses/lgpl.html
     EPL: http://www.eclipse.org/org/documents/epl-v10.php
     See the LICENSE file in the project's top-level directory for details.

   Authors:
     * Sebastian Werner (wpbasti)
     * Andreas Ecker (ecker)

************************************************************************ */

qx.Class.define("qx.legacy.ui.layout.GridLayout",
{
  extend : qx.legacy.ui.core.Parent,




  /*
  *****************************************************************************
     CONSTRUCTOR
  *****************************************************************************
  */

  construct : function()
  {
    this.base(arguments);

    this._columnData = [];
    this._rowData = [];

    this._spans = [];
  },




  /*
  *****************************************************************************
     PROPERTIES
  *****************************************************************************
  */

  properties :
  {
    /*
    ---------------------------------------------------------------------------
      PROPERTIES
    ---------------------------------------------------------------------------
    */

    /** The spacing between childrens. Could be any positive integer value. */
    horizontalSpacing :
    {
      check : "Integer",
      init : 0,
      apply : "_applyHorizontalSpacing",
      themeable : true
    },


    /** The spacing between childrens. Could be any positive integer value. */
    verticalSpacing :
    {
      check : "Integer",
      init : 0,
      apply : "_applyVerticalSpacing",
      themeable : true
    },


    /** The horizontal alignment of the children. Allowed values are: "left", "center" and "right" */
    horizontalChildrenAlign :
    {
      check : [ "left", "center", "right" ],
      init : "left",
      apply : "_applyHorizontalChildrenAlign",
      themeable : true
    },


    /** The vertical alignment of the children. Allowed values are: "top", "middle" and "bottom" */
    verticalChildrenAlign :
    {
      check : [ "top", "middle", "bottom" ],
      init : "top",
      apply : "_applyVerticalChildrenAlign",
      themeable : true
    },


    /** Cell padding top of all cells, if not locally defined */
    cellPaddingTop :
    {
      check : "Integer",
      nullable : true
    },


    /** Cell padding right of all cells, if not locally defined */
    cellPaddingRight :
    {
      check : "Integer",
      nullable : true,
      themeable : true
    },


    /** Cell padding bottom of all cells, if not locally defined */
    cellPaddingBottom :
    {
      check : "Integer",
      nullable : true,
      themeable : true
    },


    /** Cell padding left of all cells, if not locally defined */
    cellPaddingLeft :
    {
      check : "Integer",
      nullable : true,
      themeable : true
    }
  },




  /*
  *****************************************************************************
     MEMBERS
  *****************************************************************************
  */

  members :
  {
    _applyHorizontalSpacing : function(value, old)
    {
      this.addToQueueRuntime("horizontalSpacing");

      // invalidate inner preferred dimensions
      this._invalidatePreferredInnerDimensions();
    },

    _applyVerticalSpacing : function(value, old)
    {
      this.addToQueueRuntime("verticalSpacing");

      // invalidate inner preferred dimensions
      this._invalidatePreferredInnerDimensions();
    },

    _applyHorizontalChildrenAlign : function(value, old)
    {
      this.addToQueueRuntime("horizontalChildrenAlign");

      // invalidate inner preferred dimensions
      this._invalidatePreferredInnerDimensions();
    },

    _applyVerticalChildrenAlign : function(value, old)
    {
      this.addToQueueRuntime("verticalChildrenAlign");

      // invalidate inner preferred dimensions
      this._invalidatePreferredInnerDimensions();
    },






    /*
    ---------------------------------------------------------------------------
      INIT LAYOUT IMPL
    ---------------------------------------------------------------------------
    */

    /**
     * This creates an new instance of the layout impl this widget uses
     *
     * @return {qx.legacy.ui.layout.BoxLayout} TODOC
     */
    _createLayoutImpl : function() {
      return new qx.legacy.ui.layout.impl.GridLayoutImpl(this);
    },




    /*
    ---------------------------------------------------------------------------
      CORE FUNCTIONS
    ---------------------------------------------------------------------------
    */

    /**
     * TODOC
     *
     * @param vChild {var} TODOC
     * @param vCol {var} TODOC
     * @param vRow {var} TODOC
     * @return {void}
     * @throws TODOC
     */
    add : function(vChild, vCol, vRow)
    {
      vChild._col = vCol;
      vChild._row = vRow;

      if (this.isFillCell(vCol, vRow)) {
        throw new Error("Could not insert child " + vChild + " into a fill cell: " + vCol + "x" + vRow);
      }

      this.base(arguments, vChild);
    },






    /*
    ---------------------------------------------------------------------------
      GRID SETUP
    ---------------------------------------------------------------------------
    */

    /**
     * TODOC
     *
     * @param vData {var} TODOC
     * @param vOldLength {var} TODOC
     * @param vNewLength {var} TODOC
     * @return {void}
     */
    _syncDataFields : function(vData, vOldLength, vNewLength)
    {
      if (vNewLength > vOldLength)
      {
        for (var i=vOldLength; i<vNewLength; i++) {
          vData[i] = {};
        }
      }
      else if (vOldLength > vNewLength)
      {
        vData.splice(vNewLength, vOldLength - vNewLength);
      }
    },




    /*
    ---------------------------------------------------------------------------
      GRID SETUP: COLUMNS
    ---------------------------------------------------------------------------
    */

    _columnCount : 0,


    /**
     * TODOC
     *
     * @param vCount {var} TODOC
     * @return {void}
     */
    setColumnCount : function(vCount)
    {
      this._columnCount = vCount;
      this._syncColumnDataFields();
    },


    /**
     * TODOC
     *
     * @return {var} TODOC
     */
    getColumnCount : function() {
      return this._columnCount;
    },


    /**
     * TODOC
     *
     * @return {void}
     */
    addColumn : function()
    {
      this._columnCount++;
      this._syncColumnDataFields();
    },


    /**
     * TODOC
     *
     * @return {void}
     */
    removeColumn : function()
    {
      if (this._columnCount > 0)
      {
        this._columnCount--;
        this._syncColumnDataFields();
      }
    },


    /**
     * TODOC
     *
     * @return {void}
     */
    _syncColumnDataFields : function()
    {
      var vData = this._columnData;
      var vOldLength = vData.length;
      var vNewLength = this._columnCount;

      this._syncDataFields(vData, vOldLength, vNewLength);
    },




    /*
    ---------------------------------------------------------------------------
      GRID SETUP: ROWS
    ---------------------------------------------------------------------------
    */

    _rowCount : 0,


    /**
     * TODOC
     *
     * @param vCount {var} TODOC
     * @return {void}
     */
    setRowCount : function(vCount)
    {
      this._rowCount = vCount;
      this._syncRowDataFields();
    },


    /**
     * TODOC
     *
     * @return {var} TODOC
     */
    getRowCount : function() {
      return this._rowCount;
    },


    /**
     * TODOC
     *
     * @return {void}
     */
    addRow : function()
    {
      this._rowCount++;
      this._syncRowDataFields();
    },


    /**
     * TODOC
     *
     * @return {void}
     */
    removeRow : function()
    {
      if (this._rowCount > 0)
      {
        this._rowCount--;
        this._syncRowDataFields();
      }
    },


    /**
     * TODOC
     *
     * @return {void}
     */
    _syncRowDataFields : function()
    {
      var vData = this._rowData;
      var vOldLength = vData.length;
      var vNewLength = this._rowCount;

      this._syncDataFields(vData, vOldLength, vNewLength);
    },




    /*
    ---------------------------------------------------------------------------
      DATA HANDLING: COLUMNS
    ---------------------------------------------------------------------------
    */

    /**
     * TODOC
     *
     * @param vColumnIndex {var} TODOC
     * @param vProperty {var} TODOC
     * @return {var | null} TODOC
     */
    _getColumnProperty : function(vColumnIndex, vProperty)
    {
      try {
        return this._columnData[vColumnIndex][vProperty] || null;
      }
      catch(ex)
      {
        this.error("Error while getting column property (" + vColumnIndex + "|" + vProperty + ")", ex);
        return null;
      }
    },


    /**
     * TODOC
     *
     * @param vColumnIndex {var} TODOC
     * @param vProperty {var} TODOC
     * @param vValue {var} TODOC
     * @return {void}
     */
    _setupColumnProperty : function(vColumnIndex, vProperty, vValue)
    {
      this._columnData[vColumnIndex][vProperty] = vValue;
      this._invalidateColumnLayout();
    },


    /**
     * TODOC
     *
     * @param vColumnIndex {var} TODOC
     * @param vProperty {var} TODOC
     * @param vValue {var} TODOC
     * @return {void}
     */
    _removeColumnProperty : function(vColumnIndex, vProperty, vValue)
    {
      delete this._columnData[vColumnIndex][vProperty];
      this._invalidateColumnLayout();
    },


    /**
     * TODOC
     *
     * @return {void}
     */
    _invalidateColumnLayout : function()
    {
      if (!this._initialLayoutDone || !this._isDisplayable) {
        return;
      }

      this.forEachVisibleChild(function() {
        this.addToQueue("width");
      });
    },




    /*
    ---------------------------------------------------------------------------
      DATA HANDLING: ROWS
    ---------------------------------------------------------------------------
    */

    /**
     * TODOC
     *
     * @param vRowIndex {var} TODOC
     * @param vProperty {var} TODOC
     * @return {var | null} TODOC
     */
    _getRowProperty : function(vRowIndex, vProperty)
    {
      try {
        return this._rowData[vRowIndex][vProperty] || null;
      }
      catch(ex)
      {
        this.error("Error while getting row property (" + vRowIndex + "|" + vProperty + ")", ex);
        return null;
      }
    },


    /**
     * TODOC
     *
     * @param vRowIndex {var} TODOC
     * @param vProperty {var} TODOC
     * @param vValue {var} TODOC
     * @return {void}
     */
    _setupRowProperty : function(vRowIndex, vProperty, vValue)
    {
      this._rowData[vRowIndex][vProperty] = vValue;
      this._invalidateRowLayout();
    },


    /**
     * TODOC
     *
     * @param vRowIndex {var} TODOC
     * @param vProperty {var} TODOC
     * @param vValue {var} TODOC
     * @return {void}
     */
    _removeRowProperty : function(vRowIndex, vProperty, vValue)
    {
      delete this._rowData[vRowIndex][vProperty];
      this._invalidateRowLayout();
    },


    /**
     * TODOC
     *
     * @return {void}
     */
    _invalidateRowLayout : function()
    {
      if (!this._initialLayoutDone || !this._isDisplayable) {
        return;
      }

      this.forEachVisibleChild(function() {
        this.addToQueue("height");
      });
    },




    /*
    ---------------------------------------------------------------------------
      UTILITIES: CELL DIMENSIONS
    ---------------------------------------------------------------------------
    */

    // SETTER
    /**
     * TODOC
     *
     * @param vIndex {var} TODOC
     * @param vValue {var} TODOC
     * @return {void}
     */
    setColumnWidth : function(vIndex, vValue)
    {
      this._setupColumnProperty(vIndex, "widthValue", vValue);

      var vType = qx.legacy.ui.core.Parent.prototype._evalUnitsPixelPercentAutoFlex(vValue);

      this._setupColumnProperty(vIndex, "widthType", vType);

      var vParsed, vComputed;

      switch(vType)
      {
        case qx.legacy.ui.core.Widget.TYPE_PIXEL:
          vParsed = vComputed = Math.round(vValue);
          break;

        case qx.legacy.ui.core.Widget.TYPE_PERCENT:
        case qx.legacy.ui.core.Widget.TYPE_FLEX:
          vParsed = parseFloat(vValue);
          vComputed = null;
          break;

        case qx.legacy.ui.core.Widget.TYPE_AUTO:
          vParsed = vComputed = null;
          break;

        default:
          vParsed = vComputed = null;
      }

      this._setupColumnProperty(vIndex, "widthParsed", vParsed);
      this._setupColumnProperty(vIndex, "widthComputed", vComputed);
    },


    /**
     * TODOC
     *
     * @param vIndex {var} TODOC
     * @param vValue {var} TODOC
     * @return {void}
     */
    setRowHeight : function(vIndex, vValue)
    {
      this._setupRowProperty(vIndex, "heightValue", vValue);

      var vType = qx.legacy.ui.core.Widget.prototype._evalUnitsPixelPercentAutoFlex(vValue);
      this._setupRowProperty(vIndex, "heightType", vType);

      var vParsed, vComputed;

      switch(vType)
      {
        case qx.legacy.ui.core.Widget.TYPE_PIXEL:
          vParsed = vComputed = Math.round(vValue);
          break;

        case qx.legacy.ui.core.Widget.TYPE_PERCENT:
        case qx.legacy.ui.core.Widget.TYPE_FLEX:
          vParsed = parseFloat(vValue);
          vComputed = null;
          break;

        case qx.legacy.ui.core.Widget.TYPE_AUTO:
          vParsed = vComputed = null;
          break;

        default:
          vParsed = vComputed = null;
      }

      this._setupRowProperty(vIndex, "heightParsed", vParsed);
      this._setupRowProperty(vIndex, "heightComputed", vComputed);
    },

    // GETTER: BOX
    /**
     * TODOC
     *
     * @param vIndex {var} TODOC
     * @return {var} TODOC
     */
    getColumnBoxWidth : function(vIndex)
    {
      var vComputed = this._getColumnProperty(vIndex, "widthComputed");

      if (vComputed != null) {
        return vComputed;
      }

      var vType = this._getColumnProperty(vIndex, "widthType");
      var vParsed = this._getColumnProperty(vIndex, "widthParsed");
      var vComputed = null;

      switch(vType)
      {
        case qx.legacy.ui.core.Widget.TYPE_PIXEL:
          vComputed = Math.max(0, vParsed);
          break;

        case qx.legacy.ui.core.Widget.TYPE_PERCENT:
          vComputed = this.getInnerWidth() * Math.max(0, vParsed) * 0.01;
          break;

        case qx.legacy.ui.core.Widget.TYPE_AUTO:
          // TODO
          vComputed = null;
          break;

        case qx.legacy.ui.core.Widget.TYPE_FLEX:
          // TODO
          vComputed = null;
          break;
      }

      this._setupColumnProperty(vIndex, "widthComputed", vComputed);
      return vComputed;
    },


    /**
     * TODOC
     *
     * @param vIndex {var} TODOC
     * @return {var} TODOC
     */
    getRowBoxHeight : function(vIndex)
    {
      var vComputed = this._getRowProperty(vIndex, "heightComputed");

      if (vComputed != null) {
        return vComputed;
      }

      var vType = this._getRowProperty(vIndex, "heightType");
      var vParsed = this._getRowProperty(vIndex, "heightParsed");
      var vComputed = null;

      switch(vType)
      {
        case qx.legacy.ui.core.Widget.TYPE_PIXEL:
          vComputed = Math.max(0, vParsed);
          break;

        case qx.legacy.ui.core.Widget.TYPE_PERCENT:
          vComputed = this.getInnerHeight() * Math.max(0, vParsed) * 0.01;
          break;

        case qx.legacy.ui.core.Widget.TYPE_AUTO:
          // TODO
          vComputed = null;
          break;

        case qx.legacy.ui.core.Widget.TYPE_FLEX:
          // TODO
          vComputed = null;
          break;
      }

      this._setupRowProperty(vIndex, "heightComputed", vComputed);
      return vComputed;
    },

    // GETTER: PADDING
    /**
     * TODOC
     *
     * @param vCol {var} TODOC
     * @param vRow {var} TODOC
     * @return {var} TODOC
     */
    getComputedCellPaddingLeft : function(vCol, vRow) {
      return this.getColumnPaddingLeft(vCol) || this.getRowPaddingLeft(vRow) || this.getCellPaddingLeft() || 0;
    },


    /**
     * TODOC
     *
     * @param vCol {var} TODOC
     * @param vRow {var} TODOC
     * @return {var} TODOC
     */
    getComputedCellPaddingRight : function(vCol, vRow) {
      return this.getColumnPaddingRight(vCol) || this.getRowPaddingRight(vRow) || this.getCellPaddingRight() || 0;
    },


    /**
     * TODOC
     *
     * @param vCol {var} TODOC
     * @param vRow {var} TODOC
     * @return {var} TODOC
     */
    getComputedCellPaddingTop : function(vCol, vRow) {
      return this.getRowPaddingTop(vRow) || this.getColumnPaddingTop(vCol) || this.getCellPaddingTop() || 0;
    },


    /**
     * TODOC
     *
     * @param vCol {var} TODOC
     * @param vRow {var} TODOC
     * @return {var} TODOC
     */
    getComputedCellPaddingBottom : function(vCol, vRow) {
      return this.getRowPaddingBottom(vRow) || this.getColumnPaddingBottom(vCol) || this.getCellPaddingBottom() || 0;
    },

    // GETTER: INNER
    /**
     * TODOC
     *
     * @param vCol {var} TODOC
     * @param vRow {var} TODOC
     * @return {var} TODOC
     */
    getColumnInnerWidth : function(vCol, vRow) {
      return this.getColumnBoxWidth(vCol) - this.getComputedCellPaddingLeft(vCol, vRow) - this.getComputedCellPaddingRight(vCol, vRow);
    },


    /**
     * TODOC
     *
     * @param vCol {var} TODOC
     * @param vRow {var} TODOC
     * @return {var} TODOC
     */
    getRowInnerHeight : function(vCol, vRow) {
      return this.getRowBoxHeight(vRow) - this.getComputedCellPaddingTop(vCol, vRow) - this.getComputedCellPaddingBottom(vCol, vRow);
    },




    /*
    ---------------------------------------------------------------------------
      UTILITIES: CELL ALIGNMENT
    ---------------------------------------------------------------------------
    */

    // SETTER
    /**
     * TODOC
     *
     * @param vIndex {var} TODOC
     * @param vValue {var} TODOC
     * @return {void}
     */
    setColumnHorizontalAlignment : function(vIndex, vValue) {
      this._setupColumnProperty(vIndex, "horizontalAlignment", vValue);
    },


    /**
     * TODOC
     *
     * @param vIndex {var} TODOC
     * @param vValue {var} TODOC
     * @return {void}
     */
    setColumnVerticalAlignment : function(vIndex, vValue) {
      this._setupColumnProperty(vIndex, "verticalAlignment", vValue);
    },


    /**
     * TODOC
     *
     * @param vIndex {var} TODOC
     * @param vValue {var} TODOC
     * @return {void}
     */
    setRowHorizontalAlignment : function(vIndex, vValue) {
      this._setupRowProperty(vIndex, "horizontalAlignment", vValue);
    },


    /**
     * TODOC
     *
     * @param vIndex {var} TODOC
     * @param vValue {var} TODOC
     * @return {void}
     */
    setRowVerticalAlignment : function(vIndex, vValue) {
      this._setupRowProperty(vIndex, "verticalAlignment", vValue);
    },

    // GETTER
    /**
     * TODOC
     *
     * @param vIndex {var} TODOC
     * @return {var} TODOC
     */
    getColumnHorizontalAlignment : function(vIndex) {
      return this._getColumnProperty(vIndex, "horizontalAlignment");
    },


    /**
     * TODOC
     *
     * @param vIndex {var} TODOC
     * @return {var} TODOC
     */
    getColumnVerticalAlignment : function(vIndex) {
      return this._getColumnProperty(vIndex, "verticalAlignment");
    },


    /**
     * TODOC
     *
     * @param vIndex {var} TODOC
     * @return {var} TODOC
     */
    getRowHorizontalAlignment : function(vIndex) {
      return this._getRowProperty(vIndex, "horizontalAlignment");
    },


    /**
     * TODOC
     *
     * @param vIndex {var} TODOC
     * @return {var} TODOC
     */
    getRowVerticalAlignment : function(vIndex) {
      return this._getRowProperty(vIndex, "verticalAlignment");
    },




    /*
    ---------------------------------------------------------------------------
      UTILITIES: CELL PADDING
    ---------------------------------------------------------------------------
    */

    // SETTER
    /**
     * TODOC
     *
     * @param vIndex {var} TODOC
     * @param vValue {var} TODOC
     * @return {void}
     */
    setColumnPaddingTop : function(vIndex, vValue) {
      this._setupColumnProperty(vIndex, "paddingTop", vValue);
    },


    /**
     * TODOC
     *
     * @param vIndex {var} TODOC
     * @param vValue {var} TODOC
     * @return {void}
     */
    setColumnPaddingRight : function(vIndex, vValue) {
      this._setupColumnProperty(vIndex, "paddingRight", vValue);
    },


    /**
     * TODOC
     *
     * @param vIndex {var} TODOC
     * @param vValue {var} TODOC
     * @return {void}
     */
    setColumnPaddingBottom : function(vIndex, vValue) {
      this._setupColumnProperty(vIndex, "paddingBottom", vValue);
    },


    /**
     * TODOC
     *
     * @param vIndex {var} TODOC
     * @param vValue {var} TODOC
     * @return {void}
     */
    setColumnPaddingLeft : function(vIndex, vValue) {
      this._setupColumnProperty(vIndex, "paddingLeft", vValue);
    },


    /**
     * TODOC
     *
     * @param vIndex {var} TODOC
     * @param vValue {var} TODOC
     * @return {void}
     */
    setRowPaddingTop : function(vIndex, vValue) {
      this._setupRowProperty(vIndex, "paddingTop", vValue);
    },


    /**
     * TODOC
     *
     * @param vIndex {var} TODOC
     * @param vValue {var} TODOC
     * @return {void}
     */
    setRowPaddingRight : function(vIndex, vValue) {
      this._setupRowProperty(vIndex, "paddingRight", vValue);
    },


    /**
     * TODOC
     *
     * @param vIndex {var} TODOC
     * @param vValue {var} TODOC
     * @return {void}
     */
    setRowPaddingBottom : function(vIndex, vValue) {
      this._setupRowProperty(vIndex, "paddingBottom", vValue);
    },


    /**
     * TODOC
     *
     * @param vIndex {var} TODOC
     * @param vValue {var} TODOC
     * @return {void}
     */
    setRowPaddingLeft : function(vIndex, vValue) {
      this._setupRowProperty(vIndex, "paddingLeft", vValue);
    },

    // GETTER
    /**
     * TODOC
     *
     * @param vIndex {var} TODOC
     * @return {var} TODOC
     */
    getColumnPaddingTop : function(vIndex) {
      return this._getColumnProperty(vIndex, "paddingTop");
    },


    /**
     * TODOC
     *
     * @param vIndex {var} TODOC
     * @return {var} TODOC
     */
    getColumnPaddingRight : function(vIndex) {
      return this._getColumnProperty(vIndex, "paddingRight");
    },


    /**
     * TODOC
     *
     * @param vIndex {var} TODOC
     * @return {var} TODOC
     */
    getColumnPaddingBottom : function(vIndex) {
      return this._getColumnProperty(vIndex, "paddingBottom");
    },


    /**
     * TODOC
     *
     * @param vIndex {var} TODOC
     * @return {var} TODOC
     */
    getColumnPaddingLeft : function(vIndex) {
      return this._getColumnProperty(vIndex, "paddingLeft");
    },


    /**
     * TODOC
     *
     * @param vIndex {var} TODOC
     * @return {var} TODOC
     */
    getRowPaddingTop : function(vIndex) {
      return this._getRowProperty(vIndex, "paddingTop");
    },


    /**
     * TODOC
     *
     * @param vIndex {var} TODOC
     * @return {var} TODOC
     */
    getRowPaddingRight : function(vIndex) {
      return this._getRowProperty(vIndex, "paddingRight");
    },


    /**
     * TODOC
     *
     * @param vIndex {var} TODOC
     * @return {var} TODOC
     */
    getRowPaddingBottom : function(vIndex) {
      return this._getRowProperty(vIndex, "paddingBottom");
    },


    /**
     * TODOC
     *
     * @param vIndex {var} TODOC
     * @return {var} TODOC
     */
    getRowPaddingLeft : function(vIndex) {
      return this._getRowProperty(vIndex, "paddingLeft");
    },




    /*
    ---------------------------------------------------------------------------
      DIMENSION CACHE
    ---------------------------------------------------------------------------
    */

    /**
     * TODOC
     *
     * @param vNew {var} TODOC
     * @param vOld {var} TODOC
     * @return {void}
     */
    _changeInnerWidth : function(vNew, vOld)
    {
      for (var i=0, l=this.getColumnCount(); i<l; i++)
      {
        if (this._getColumnProperty(i, "widthType") == qx.legacy.ui.core.Widget.TYPE_PERCENT) {
          this._setupColumnProperty(i, "widthComputed", null);
        }
      }

      this.base(arguments, vNew, vOld);
    },


    /**
     * TODOC
     *
     * @param vNew {var} TODOC
     * @param vOld {var} TODOC
     * @return {void}
     */
    _changeInnerHeight : function(vNew, vOld)
    {
      for (var i=0, l=this.getRowCount(); i<l; i++)
      {
        if (this._getRowProperty(i, "heightType") == qx.legacy.ui.core.Widget.TYPE_PERCENT) {
          this._setupRowProperty(i, "heightComputed", null);
        }
      }

      this.base(arguments, vNew, vOld);
    },




    /*
    ---------------------------------------------------------------------------
      DIMENSION CACHE
    ---------------------------------------------------------------------------
    */

    /**
     * TODOC
     *
     * @param vChild {var} TODOC
     * @return {var} TODOC
     */
    getInnerWidthForChild : function(vChild) {
      return this._getColumnProperty(vChild._col, "widthComputed");
    },


    /**
     * TODOC
     *
     * @param vChild {var} TODOC
     * @return {var} TODOC
     */
    getInnerHeightForChild : function(vChild) {
      return this._getRowProperty(vChild._row, "heightComputed");
    },




    /*
    ---------------------------------------------------------------------------
      SPAN CELLS
    ---------------------------------------------------------------------------
    */

    /**
     * TODOC
     *
     * @param vStartCol {var} TODOC
     * @param vStartRow {var} TODOC
     * @param vColLength {var} TODOC
     * @param vRowLength {var} TODOC
     */
    mergeCells : function(vStartCol, vStartRow, vColLength, vRowLength)
    {
      var vSpans = this._spans;

      // Find end cols/rows
      var vEndCol = vStartCol + vColLength - 1;
      var vEndRow = vStartRow + vRowLength - 1;

      if (this._collidesWithSpans(vStartCol, vStartRow, vEndCol, vEndRow))
      {
        this.debug("Span collision detected!");

        // Send out warning
        return false;
      }

      // Finally store new span entry
      vSpans.push(
      {
        startCol  : vStartCol,
        startRow  : vStartRow,
        endCol    : vEndCol,
        endRow    : vEndRow,
        colLength : vColLength,
        rowLength : vRowLength
      });

      // Send out ok
      return true;
    },


    /**
     * TODOC
     *
     * @return {var} TODOC
     */
    hasSpans : function() {
      return this._spans.length > 0;
    },


    /**
     * TODOC
     *
     * @param vCol {var} TODOC
     * @param vRow {var} TODOC
     * @return {var | null} TODOC
     */
    getSpanEntry : function(vCol, vRow)
    {
      for (var i=0, s=this._spans, l=s.length, c; i<l; i++)
      {
        c = s[i];

        if (vCol >= c.startCol && vCol <= c.endCol && vRow >= c.startRow && vRow <= c.endRow) {
          return c;
        }
      }

      return null;
    },


    /**
     * TODOC
     *
     * @param vCol {var} TODOC
     * @param vRow {var} TODOC
     */
    isSpanStart : function(vCol, vRow)
    {
      for (var i=0, s=this._spans, l=s.length, c; i<l; i++)
      {
        c = s[i];

        if (c.startCol == vCol && c.startRow == vRow) {
          return true;
        }
      }

      return false;
    },


    /**
     * TODOC
     *
     * @param vCol {var} TODOC
     * @param vRow {var} TODOC
     */
    isSpanCell : function(vCol, vRow)
    {
      for (var i=0, s=this._spans, l=s.length, c; i<l; i++)
      {
        c = s[i];

        if (vCol >= c.startCol && vCol <= c.endCol && vRow >= c.startRow && vRow <= c.endRow) {
          return true;
        }
      }

      return false;
    },


    /**
     * TODOC
     *
     * @param vCol {var} TODOC
     * @param vRow {var} TODOC
     */
    isFillCell : function(vCol, vRow)
    {
      for (var i=0, s=this._spans, l=s.length, c; i<l; i++)
      {
        c = s[i];

        if (vCol >= c.startCol && vCol <= c.endCol && vRow >= c.startRow && vRow <= c.endRow && (vCol > c.startCol || vRow > c.startRow)) {
          return true;
        }
      }

      return false;
    },


    /**
     * TODOC
     *
     * @param vStartCol {var} TODOC
     * @param vStartRow {var} TODOC
     * @param vEndCol {var} TODOC
     * @param vEndRow {var} TODOC
     */
    _collidesWithSpans : function(vStartCol, vStartRow, vEndCol, vEndRow)
    {
      for (var i=0, s=this._spans, l=s.length, c; i<l; i++)
      {
        c = s[i];

        if (vEndCol >= c.startCol && vStartCol <= c.endCol && vEndRow >= c.startRow && vStartRow <= c.endRow) {
          return true;
        }
      }

      return false;
    }
  },




  /*
  *****************************************************************************
     DESTRUCTOR
  *****************************************************************************
  */

  destruct : function() {
    this._disposeFields("_columnData", "_rowData", "_spans");
  }
});
