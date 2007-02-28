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

qx.Clazz.define("qx.ui.layout.BoxLayout",
{
  extend : qx.ui.core.Parent,




  /*
  *****************************************************************************
     CONSTRUCTOR
  *****************************************************************************
  */

  construct : function(vOrientation)
  {
    this.base(arguments);

    // apply orientation
    if (vOrientation != null) {
      this.setOrientation(vOrientation);
    }
  },




  /*
  *****************************************************************************
     STATICS
  *****************************************************************************
  */

  statics : { STR_REVERSED : "-reversed" },




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

    /** The orientation of the layout control. Allowed values are "horizontal" (default) and "vertical". */
    orientation :
    {
      _legacy           : true,
      type              : "string",
      possibleValues    : [ "horizontal", "vertical" ],
      addToQueueRuntime : true
    },


    /** The spacing between childrens. Could be any positive integer value. */
    spacing :
    {
      _legacy           : true,
      type              : "number",
      defaultValue      : 0,
      addToQueueRuntime : true,
      impl              : "layout"
    },


    /** The horizontal align of the children. Allowed values are: "left", "center" and "right" */
    horizontalChildrenAlign :
    {
      _legacy           : true,
      type              : "string",
      defaultValue      : "left",
      possibleValues    : [ "left", "center", "right" ],
      impl              : "layoutOrder",
      addToQueueRuntime : true
    },


    /** The vertical align of the children. Allowed values are: "top", "middle" and "bottom" */
    verticalChildrenAlign :
    {
      _legacy           : true,
      type              : "string",
      defaultValue      : "top",
      possibleValues    : [ "top", "middle", "bottom" ],
      impl              : "layoutOrder",
      addToQueueRuntime : true
    },


    /** Should the children be layouted in reverse order? */
    reverseChildrenOrder :
    {
      _legacy           : true,
      type              : "boolean",
      defaultValue      : false,
      impl              : "layoutOrder",
      addToQueueRuntime : true
    },


    /**
     * Should the widgets be stretched to the available width (orientation==vertical) or height (orientation==horizontal)?
     *  This only applies if the child has not configured a own value for this axis.
     */
    stretchChildrenOrthogonalAxis :
    {
      _legacy           : true,
      type              : "boolean",
      defaultValue      : true,
      addToQueueRuntime : true
    },


    /**
     * If there are min/max values in combination with flex try to optimize placement.
     *  This is more complex and produces more time for the layouter but sometimes this feature is needed.
     */
    useAdvancedFlexAllocation :
    {
      _legacy           : true,
      type              : "boolean",
      defaultValue      : false,
      addToQueueRuntime : true
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

      if (qx.util.Validation.isValidString(propValue)) {
        this._layoutImpl = this._createLayoutImpl();
      }

      // call other core modifier
      return this._modifyLayoutOrder(propValue, propOldValue, propData);
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
    _modifyLayoutOrder : function(propValue, propOldValue, propData)
    {
      // update layout mode
      this._invalidateLayoutMode();

      // call other core modifier
      return this._modifyLayout(propValue, propOldValue, propData);
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
    _modifyLayout : function(propValue, propOldValue, propData)
    {
      // invalidate inner preferred dimensions
      this._invalidatePreferredInnerDimensions();

      // accumulated width needs to be invalidated
      this._invalidateAccumulatedChildrenOuterWidth();
      this._invalidateAccumulatedChildrenOuterHeight();

      // make property handling happy :)
      return true;
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
