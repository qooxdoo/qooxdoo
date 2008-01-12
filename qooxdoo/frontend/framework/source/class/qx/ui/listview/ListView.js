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

#module(ui_listview)

************************************************************************ */

/**
 * Table Widget
 *
 * This widget displays data like text, images or links in a table.
 *
 * @deprecated Please use {@see qx.ui.table.Table} instead.
 * @appearance list-view
 */
qx.Class.define("qx.ui.listview.ListView",
{
  extend : qx.ui.layout.VerticalBoxLayout,




  /*
  *****************************************************************************
     CONSTRUCTOR
  *****************************************************************************
  */

  construct : function(vData, vColumns)
  {
    // ************************************************************************
    //   REFERENCES
    // ************************************************************************
    this._data = vData;
    this._columns = vColumns;

    // ************************************************************************
    //   SUPERCLASS CONSTRUCTOR
    // ************************************************************************
    this.base(arguments);

    // ************************************************************************
    //   HEADER
    // ************************************************************************
    this._header = new qx.ui.listview.Header(vColumns);
    this._header.setParent(this);

    // ************************************************************************
    //   FRAME
    // ************************************************************************
    this._frame = new qx.ui.layout.HorizontalBoxLayout;
    this._frame.setParent(this);
    this._frame.setHeight("1*");
    this._frame.setWidth(null);

    // ************************************************************************
    //   PANE
    // ************************************************************************
    this._pane = new qx.ui.listview.ListViewPane(vData, vColumns);
    this._pane.setParent(this._frame);

    // ************************************************************************
    //   SCROLL AREA
    // ************************************************************************
    this._scroll = new qx.ui.basic.ScrollBar(false);
    this._scroll.setWidth("auto");
    this._scroll.setParent(this._frame);
    this._scroll.addEventListener("changeValue", this._onscroll, this);

    // ************************************************************************
    //   RESIZE LINE
    // ************************************************************************
    this._resizeLine = new qx.ui.basic.Terminator;
    this._resizeLine.setBackgroundColor("#D6D5D9");
    this._resizeLine.setWidth(1);
    this._resizeLine.setParent(this);

    // ************************************************************************
    //   EVENTS
    // ************************************************************************
    this.addEventListener("mousedown", this._onmousedown);

    // Initialize properties
    this.initOverflow();
  },




  /*
  *****************************************************************************
     PROPERTIES
  *****************************************************************************
  */

  properties :
  {
    overflow :
    {
      refine : true,
      init : "hidden"
    },

    appearance :
    {
      refine : true,
      init : "list-view"
    },

    resizable :
    {
      check : "Boolean",
      init : true
    },

    liveResize :
    {
      check : "Boolean",
      init : false
    },

    sortBy :
    {
      check : "String",
      apply : "_applySortBy",
      nullable : true
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
    ---------------------------------------------------------------------------
      UTILITIES
    ---------------------------------------------------------------------------
    */

    /**
     * TODOC
     *
     * @type member
     * @return {var} TODOC
     */
    getData : function() {
      return this._data;
    },


    /**
     * TODOC
     *
     * @type member
     * @return {var} TODOC
     */
    getColumns : function() {
      return this._columns;
    },


    /**
     * TODOC
     *
     * @type member
     * @return {var} TODOC
     */
    getHeader : function() {
      return this._header;
    },


    /**
     * TODOC
     *
     * @type member
     * @return {var} TODOC
     */
    getFrame : function() {
      return this._frame;
    },


    /**
     * TODOC
     *
     * @type member
     * @return {var} TODOC
     */
    getPane : function() {
      return this._pane;
    },


    /**
     * TODOC
     *
     * @type member
     * @return {var} TODOC
     */
    getScroll : function() {
      return this._scroll;
    },


    /**
     * TODOC
     *
     * @type member
     * @return {var} TODOC
     */
    getResizeLine : function() {
      return this._resizeLine;
    },


    /**
     * TODOC
     *
     * @type member
     * @return {void}
     */
    update : function()
    {
      this.updateScrollBar();
      this.updateContent();
    },

    // ignore updateLayout here, as it is mostly initially used
    /**
     * TODOC
     *
     * @type member
     * @return {void}
     */
    updateScrollBar : function()
    {
      this._scroll.setMaximum((this._data.length * this._pane._rowHeight) + this._pane._rowHeight);
    },


    /**
     * TODOC
     *
     * @type member
     * @return {void}
     */
    updateContent : function() {
      this.getPane()._updateRendering(true);
    },


    /**
     * TODOC
     *
     * @type member
     * @return {void}
     */
    updateLayout : function() {
      this.getPane()._updateLayout();
    },


    /**
     * TODOC
     *
     * @type member
     * @return {void}
     */
    updateSort : function()
    {
      var vSortBy = this.getSortBy();

      if (!vSortBy) {
        return;
      }

      var vCell = this._getHeaderCell(vSortBy);

      if (vCell) {
        vCell.updateSort();
      }
    },


    /**
     * TODOC
     *
     * @type member
     * @param vCellId {var} TODOC
     * @return {var} TODOC
     */
    _getHeaderCell : function(vCellId)
    {
      var vNewEntry = this._columns[vCellId];
      return vNewEntry ? vNewEntry.headerCell : null;
    },




    /*
    ---------------------------------------------------------------------------
      MODIFIERS
    ---------------------------------------------------------------------------
    */

    /**
     * TODOC
     *
     * @type member
     * @param value {var} Current value
     * @param old {var} Previous value
     */
    _applySortBy : function(value, old)
    {
      if (old)
      {
        var vOldCell = this._getHeaderCell(old);

        if (vOldCell) {
          vOldCell.setSortOrder(null);
        }
      }

      if (value)
      {
        var vNewCell = this._getHeaderCell(value);

        if (vNewCell && vNewCell.getSortOrder() == null) {
          vNewCell.setSortOrder(qx.ui.listview.HeaderCell.C_SORT_ASCENDING);
        }
      }
    },




    /*
    ---------------------------------------------------------------------------
      EVENT HANDLER
    ---------------------------------------------------------------------------
    */

    /**
     * TODOC
     *
     * @type member
     * @param e {Event} TODOC
     * @return {void}
     */
    _onscroll : function(e) {
      this._pane._onscroll(e);
    },


    /**
     * TODOC
     *
     * @type member
     * @param e {Event} TODOC
     * @return {void}
     */
    _onmousedown : function(e) {
      this.getFocusRoot().setActiveChild(this.getPane());
    },




    /*
    ---------------------------------------------------------------------------
      DISPLAYBLE HANDLING
    ---------------------------------------------------------------------------
    */

    /**
     * TODOC
     *
     * @type member
     * @param vDisplayable {var} TODOC
     * @param vParent {var} TODOC
     * @param vHint {var} TODOC
     * @return {void}
     */
    _handleDisplayableCustom : function(vDisplayable, vParent, vHint)
    {
      this.base(arguments, vDisplayable, vParent, vHint);

      if (vDisplayable)
      {
        this.updateLayout();
        this.updateScrollBar();
        this.updateContent();
      }
    }
  },




  /*
  *****************************************************************************
     DESTRUCTOR
  *****************************************************************************
  */

  destruct : function()
  {
    this._disposeObjects("_header", "_frame", "_pane", "_scroll", "_resizeLine");
    this._disposeFields("_columns", "_data");
  }
});
