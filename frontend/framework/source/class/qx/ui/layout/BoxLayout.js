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

#module(ui_basic)
#module(ui_layout)

************************************************************************ */

qx.Class.define("qx.ui.layout.BoxLayout",
{
  extend : qx.ui.core.Parent,




  /*
  *****************************************************************************
     CONSTRUCTOR
  *****************************************************************************
  */

  /**
   * @param orientation {String} Initial value for {@link #orientation}.
   */
  construct : function(orientation)
  {
    this.base(arguments);

    // apply orientation
    if (orientation != null) {
      this.setOrientation(orientation);
    } else {
      this.initOrientation();
    }
  },




  /*
  *****************************************************************************
     STATICS
  *****************************************************************************
  */

  statics : {
    STR_REVERSED : "-reversed"
  },




  /*
  *****************************************************************************
     PROPERTIES
  *****************************************************************************
  */

  properties :
  {
    /** The orientation of the layout control. */
    orientation :
    {
      check : [ "horizontal", "vertical" ],
      init : "horizontal",
      apply : "_modifyOrientation",
      event : "changeOrientation"
    },


    /** The spacing between childrens. Could be any positive integer value. */
    spacing :
    {
      check : "Integer",
      init : 0,
      themeable : true,
      apply : "_applySpacing",
      event : "changeSpacing"
    },


    /** The horizontal align of the children. Allowed values are: "left", "center" and "right" */
    horizontalChildrenAlign :
    {
      check : [ "left", "center", "right" ],
      init : "left",
      themeable : true,
      apply : "_applyHorizontalChildrenAlign"
    },


    /** The vertical align of the children. Allowed values are: "top", "middle" and "bottom" */
    verticalChildrenAlign :
    {
      check : [ "top", "middle", "bottom" ],
      init : "top",
      themeable : true,
      apply : "_applyVerticalChildrenAlign"
    },


    /** Should the children be layouted in reverse order? */
    reverseChildrenOrder :
    {
      check : "Boolean",
      init : false,
      apply : "_applyReverseChildrenOrder"
    },


    /**
     * Should the widgets be stretched to the available width (orientation==vertical) or height (orientation==horizontal)?
     *  This only applies if the child has not configured a own value for this axis.
     */
    stretchChildrenOrthogonalAxis :
    {
      check : "Boolean",
      init : true,
      apply : "_applyStretchChildrenOrthogonalAxis"
    },


    /**
     * If there are min/max values in combination with flex try to optimize placement.
     *  This is more complex and produces more time for the layouter but sometimes this feature is needed.
     */
    useAdvancedFlexAllocation :
    {
      check : "Boolean",
      init : false,
      apply : "_applyUseAdvancedFlexAllocation"
    },




    /*
    ---------------------------------------------------------------------------
      ACCUMULATED CHILDREN WIDTH/HEIGHT
    --------------------------------------------------------------------------------

      Needed for center/middle and right/bottom alignment

    ---------------------------------------------------------------------------
    */

    accumulatedChildrenOuterWidth :
    {
      _cached      : true,
      defaultValue : null
    },

    accumulatedChildrenOuterHeight :
    {
      _cached      : true,
      defaultValue : null
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
      INIT LAYOUT IMPL
    ---------------------------------------------------------------------------
    */

    /**
     * This creates an new instance of the layout impl this widget uses
     *
     * @type member
     * @return {var} TODOC
     */
    _createLayoutImpl : function() {
      return this.getOrientation() == "vertical" ? new qx.renderer.layout.VerticalBoxLayoutImpl(this) : new qx.renderer.layout.HorizontalBoxLayoutImpl(this);
    },




    /*
    ---------------------------------------------------------------------------
      HELPERS
    ---------------------------------------------------------------------------
    */

    _layoutHorizontal : false,
    _layoutVertical : false,
    _layoutMode : "left",


    /**
     * TODOC
     *
     * @type member
     * @return {var} TODOC
     */
    isHorizontal : function() {
      return this._layoutHorizontal;
    },


    /**
     * TODOC
     *
     * @type member
     * @return {var} TODOC
     */
    isVertical : function() {
      return this._layoutVertical;
    },


    /**
     * TODOC
     *
     * @type member
     * @return {var} TODOC
     */
    getLayoutMode : function()
    {
      if (this._layoutMode == null) {
        this._updateLayoutMode();
      }

      return this._layoutMode;
    },


    /**
     * TODOC
     *
     * @type member
     * @return {void}
     */
    _updateLayoutMode : function()
    {
      this._layoutMode = this._layoutVertical ? this.getVerticalChildrenAlign() : this.getHorizontalChildrenAlign();

      if (this.getReverseChildrenOrder()) {
        this._layoutMode += qx.ui.layout.BoxLayout.STR_REVERSED;
      }
    },


    /**
     * TODOC
     *
     * @type member
     * @return {void}
     */
    _invalidateLayoutMode : function() {
      this._layoutMode = null;
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
     * @return {var} TODOC
     */
    _modifyOrientation : function(propValue, propOldValue, propData)
    {
      // update fast access variables
      this._layoutHorizontal = propValue == "horizontal";
      this._layoutVertical = propValue == "vertical";

      // Layout Implementation
      if (this._layoutImpl)
      {
        this._layoutImpl.dispose();
        this._layoutImpl = null;
      }

      if (propValue) {
        this._layoutImpl = this._createLayoutImpl();
      }

      // call layout helper
      this._doLayoutOrder(propValue, propOldValue, propData);

      this.addToQueueRuntime("orientation");
    },

    _applySpacing : function(propValue, propOldValue, propData)
    {
      this._doLayout();
      this.addToQueueRuntime("spacing");
    },

    _applyHorizontalChildrenAlign : function(propValue, propOldValue, propData)
    {
      this._doLayoutOrder();
      this.addToQueueRuntime("horizontalChildrenAlign");
    },

    _applyVerticalChildrenAlign : function(propValue, propOldValue, propData)
    {
      this._doLayoutOrder();
      this.addToQueueRuntime("verticalChildrenAlign");
    },

    _applyReverseChildrenOrder : function(propValue, propOldValue, propData)
    {
      this._doLayoutOrder();
      this.addToQueueRuntime("reverseChildrenOrder");
    },

    _applyStretchChildrenOrthogonalAxis : function(propValue, propOldValue, propData) {
      this.addToQueueRuntime("stretchChildrenOrthogonalAxis");
    },

    _applyUseAdvancedFlexAllocation : function(propValue, propOldValue, propData) {
      this.addToQueueRuntime("useAdvancedFlexAllocation");
    },



    /**
     * TODOC
     *
     * @type member
     * @param propValue {var} Current value
     * @param propOldValue {var} Previous value
     * @param propData {var} Property configuration map
     * @return {var} TODOC
     */
    _doLayoutOrder : function()
    {
      // update layout mode
      this._invalidateLayoutMode();

      // call doLayout
      this._doLayout();
    },


    /**
     * TODOC
     *
     * @type member
     * @param propValue {var} Current value
     * @param propOldValue {var} Previous value
     * @param propData {var} Property configuration map
     * @return {Boolean} TODOC
     */
    _doLayout : function()
    {
      // invalidate inner preferred dimensions
      this._invalidatePreferredInnerDimensions();

      // accumulated width needs to be invalidated
      this._invalidateAccumulatedChildrenOuterWidth();
      this._invalidateAccumulatedChildrenOuterHeight();
    },


    /**
     * TODOC
     *
     * @type member
     * @return {String} TODOC
     */
    _computeAccumulatedChildrenOuterWidth : function()
    {
      var ch = this.getVisibleChildren(), chc, i = -1, sp = this.getSpacing(), s = -sp;

      while (chc = ch[++i]) {
        s += chc.getOuterWidth() + sp;
      }

      return s;
    },


    /**
     * TODOC
     *
     * @type member
     * @return {String} TODOC
     */
    _computeAccumulatedChildrenOuterHeight : function()
    {
      var ch = this.getVisibleChildren(), chc, i = -1, sp = this.getSpacing(), s = -sp;

      while (chc = ch[++i]) {
        s += chc.getOuterHeight() + sp;
      }

      return s;
    },




    /*
    ---------------------------------------------------------------------------
      STRETCHING SUPPORT
    ---------------------------------------------------------------------------
    */

    /**
     * TODOC
     *
     * @type member
     * @return {void}
     */
    _recomputeChildrenStretchingX : function()
    {
      var ch = this.getVisibleChildren(), chc, i = -1;

      while (chc = ch[++i])
      {
        if (chc._recomputeStretchingX() && chc._recomputeBoxWidth()) {
          chc._recomputeOuterWidth();
        }
      }
    },


    /**
     * TODOC
     *
     * @type member
     * @return {void}
     */
    _recomputeChildrenStretchingY : function()
    {
      var ch = this.getVisibleChildren(), chc, i = -1;

      while (chc = ch[++i])
      {
        if (chc._recomputeStretchingY() && chc._recomputeBoxHeight()) {
          chc._recomputeOuterHeight();
        }
      }
    }
  }
});
