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

#module(ui_layout)

************************************************************************ */

qx.Class.define("qx.ui.layout.impl.DockLayoutImpl",
{
  extend : qx.ui.layout.impl.LayoutImpl,




  /*
  *****************************************************************************
     CONSTRUCTOR
  *****************************************************************************
  */

  construct : function(vWidget) {
    this.base(arguments, vWidget);
  },




  /*
  *****************************************************************************
     STATICS
  *****************************************************************************
  */

  statics :
  {
    /**
     * Global Structure:
     *  [01] COMPUTE BOX DIMENSIONS FOR AN INDIVIDUAL CHILD
     *  [02] COMPUTE NEEDED DIMENSIONS FOR AN INDIVIDUAL CHILD
     *  [03] COMPUTE NEEDED DIMENSIONS FOR ALL CHILDREN
     *  [04] UPDATE LAYOUT WHEN A CHILD CHANGES ITS OUTER DIMENSIONS
     *  [05] UPDATE CHILD ON INNER DIMENSION CHANGES OF LAYOUT
     *  [06] UPDATE LAYOUT ON JOB QUEUE FLUSH
     *  [07] UPDATE CHILDREN ON JOB QUEUE FLUSH
     *  [08] CHILDREN ADD/REMOVE/MOVE HANDLING
     *  [09] FLUSH LAYOUT QUEUES OF CHILDREN
     *  [10] LAYOUT CHILD
     *
     *  Inherits from qx.ui.layout.impl.LayoutImpl:
     *  [02] COMPUTE NEEDED DIMENSIONS FOR AN INDIVIDUAL CHILD
     *  [03] COMPUTE NEEDED DIMENSIONS FOR ALL CHILDREN
     *  [04] UPDATE LAYOUT WHEN A CHILD CHANGES ITS OUTER DIMENSIONS
     *  [08] CHILDREN ADD/REMOVE/MOVE HANDLING
     */
    /*
    ---------------------------------------------------------------------------
      [00] ADDITIONAL GLOBAL DATA AND METHODS
    ---------------------------------------------------------------------------
    */

    METHOD_LOCATION : "layoutChild_location_",

    _childRanking :
    {
      vertical : function(c) {
        return c.getVerticalAlign() ? 1e6 : c.getHorizontalAlign() ? 2e6 : 3e6;
      },

      horizontal : function(c) {
        return c.getHorizontalAlign() ? 1e6 : c.getVerticalAlign() ? 2e6 : 3e6;
      },

      ordered : function(c) {
        return c.getHorizontalAlign() || c.getVerticalAlign() ? 1e6 : 2e6;
      }
    },

    _childCheck :
    {
      common : function(vChild)
      {
        if (!(vChild._computedLeftTypeNull && vChild._computedRightTypeNull && vChild._computedTopTypeNull && vChild._computedBottomTypeNull)) {
          throw new Error("qx.ui.layout.impl.DockLayoutImpl: It is not allowed to define any location values for children: " + vChild + "!");
        }
      },

      horizontal : function(vChild)
      {
        if (!(vChild._computedMinHeightTypeNull && vChild._computedHeightTypeNull && vChild._computedMaxHeightTypeNull)) {
          throw new Error("qx.ui.layout.impl.DockLayoutImpl: It is not allowed to define any vertical dimension for 'horizontal' placed children: " + vChild + "!");
        }
      },

      vertical : function(vChild)
      {
        if (!(vChild._computedMinWidthTypeNull && vChild._computedWidthTypeNull && vChild._computedMaxWidthTypeNull)) {
          throw new Error("qx.ui.layout.impl.DockLayoutImpl: It is not allowed to define any horizontal dimension for 'vertical' placed children: " + vChild + "!");
        }
      },

      "default" : function(vChild)
      {
        qx.ui.layout.impl.DockLayoutImpl._childCheck.horizontal(vChild);
        qx.ui.layout.impl.DockLayoutImpl._childCheck.vertical(vChild);
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
    /*
    ---------------------------------------------------------------------------
      [01] COMPUTE BOX DIMENSIONS FOR AN INDIVIDUAL CHILD
    ---------------------------------------------------------------------------
    */

    /**
     * Compute and return the box width of the given child
     *
     * @type member
     * @param vChild {var} TODOC
     * @return {var} TODOC
     */
    computeChildBoxWidth : function(vChild)
    {
      if (this.getChildAlignMode(vChild) == "horizontal") {
        return vChild.getWidthValue() || vChild._computeBoxWidthFallback();
      }

      return this.getWidget().getInnerWidth() - this._lastLeft - this._lastRight;
    },


    /**
     * Compute and return the box height of the given child
     *
     * @type member
     * @param vChild {var} TODOC
     * @return {var} TODOC
     */
    computeChildBoxHeight : function(vChild)
    {
      if (this.getChildAlignMode(vChild) == "vertical") {
        return vChild.getHeightValue() || vChild._computeBoxHeightFallback();
      }

      return this.getWidget().getInnerHeight() - this._lastTop - this._lastBottom;
    },




    /*
    ---------------------------------------------------------------------------
      [05] UPDATE CHILD ON INNER DIMENSION CHANGES OF LAYOUT
    ---------------------------------------------------------------------------
    */

    /**
     * Actions that should be done if the inner width of the widget was changed.
     *  Normally this includes update to percent values and ranges.
     *
     * @type member
     * @param vChild {var} TODOC
     */
    updateChildOnInnerWidthChange : function(vChild)
    {
      vChild._recomputePercentX();
      vChild.addToLayoutChanges("location");

      // inform the caller if there were any notable changes occured
      return true;
    },


    /**
     * Actions that should be done if the inner height of the widget was changed.
     *  Normally this includes update to percent values and ranges.
     *
     * @type member
     * @param vChild {var} TODOC
     */
    updateChildOnInnerHeightChange : function(vChild)
    {
      vChild._recomputePercentY();
      vChild.addToLayoutChanges("location");

      // inform the caller if there were any notable changes occured
      return true;
    },




    /*
    ---------------------------------------------------------------------------
      [06] UPDATE LAYOUT ON JOB QUEUE FLUSH
    ---------------------------------------------------------------------------
    */

    /**
     * Invalidate and recompute things because of job in queue
     * (before the rest of job handling will be executed).
     *
     * @signature function()
     */
    updateSelfOnJobQueueFlush : qx.lang.Function.returnFalse,




    /*
    ---------------------------------------------------------------------------
      [07] UPDATE CHILDREN ON JOB QUEUE FLUSH
    ---------------------------------------------------------------------------
    */

    /**
     * Updates children on special jobs
     *
     * @type member
     * @param vQueue {var} TODOC
     * @return {boolean}
     */
    updateChildrenOnJobQueueFlush : function(vQueue)
    {
      if (vQueue.mode || vQueue.addChild || vQueue.removeChild) {
        this.getWidget()._addChildrenToLayoutQueue("location");
      }
    },




    /*
    ---------------------------------------------------------------------------
      [09] FLUSH LAYOUT QUEUES OF CHILDREN
    ---------------------------------------------------------------------------
    */

    /**
     * This method have full control of the order in which the
     *  registered (or also non-registered) children should be
     *  layouted on the horizontal axis.
     *
     * @type member
     * @param vChildrenQueue {var} TODOC
     * @return {void}
     */
    flushChildrenQueue : function(vChildrenQueue)
    {
      var vWidget = this.getWidget(), vChildren = vWidget.getVisibleChildren(), vChildrenLength = vChildren.length, vMode = vWidget.getMode();

      // reset layout
      this._lastLeft = this._lastRight = this._lastTop = this._lastBottom = 0;

      // sorting children
      var vRankImpl = qx.ui.layout.impl.DockLayoutImpl._childRanking[vMode];

      var vOrderedChildren = qx.lang.Array.copy(vChildren).sort(function(c1, c2) {
        return (vRankImpl(c1) + vChildren.indexOf(c1)) - (vRankImpl(c2) + vChildren.indexOf(c2));
      });

      // flushing children
      for (var i=0; i<vChildrenLength; i++) {
        vWidget._layoutChild(vOrderedChildren[i]);
      }
    },


    /**
     * TODOC
     *
     * @type member
     * @param vChild {var} TODOC
     * @return {var} TODOC
     */
    getChildAlign : function(vChild) {
      return vChild.getVerticalAlign() || vChild.getHorizontalAlign() || "default";
    },


    /**
     * TODOC
     *
     * @type member
     * @param vChild {var} TODOC
     * @return {var} TODOC
     */
    getChildAlignMode : function(vChild) {
      return vChild.getVerticalAlign() ? "vertical" : vChild.getHorizontalAlign() ? "horizontal" : "default";
    },




    /*
    ---------------------------------------------------------------------------
      [10] LAYOUT CHILD
    ---------------------------------------------------------------------------
    */

    /**
     * This is called from qx.ui.core.Widget and  it's task is to apply the layout
     *  (excluding border and padding) to the child.
     *
     * @type member
     * @param vChild {var} TODOC
     * @param vJobs {var} TODOC
     * @return {void}
     */
    layoutChild : function(vChild, vJobs)
    {
      qx.ui.layout.impl.DockLayoutImpl._childCheck.common(vChild);
      qx.ui.layout.impl.DockLayoutImpl._childCheck[this.getChildAlignMode(vChild)](vChild);

      this.layoutChild_sizeX_essentialWrapper(vChild, vJobs);
      this.layoutChild_sizeY_essentialWrapper(vChild, vJobs);

      this.layoutChild_sizeLimitX(vChild, vJobs);
      this.layoutChild_sizeLimitY(vChild, vJobs);

      this[qx.ui.layout.impl.DockLayoutImpl.METHOD_LOCATION + this.getChildAlign(vChild)](vChild, vJobs);
    },


    /**
     * TODOC
     *
     * @type member
     * @param vChild {var} TODOC
     * @param vJobs {var} TODOC
     * @return {void}
     */
    layoutChild_location_top : function(vChild, vJobs)
    {
      vChild._renderRuntimeTop(this._lastTop);
      vChild._renderRuntimeLeft(this._lastLeft);

      this.layoutChild_location_horizontal(vChild);

      this._lastTop += vChild.getBoxHeight();
    },


    /**
     * TODOC
     *
     * @type member
     * @param vChild {var} TODOC
     * @param vJobs {var} TODOC
     * @return {void}
     */
    layoutChild_location_left : function(vChild, vJobs)
    {
      vChild._renderRuntimeLeft(this._lastLeft);
      vChild._renderRuntimeTop(this._lastTop);

      this.layoutChild_location_vertical(vChild);

      this._lastLeft += vChild.getBoxWidth();
    },


    /**
     * TODOC
     *
     * @type member
     * @param vChild {var} TODOC
     * @return {void}
     * @signature function(vChild)
     */
    _applyComputedWidth : qx.core.Variant.select("qx.client",
    {
      "mshtml|opera" : function(vChild)
      {
        // direct recompute (need to be done, while layouting as the
        // _last* variable changes during layout process)
        vChild._recomputeBoxWidth();

        // wrong: simple invalidates are enough here
        // correct: needs recompute to inform children (to update centering for example)
        vChild._recomputeOuterWidth();
        vChild._recomputeInnerWidth();

        // apply calculated width
        vChild._renderRuntimeWidth(vChild.getBoxWidth());
      },

      "default" : function(vChild)
      {
        // direct recompute (need to be done, while layouting as the
        // _last* variable changes during layout process)
        vChild._recomputeBoxWidth();

        // wrong: simple invalidates are enough here
        // correct: needs recompute to inform children (to update centering for example)
        vChild._recomputeOuterWidth();
        vChild._recomputeInnerWidth();
      }
    }),


    /**
     * TODOC
     *
     * @type member
     * @param vChild {var} TODOC
     * @return {void}
     * @signature function(vChild)
     */
    _applyComputedHeight : qx.core.Variant.select("qx.client",
    {
      "mshtml|opera" : function(vChild)
      {
        // direct recompute (need to be done, while layouting as the
        // _last* variable changes during layout process)
        vChild._recomputeBoxHeight();

        // wrong: simple invalidates are enough here
        // correct: needs recompute to inform children (to update centering for example)
        vChild._recomputeOuterHeight();
        vChild._recomputeInnerHeight();

        // apply calculated height
        vChild._renderRuntimeHeight(vChild.getBoxHeight());
      },

      "default" : function(vChild)
      {
        // direct recompute (need to be done, while layouting as the
        // _last* variable changes during layout process)
        vChild._recomputeBoxHeight();

        // wrong: simple invalidates are enough here
        // correct: needs recompute to inform children (to update centering for example)
        vChild._recomputeOuterHeight();
        vChild._recomputeInnerHeight();
      }
    }),


    /**
     * TODOC
     *
     * @type member
     * @param vChild {var} TODOC
     * @param vJobs {var} TODOC
     * @return {void}
     * @signature function(vChild, vJobs)
     */
    layoutChild_sizeX : qx.core.Variant.select("qx.client",
    {
      "mshtml|opera" : function(vChild, vJobs)
      {
        // We need to respect all dimension properties on the horizontal axis in internet explorer to set the 'width' style
        if (vJobs.initial || vJobs.width || vJobs.minWidth || vJobs.maxWidth) {
          vChild._computedWidthTypeNull && vChild._computedMinWidthTypeNull && vChild._computedMaxWidthTypeNull ? vChild._resetRuntimeWidth() : vChild._renderRuntimeWidth(vChild.getBoxWidth());
        }
      },

      "default" : function(vChild, vJobs)
      {
        if (vJobs.initial || vJobs.width) {
          vChild._computedWidthTypeNull ? vChild._resetRuntimeWidth() : vChild._renderRuntimeWidth(vChild.getWidthValue());
        }
      }
    }),


    /**
     * TODOC
     *
     * @type member
     * @param vChild {var} TODOC
     * @param vJobs {var} TODOC
     * @return {void}
     * @signature function(vChild, vJobs)
     */
    layoutChild_sizeY : qx.core.Variant.select("qx.client",
    {
      "mshtml|opera" : function(vChild, vJobs)
      {
        // We need to respect all dimension properties on the vertical axis in internet explorer to set the 'height' style
        if (vJobs.initial || vJobs.height || vJobs.minHeight || vJobs.maxHeight) {
          vChild._computedHeightTypeNull && vChild._computedMinHeightTypeNull && vChild._computedMaxHeightTypeNull ? vChild._resetRuntimeHeight() : vChild._renderRuntimeHeight(vChild.getBoxHeight());
        }
      },

      "default" : function(vChild, vJobs)
      {
        if (vJobs.initial || vJobs.height) {
          vChild._computedHeightTypeNull ? vChild._resetRuntimeHeight() : vChild._renderRuntimeHeight(vChild.getHeightValue());
        }
      }
    }),


    /**
     * TODOC
     *
     * @type member
     * @param vChild {var} TODOC
     * @return {void}
     * @signature function(vChild)
     */
    layoutChild_location_horizontal : qx.core.Variant.select("qx.client",
    {
      "mshtml|opera" : function(vChild) {
        this._applyComputedWidth(vChild);
      },

      "default" : function(vChild)
      {
        this._applyComputedWidth(vChild);
        vChild._renderRuntimeRight(this._lastRight);
      }
    }),


    /**
     * TODOC
     *
     * @type member
     * @param vChild {var} TODOC
     * @return {void}
     * @signature function(vChild)
     */
    layoutChild_location_vertical : qx.core.Variant.select("qx.client",
    {
      "mshtml|opera" : function(vChild) {
        this._applyComputedHeight(vChild);
      },

      "default" :  function(vChild)
      {
        this._applyComputedHeight(vChild);
        vChild._renderRuntimeBottom(this._lastBottom);
      }
    }),


    /**
     * TODOC
     *
     * @type member
     * @param vChild {var} TODOC
     * @param vJobs {var} TODOC
     * @return {void}
     * @signature function(vChild, vJobs)
     */
    layoutChild_location_right : qx.core.Variant.select("qx.client",
    {
      "mshtml|opera" : function(vChild, vJobs)
      {
        vChild._renderRuntimeLeft(this.getWidget().getInnerWidth() - this._lastRight - vChild.getBoxWidth());
        vChild._renderRuntimeTop(this._lastTop);

        this.layoutChild_location_vertical(vChild);

        this._lastRight += vChild.getBoxWidth();
      },

      "default" : function(vChild, vJobs)
      {
        vChild._renderRuntimeRight(this._lastRight);
        vChild._renderRuntimeTop(this._lastTop);

        this.layoutChild_location_vertical(vChild);

        this._lastRight += vChild.getBoxWidth();
      }
    }),


    /**
     * TODOC
     *
     * @type member
     * @param vChild {var} TODOC
     * @param vJobs {var} TODOC
     * @return {void}
     * @signature function(vChild, vJobs)
     */
    layoutChild_location_bottom : qx.core.Variant.select("qx.client",
    {
      "mshtml|opera" : function(vChild, vJobs)
      {
        vChild._renderRuntimeTop(this.getWidget().getInnerHeight() - this._lastBottom - vChild.getBoxHeight());
        vChild._renderRuntimeLeft(this._lastLeft);

        this.layoutChild_location_horizontal(vChild);

        this._lastBottom += vChild.getBoxHeight();
      },

      "default" : function(vChild, vJobs)
      {
        vChild._renderRuntimeBottom(this._lastBottom);
        vChild._renderRuntimeLeft(this._lastLeft);

        this.layoutChild_location_horizontal(vChild);

        this._lastBottom += vChild.getBoxHeight();
      }
    }),


    /**
     * TODOC
     *
     * @type member
     * @param vChild {var} TODOC
     * @param vJobs {var} TODOC
     * @return {void}
     * @signature function(vChild, vJobs)
     */
    layoutChild_location_default : qx.core.Variant.select("qx.client",
    {
      "mshtml|opera" : function(vChild, vJobs)
      {
        vChild._resetRuntimeRight();
        vChild._resetRuntimeBottom();

        vChild._renderRuntimeTop(this._lastTop);
        vChild._renderRuntimeLeft(this._lastLeft);

        this._applyComputedWidth(vChild);
        this._applyComputedHeight(vChild);
      },

      "default" :  function(vChild, vJobs)
      {
        vChild._resetRuntimeWidth();
        vChild._resetRuntimeHeight();

        vChild._renderRuntimeTop(this._lastTop);
        vChild._renderRuntimeRight(this._lastRight);
        vChild._renderRuntimeBottom(this._lastBottom);
        vChild._renderRuntimeLeft(this._lastLeft);

        this._applyComputedWidth(vChild);
        this._applyComputedHeight(vChild);
      }
    })
  }
});
