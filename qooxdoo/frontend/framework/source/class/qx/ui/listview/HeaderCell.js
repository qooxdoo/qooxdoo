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
 * @appearance list-view-header-cell
 */
qx.Class.define("qx.ui.listview.HeaderCell",
{
  extend : qx.ui.basic.Atom,




  /*
  *****************************************************************************
     CONSTRUCTOR
  *****************************************************************************
  */

  construct : function(vConfig, vId)
  {
    this.base(arguments, vConfig.label, vConfig.icon, vConfig.iconWidth || 16, vConfig.iconHeight || 16, vConfig.flash);

    // Enable textOverflow
    this.setStyleProperty("textOverflow", "ellipsis");

    // Store configuration
    this._config = vConfig;
    this._id = vId;

    // Processing arguments
    this.setWidth(typeof vConfig.width === "undefined" ? "auto" : vConfig.width);

    if (vConfig.minWidth != null) {
      this.setMinWidth(vConfig.minWidth);
    }

    if (vConfig.maxWidth != null) {
      this.setMaxWidth(vConfig.maxWidth);
    }

    // Re-Enable flex support
    this.getLayoutImpl().setEnableFlexSupport(true);

    // Children
    this._spacer = new qx.ui.basic.HorizontalSpacer;

    this._arrowup = new qx.ui.basic.Image;
    this._arrowup.setAppearance("list-view-header-cell-arrow-up");
    this._arrowup.setVerticalAlign("middle");
    this._arrowup.setDisplay(false);

    this._arrowdown = new qx.ui.basic.Image;
    this._arrowdown.setAppearance("list-view-header-cell-arrow-down");
    this._arrowdown.setVerticalAlign("middle");
    this._arrowdown.setDisplay(false);

    this.add(this._spacer, this._arrowup, this._arrowdown);

    // Event Listeners
    this.addEventListener("mouseup", this._onmouseup);
    this.addEventListener("mouseover", this._onmouseover);
    this.addEventListener("mouseout", this._onmouseout);

    // Property initialization
    this.initOverflow();
  },




  /*
  *****************************************************************************
     STATICS
  *****************************************************************************
  */

  statics :
  {
    C_SORT_ASCENDING  : "ascending",
    C_SORT_DESCENDING : "descending"
  },




  /*
  *****************************************************************************
     PROPERTIES
  *****************************************************************************
  */

  properties :
  {
    horizontalChildrenAlign :
    {
      refine : true,
      init : "left"
    },

    overflow :
    {
      refine : true,
      init : "hidden"
    },

    appearance :
    {
      refine : true,
      init : "list-view-header-cell"
    },

    sortOrder :
    {
      check : [ "ascending", "descending" ],
      nullable : true,
      apply : "_applySortOrder",
      event : "changeSortOrder"
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
    getView : function() {
      return this.getParent().getParent();
    },


    /**
     * TODOC
     *
     * @type member
     * @return {var} TODOC
     */
    getNextSortOrder : function()
    {
      var vCurrentSortOrder = this.getSortOrder();

      switch(vCurrentSortOrder)
      {
        case qx.ui.listview.HeaderCell.C_SORT_ASCENDING:
          return qx.ui.listview.HeaderCell.C_SORT_DESCENDING;

        default:
          return qx.ui.listview.HeaderCell.C_SORT_ASCENDING;
      }
    },


    /**
     * TODOC
     *
     * @type member
     * @return {void}
     */
    updateSort : function()
    {
      var vListView = this.getView();
      var vData = vListView.getData();
      var vFieldId = this._id;
      var vSortProp = this._config.sortProp || "text";
      var vSortMethod = this._config.sortMethod || qx.util.Compare.byString;

      vData.sort(function(a, b) {
        return vSortMethod(a[vFieldId][vSortProp], b[vFieldId][vSortProp]);
      });

      if (this.getSortOrder() == qx.ui.listview.HeaderCell.C_SORT_DESCENDING) {
        vData.reverse();
      }
    },




    /*
    ---------------------------------------------------------------------------
      APPLY ROUTINES
    ---------------------------------------------------------------------------
    */

    /**
     * TODOC
     *
     * @type member
     * @param value {var} Current value
     * @param old {var} Previous value
     */
    _applySortOrder : function(value, old)
    {
      var vListView = this.getView();

      switch(value)
      {
        case qx.ui.listview.HeaderCell.C_SORT_ASCENDING:
          this._arrowup.setDisplay(true);
          this._arrowdown.setDisplay(false);

          vListView.setSortBy(this._id);
          break;

        case qx.ui.listview.HeaderCell.C_SORT_DESCENDING:
          this._arrowup.setDisplay(false);
          this._arrowdown.setDisplay(true);

          vListView.setSortBy(this._id);
          break;

        default:
          this._arrowup.setDisplay(false);
          this._arrowdown.setDisplay(false);

          if (vListView.getSortBy() == this._id) {
            vListView.setSortBy(null);
          }
      }

      if (value)
      {
        this.updateSort();
        vListView.update();
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
    _onmouseover : function(e) {
      this.addState("over");
    },


    /**
     * TODOC
     *
     * @type member
     * @param e {Event} TODOC
     * @return {void}
     */
    _onmouseout : function(e) {
      this.removeState("over");
    },


    /**
     * TODOC
     *
     * @type member
     * @param e {Event} TODOC
     * @return {void}
     */
    _onmouseup : function(e)
    {
      if (!this._config.sortable || this.getParent()._resizeSeparator) {
        return;
      }

      this.setSortOrder(this.getNextSortOrder());
      e.stopPropagation();
    }
  },




  /*
  *****************************************************************************
     DESTRUCTOR
  *****************************************************************************
  */

  destruct : function()
  {
    this._disposeObjects("_spacer", "_arrowup", "_arrowdown");
    this._disposeFields("_config");
  }
});
