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

/* ************************************************************************

#use(qx.legacy.ui.listview.ContentCellHtml)
#use(qx.legacy.ui.listview.ContentCellIconHtml)
#use(qx.legacy.ui.listview.ContentCellImage)
#use(qx.legacy.ui.listview.ContentCellLink)
#use(qx.legacy.ui.listview.ContentCellText)

************************************************************************ */

/**
 * @appearance list-view-pane
 */
qx.Class.define("qx.legacy.ui.listview.ListViewPane",
{
  extend : qx.legacy.ui.layout.GridLayout,




  /*
  *****************************************************************************
     CONSTRUCTOR
  *****************************************************************************
  */

  construct : function(vData, vColumns)
  {
    this.base(arguments);

    // ************************************************************************
    //   DATA
    // ************************************************************************
    // Add aliases for data tables
    this._data = vData;
    this._columns = vColumns;

    // ************************************************************************
    //   INITIALIZE MANAGER
    // ************************************************************************
    this._manager = new qx.legacy.ui.listview.SelectionManager(this);

    // ************************************************************************
    //   MOUSE EVENT LISTENER
    // ************************************************************************
    // Add handling for mouse wheel events
    // Needed because the virtual scroll area does not fire browser
    // understandable events above this pane.
    this.addListener("mousewheel", this._onmousewheel);

    this.addListener("mouseover", this._onmouseover);
    this.addListener("mousedown", this._onmousedown);
    this.addListener("mouseup", this._onmouseup);
    this.addListener("click", this._onclick);
    this.addListener("dblclick", this._ondblclick);

    // ************************************************************************
    //   KEY EVENT LISTENER
    // ************************************************************************
    this.addListener("keypress", this._onKeyPress);

    // Initialize properties
    this.initWidth();
    this.initOverflow();
  },




  /*
  *****************************************************************************
     PROPERTIES
  *****************************************************************************
  */

  properties :
  {
    width :
    {
      refine : true,
      init : "1*"
    },

    overflow :
    {
      refine : true,
      init : "hidden"
    },

    appearance :
    {
      refine : true,
      init : "list-view-pane"
    }
  },




  /*
  *****************************************************************************
     MEMBERS
  *****************************************************************************
  */

  members :
  {
    _rowHeight : 16,




    /*
    ---------------------------------------------------------------------------
      UTILITIES
    ---------------------------------------------------------------------------
    */

    /**
     * TODOC
     *
     * @return {var} TODOC
     */
    getView : function() {
      return this.getParent().getParent();
    },




    /*
    ---------------------------------------------------------------------------
      UPDATER
    ---------------------------------------------------------------------------
    */

    _lastRowCount : 0,

    _updateLayout : function(vUpdate)
    {
      if (qx.legacy.ui.core.Widget._inFlushGlobalQueues)
      {
        qx.event.Timer.once(function()
        {
          this._updateLayoutReal(vUpdate);
          this._updateRendering();
        }, this, 0);
      }
      else
      {
        this._updateLayoutReal(vUpdate);
      }
    },


    /**
     * TODOC
     *
     * @param vUpdate {var} TODOC
     * @return {void}
     */
    _updateLayoutReal : function(vUpdate)
    {
      var vColumns = this._columns;
      //var vRowCount = Math.ceil(this.getInnerHeight() / this._rowHeight);
      //var vRowCount = Math.ceil(qx.legacy.html.Dimension.getInnerHeight(this.getElement()) / this._rowHeight);
      //var vRowCount = Math.ceil((this._computeBoxHeight() - this._computeFrameHeight()) / this._rowHeight);

      if (this._cachedInnerHeight)
      {
        var vRowCount = Math.ceil(this._cachedInnerHeight / this._rowHeight);
      }
      else
      {
        var vRowCount = 0;
      }

      // this.debug("Rows: " + vRowCount);
      var vCell;

      // Sync cells: Add new ones and configure them
      if (vRowCount > this._lastRowCount)
      {
        for (var i=this._lastRowCount, j=0; i<vRowCount; i++, j=0)
        {
          for (var vCol in vColumns)
          {
            vCell = new vColumns[vCol].contentClass;

            this.add(vCell, j++, i);

            if (vColumns[vCol].align) {
              vCell.setStyleProperty("textAlign", vColumns[vCol].align);
            }
          }
        }
      }

      // Sync cells: Remove existing ones and dispose them
      else if (this._lastRowCount > vRowCount)
      {
        var vChildren = this.getChildren();
        var vChildrenLength = vChildren.length - 1;

        for (var i=this._lastRowCount; i>vRowCount; i--)
        {
          for (var vCol in vColumns)
          {
            vCell = vChildren[vChildrenLength--];
            this.remove(vCell);
            vCell.dispose();
          }
        }
      }

      // Update row and column count
      this.setRowCount(vRowCount);

      if (!vUpdate) {
        this.setColumnCount(qx.lang.Object.getLength(vColumns));
      }

      // Apply height to all rows
      for (var i=0; i<vRowCount; i++) {
        this.setRowHeight(i, this._rowHeight);
      }

      if (!vUpdate)
      {
        // Apply width and alignment to all columns
        var vCount = 0;

        for (var vCol in vColumns)
        {
          this.setColumnHorizontalAlignment(vCount, vColumns[vCol].align);
          this.setColumnWidth(vCount, vColumns[vCol].width);

          vCount++;
        }
      }

      // Store last row count
      this._lastRowCount = vRowCount;
    },

    _currentScrollTop : -1,


    /**
     * TODOC
     *
     * @param vForce {var} TODOC
     * @return {void}
     */
    _updateRendering : function(vForce)
    {
      if (this._updatingRendering) {
        return;
      }

      var vScrollTop = (this._initialLayoutDone ? this.getView().getScroll().getValue() : 0);

      this._updatingRendering = true;
      this._currentScrollTop = vScrollTop;

      for (var i=0; i<this._rowCount; i++) {
        this._updateRow(i);
      }

      delete this._updatingRendering;
    },


    /**
     * TODOC
     *
     * @param vRelativeRow {var} TODOC
     * @return {void}
     */
    _updateRow : function(vRelativeRow)
    {
      var vData = this._data;
      var vRowOffset = Math.floor(this._currentScrollTop / this._rowHeight);

      var vColumnCount = this.getColumnCount();
      var vColumns = this._columns;

      var vChildren = this.getVisibleChildren();
      var vChild, vEntry, vCol;

      var j = 0;

      for (vCol in vColumns)
      {
        vEntry = vData[vRowOffset + vRelativeRow];
        vChild = vChildren[vColumnCount * vRelativeRow + (j++)];

        if (vChild)
        {
          if (vEntry && vEntry._selected) {
            vChild.addState("selected");
          } else {
            vChild.removeState("selected");
          }

          if (vEntry && vEntry._lead) {
            vChild.addState("lead");
          } else {
            vChild.removeState("lead");
          }

          vChild.set(vEntry ? vEntry[vCol] : vColumns[vCol].empty || vColumns[vCol].contentClass.empty);
        }
      }
    },


    /**
     * TODOC
     *
     * @param e {Event} TODOC
     * @return {void}
     */
    _onscroll : function(e) {
      this._updateRendering();
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
     * @return {void} TODOC
     */
    _changeInnerHeight : function(vNew, vOld)
    {
      this._updateLayout(true);
      this._updateRendering(true);

      return this.base(arguments, vNew, vOld);
    },




    /*
    ---------------------------------------------------------------------------
      MANAGER BINDING
    ---------------------------------------------------------------------------
    */

    /**
     * TODOC
     *
     * @return {var} TODOC
     */
    getManager : function() {
      return this._manager;
    },


    /**
     * TODOC
     *
     * @param e {Event} TODOC
     * @return {var} TODOC
     */
    getListViewTarget : function(e)
    {
      var vEventTop = e.getPageY();
      var vPaneTop = qx.bom.element.Location.getTop(this.getElement(), "border");
      var vItemNo = Math.floor(this._currentScrollTop / this._rowHeight) + Math.floor((vEventTop - vPaneTop) / this._rowHeight);

      return this._data[vItemNo];
    },


    /**
     * TODOC
     *
     * @return {var} TODOC
     */
    getSelectedItem : function() {
      return this.getSelectedItems()[0];
    },


    /**
     * TODOC
     *
     * @return {var} TODOC
     */
    getSelectedItems : function() {
      return this._manager.getSelectedItems();
    },


    /**
     * TODOC
     *
     * @return {var} TODOC
     */
    getData : function() {
      return this._data;
    },

    // use static row height
    /**
     * TODOC
     *
     * @param vItem {var} TODOC
     * @return {var} TODOC
     */
    getItemHeight : function(vItem) {
      return this._rowHeight;
    },

    // use the full inner width of the pane
    /**
     * TODOC
     *
     * @param vItem {var} TODOC
     * @return {var} TODOC
     */
    getItemWidth : function(vItem) {
      return qx.legacy.html.Dimension.getInnerWidth(this.getElement());
    },


    /**
     * TODOC
     *
     * @param vItem {var} TODOC
     * @return {int} TODOC
     */
    getItemLeft : function(vItem) {
      return 0;
    },


    /**
     * TODOC
     *
     * @param vItem {var} TODOC
     * @return {var} TODOC
     */
    getItemTop : function(vItem) {
      return this._data.indexOf(vItem) * this._rowHeight;
    },




    /*
    ---------------------------------------------------------------------------
      MOUSE EVENT HANDLER
    ---------------------------------------------------------------------------
    */

    /**
     * TODOC
     *
     * @param e {Event} TODOC
     * @return {void}
     */
    _onmousewheel : function(e)
    {
      var vScroll = this.getView().getScroll();
      vScroll.setValue(vScroll.getValue() - (e.getWheelDelta() * 20));
      qx.legacy.event.handler.EventHandler.stopDomEvent(e);
    },


    /**
     * TODOC
     *
     * @param e {Event} TODOC
     * @return {void}
     */
    _onmouseover : function(e)
    {
      var vTarget = this.getListViewTarget(e);

      if (vTarget) {
        this._manager.handleMouseOver(vTarget, e);
      }
    },


    /**
     * TODOC
     *
     * @param e {Event} TODOC
     * @return {void}
     */
    _onmousedown : function(e)
    {
      var vTarget = this.getListViewTarget(e);

      if (vTarget) {
        this._manager.handleMouseDown(vTarget, e);
      }
    },


    /**
     * TODOC
     *
     * @param e {Event} TODOC
     * @return {void}
     */
    _onmouseup : function(e)
    {
      var vTarget = this.getListViewTarget(e);

      if (vTarget) {
        this._manager.handleMouseUp(vTarget, e);
      }
    },


    /**
     * TODOC
     *
     * @param e {Event} TODOC
     * @return {void}
     */
    _onclick : function(e)
    {
      var vTarget = this.getListViewTarget(e);

      if (vTarget) {
        this._manager.handleClick(vTarget, e);
      }
    },


    /**
     * TODOC
     *
     * @param e {Event} TODOC
     * @return {void}
     */
    _ondblclick : function(e)
    {
      var vTarget = this.getListViewTarget(e);

      if (vTarget) {
        this._manager.handleDblClick(vTarget, e);
      }
    },




    /*
    ---------------------------------------------------------------------------
      KEY EVENT HANDLER
    ---------------------------------------------------------------------------
    */

    /**
     * TODOC
     *
     * @param e {Event} TODOC
     * @return {void}
     */
    _onKeyPress : function(e)
    {
      this._manager.handleKeyPress(e);
      e.preventDefault();
    },




    /*
    ---------------------------------------------------------------------------
      MANAGER SELECTION
    ---------------------------------------------------------------------------
    */

    /**
     * TODOC
     *
     * @param vItem {var} TODOC
     * @param vIsSelected {var} TODOC
     * @return {void}
     */
    _updateSelectionState : function(vItem, vIsSelected)
    {
      vItem._selected = vIsSelected;
      this._updateItem(vItem);
    },


    /**
     * TODOC
     *
     * @param vItem {var} TODOC
     * @param vIsAnchor {var} TODOC
     * @return {void}
     */
    _updateAnchorState : function(vItem, vIsAnchor)
    {
      vItem._anchor = vIsAnchor;
      this._updateItem(vItem);
    },


    /**
     * TODOC
     *
     * @param vItem {var} TODOC
     * @param vIsLead {var} TODOC
     * @return {void}
     */
    _updateLeadState : function(vItem, vIsLead)
    {
      vItem._lead = vIsLead;
      this._updateItem(vItem);
    },


    /**
     * TODOC
     *
     * @param vItem {var} TODOC
     * @param vAlignLeftTop {var} TODOC
     * @return {void}
     */
    scrollItemIntoView : function(vItem, vAlignLeftTop)
    {
      this.scrollItemIntoViewX(vItem, vAlignLeftTop);
      this.scrollItemIntoViewY(vItem, vAlignLeftTop);
    },


    /**
     * TODOC
     *
     * @param vItem {var} TODOC
     * @param vAlignLeft {var} TODOC
     * @return {void}
     */
    scrollItemIntoViewX : function(vItem, vAlignLeft) {},

    // this.error("Not implemented in qx.legacy.ui.listview.ListViewPane!");
    /**
     * TODOC
     *
     * @param vItem {var} TODOC
     * @param vAlignTop {var} TODOC
     * @return {void}
     */
    scrollItemIntoViewY : function(vItem, vAlignTop)
    {
      var vItems = this._data;
      var vOffset = vItems.indexOf(vItem) * this._rowHeight;
      var vHeight = this._rowHeight;

      // normalize client height (we want that the item is fully visible)
      var vParentHeight = (Math.floor(this.getClientHeight() / this._rowHeight) * this._rowHeight);
      var vParentScrollTop = this._currentScrollTop;

      var vNewScrollTop = null;

      if (vAlignTop) {
        vNewScrollTop = vOffset;
      } else if (vAlignTop == false) {
        vNewScrollTop = vOffset + vHeight - vParentHeight;
      } else if (vHeight > vParentHeight || vOffset < vParentScrollTop) {
        vNewScrollTop = vOffset;
      } else if ((vOffset + vHeight) > (vParentScrollTop + vParentHeight)) {
        vNewScrollTop = vOffset + vHeight - vParentHeight;
      }

      if (vNewScrollTop != null) {
        this.getView().getScroll().setValue(vNewScrollTop);
      }
    },


    /**
     * TODOC
     *
     * @param vScrollTop {var} TODOC
     * @return {void}
     */
    setScrollTop : function(vScrollTop)
    {
      this.getView().getScroll().setValue(vScrollTop);
      this._updateRendering();
    },


    /**
     * TODOC
     *
     * @return {var} TODOC
     */
    getScrollTop : function() {
      return this._currentScrollTop;
    },


    /**
     * TODOC
     *
     * @return {void}
     */
    setScrollLeft : function() {
      this.error("Not implemented in qx.legacy.ui.listview.ListViewPane!");
    },


    /**
     * TODOC
     *
     * @return {Integer} TODOC
     */
    getScrollLeft : function() {
      return 0;
    },


    /**
     * TODOC
     *
     * @param vItem {var} TODOC
     * @return {var} TODOC
     */
    isItemVisible : function(vItem)
    {
      var vIndex = this._data.indexOf(vItem);
      var vRowStart = Math.floor(this._currentScrollTop / this._rowHeight);
      var vRowLength = Math.ceil(this.getClientHeight() / this._rowHeight);

      return vIndex >= vRowStart && vIndex <= (vRowStart + vRowLength);
    },


    /**
     * TODOC
     *
     * @param vItem {var} TODOC
     * @return {var} TODOC
     */
    getRelativeItemPosition : function(vItem)
    {
      var vIndex = this._data.indexOf(vItem);
      var vRowStart = Math.floor(this._currentScrollTop / this._rowHeight);

      return vIndex - vRowStart;
    },


    /**
     * TODOC
     *
     * @param vItem {var} TODOC
     * @return {void}
     */
    _updateItem : function(vItem)
    {
      var vIndex = this._data.indexOf(vItem);
      var vRowStart = Math.floor(this._currentScrollTop / this._rowHeight);
      var vRowLength = Math.ceil(this.getClientHeight() / this._rowHeight);

      if (vIndex < vRowStart || vIndex > (vRowStart + vRowLength)) {
        return;
      }

      this._updateRow(vIndex - vRowStart);
    }
  },




  /*
  *****************************************************************************
     DESTRUCTOR
  *****************************************************************************
  */

  destruct : function()
  {
    this._disposeObjects("_manager");
    this._disposeFields("_data", "_columns");
  }
});
