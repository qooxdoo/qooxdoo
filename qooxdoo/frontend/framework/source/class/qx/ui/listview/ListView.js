/* ************************************************************************

   qooxdoo - the new era of web development

   http://qooxdoo.org

   Copyright:
     2004-2007 1&1 Internet AG, Germany, http://www.1and1.org

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

qx.Clazz.define("qx.ui.listview.ListView",
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
    //   OBJECTS
    // ************************************************************************
    this._header = new qx.ui.listview.Header(vColumns);
    this._frame = new qx.ui.layout.HorizontalBoxLayout;
    this._pane = new qx.ui.listview.ListViewPane(vData, vColumns);
    this._scroll = new qx.ui.layout.CanvasLayout;
    this._scrollContent = new qx.ui.basic.Terminator;
    this._resizeLine = new qx.ui.basic.Terminator;

    // ************************************************************************
    //   SUPERCLASS CONSTRUCTOR
    // ************************************************************************
    this.base(arguments);

    // ************************************************************************
    //   HEADER
    // ************************************************************************
    this._header.setParent(this);

    // ************************************************************************
    //   FRAME
    // ************************************************************************
    this._frame.setParent(this);
    this._frame.setHeight("1*");
    this._frame.setWidth(null);

    // ************************************************************************
    //   PANE
    // ************************************************************************
    this._pane.setParent(this._frame);

    // ************************************************************************
    //   SCROLL AREA
    // ************************************************************************
    this._scroll.setWidth("auto");
    this._scroll.setOverflow("scrollY");
    this._scroll.setParent(this._frame);
    this._scroll.enableInlineEvent("scroll");
    this._scroll.addEventListener("scroll", this._onscroll, this);

    // ************************************************************************
    //   SCROLL CONTENT
    // ************************************************************************
    this._scrollContent.setWidth(1);
    this._scrollContent.setParent(this._scroll);

    // ************************************************************************
    //   RESIZE LINE
    // ************************************************************************
    this._resizeLine.setBackgroundColor("#D6D5D9");
    this._resizeLine.setWidth(1);
    this._resizeLine.setParent(this);

    // ************************************************************************
    //   EVENTS
    // ************************************************************************
    this.addEventListener("mousedown", this._onmousedown);
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

    appearance :
    {
      _legacy      : true,
      type         : "string",
      defaultValue : "list-view"
    },

    resizable :
    {
      _legacy      : true,
      type         : "boolean",
      defaultValue : true
    },

    liveResize :
    {
      _legacy      : true,
      type         : "boolean",
      defaultValue : false
    },

    sortBy :
    {
      _legacy : true,
      type    : "string"
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
    getScrollContent : function() {
      return this._scrollContent;
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
      this._scrollContent.setHeight((this._data.length * this._pane._rowHeight) + this._pane._rowHeight);

      /**
       * Bugfix for gecko 1.8 (the one released with firefox 1.5)
       *  Overflow updates if content gets smaller are problematic
       *  https://bugzilla.mozilla.org/show_bug.cgi?id=320106
       */
      if (qx.core.Variant.isSet("qx.client", "gecko"))
      {
        if (qx.core.Client.getInstance().getVersion() >= 1.8)
        {
          this._scroll.setStyleProperty("height", "0px");
          this._scroll.forceHeight(0);
          this._scroll.setHeight(null);
        }
      }
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
     * @param propValue {var} Current value
     * @param propOldValue {var} Previous value
     * @param propData {var} Property configuration map
     * @return {boolean} TODOC
     */
    _modifySortBy : function(propValue, propOldValue, propData)
    {
      if (propOldValue)
      {
        var vOldCell = this._getHeaderCell(propOldValue);

        if (vOldCell) {
          vOldCell.setSortOrder(null);
        }
      }

      if (propValue)
      {
        var vNewCell = this._getHeaderCell(propValue);

        if (vNewCell && vNewCell.getSortOrder() == null) {
          vNewCell.setSortOrder(qx.ui.listview.HeaderCell.C_SORT_ASCENDING);
        }
      }

      return true;
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
    },




    /*
    ---------------------------------------------------------------------------
      DISPOSER
    ---------------------------------------------------------------------------
    */

    /**
     * TODOC
     *
     * @type member
     * @return {void | var} TODOC
     */
    dispose : function()
    {
      if (this.getDisposed()) {
        return;
      }

      if (this._header)
      {
        this._header.dispose();
        this._header = null;
      }

      if (this._frame)
      {
        this._frame.dispose();
        this._frame = null;
      }

      if (this._pane)
      {
        this._pane.dispose();
        this._pane = null;
      }

      if (this._scroll)
      {
        this._scroll.dispose();
        this._scroll = null;
      }

      if (this._scrollContent)
      {
        this._scrollContent.dispose();
        this._scrollContent = null;
      }

      if (this._resizeLine)
      {
        this._resizeLine.dispose();
        this._resizeLine = null;
      }

      delete this._columns;
      delete this._data;

      this.removeEventListener("mousedown", this._onmousedown);

      return this.base(arguments);
    }
  }
});
