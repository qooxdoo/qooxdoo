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

qx.Class.define("qx.legacy.ui.layout.BoxLayout",
{
  extend : qx.legacy.ui.core.Parent,




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
      apply : "_applyOrientation",
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
    }
  },



  defer : function(statics, members)
  {
    qx.legacy.core.Property.addCachedProperty({ name : "accumulatedChildrenOuterWidth", defaultValue : null }, members);
    qx.legacy.core.Property.addCachedProperty({ name : "accumulatedChildrenOuterHeight", defaultValue : null }, members);
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
     * @return {qx.legacy.ui.layout.BoxLayout} TODOC
     */
    _createLayoutImpl : function() {
      return this.getOrientation() == "vertical" ? new qx.legacy.ui.layout.impl.VerticalBoxLayoutImpl(this) : new qx.legacy.ui.layout.impl.HorizontalBoxLayoutImpl(this);
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
     * @return {var} TODOC
     */
    isHorizontal : function() {
      return this._layoutHorizontal;
    },


    /**
     * TODOC
     *
     * @return {var} TODOC
     */
    isVertical : function() {
      return this._layoutVertical;
    },


    /**
     * TODOC
     *
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
     * @return {void}
     */
    _updateLayoutMode : function()
    {
      this._layoutMode = this._layoutVertical ? this.getVerticalChildrenAlign() : this.getHorizontalChildrenAlign();

      if (this.getReverseChildrenOrder()) {
        this._layoutMode += qx.legacy.ui.layout.BoxLayout.STR_REVERSED;
      }
    },


    /**
     * TODOC
     *
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
     * @param value {var} Current value
     * @param old {var} Previous value
     * @return {var} TODOC
     */
    _applyOrientation : function(value, old)
    {
      // update fast access variables
      this._layoutHorizontal = value == "horizontal";
      this._layoutVertical = value == "vertical";

      // Layout Implementation
      if (this._layoutImpl)
      {
        this._layoutImpl.dispose();
        this._layoutImpl = null;
      }

      if (value) {
        this._layoutImpl = this._createLayoutImpl();
      }

      // call layout helper
      this._doLayoutOrder(value, old);

      this.addToQueueRuntime("orientation");
    },

    _applySpacing : function(value, old)
    {
      this._doLayout();
      this.addToQueueRuntime("spacing");
    },

    _applyHorizontalChildrenAlign : function(value, old)
    {
      this._doLayoutOrder();
      this.addToQueueRuntime("horizontalChildrenAlign");
    },

    _applyVerticalChildrenAlign : function(value, old)
    {
      this._doLayoutOrder();
      this.addToQueueRuntime("verticalChildrenAlign");
    },

    _applyReverseChildrenOrder : function(value, old)
    {
      this._doLayoutOrder();
      this.addToQueueRuntime("reverseChildrenOrder");
    },

    _applyStretchChildrenOrthogonalAxis : function(value, old) {
      this.addToQueueRuntime("stretchChildrenOrthogonalAxis");
    },

    _applyUseAdvancedFlexAllocation : function(value, old) {
      this.addToQueueRuntime("useAdvancedFlexAllocation");
    },



    /**
     * TODOC
     *
     * @param value {var} Current value
     * @param old {var} Previous value
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
     * @param value {var} Current value
     * @param old {var} Previous value
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
