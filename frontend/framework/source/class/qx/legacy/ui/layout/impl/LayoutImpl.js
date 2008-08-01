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

/**
 * Abstact base class of all layout implementations
 *
 * @param vWidget {qx.legacy.ui.core.Parent} reference to the associated widget
 */
qx.Class.define("qx.legacy.ui.layout.impl.LayoutImpl",
{
  extend : qx.core.Object,




  /*
  *****************************************************************************
     CONSTRUCTOR
  *****************************************************************************
  */

  construct : function(vWidget)
  {
    this.base(arguments);

    this._widget = vWidget;
  },




  /*
  *****************************************************************************
     MEMBERS
  *****************************************************************************
  */

  members :
  {
    /**
     * Returns the associated widget
     *
     * @return {qx.legacy.ui.core.Parent} reference to the associated widget
     */
    getWidget : function() {
      return this._widget;
    },

    /*
      Global Structure:
      [01] COMPUTE BOX DIMENSIONS FOR AN INDIVIDUAL CHILD
      [02] COMPUTE NEEDED DIMENSIONS FOR AN INDIVIDUAL CHILD
      [03] COMPUTE NEEDED DIMENSIONS FOR ALL CHILDREN
      [04] UPDATE LAYOUT WHEN A CHILD CHANGES ITS OUTER DIMENSIONS
      [05] UPDATE CHILD ON INNER DIMENSION CHANGES OF LAYOUT
      [06] UPDATE LAYOUT ON JOB QUEUE FLUSH
      [07] UPDATE CHILDREN ON JOB QUEUE FLUSH
      [08] CHILDREN ADD/REMOVE/MOVE HANDLING
      [09] FLUSH LAYOUT QUEUES OF CHILDREN
      [10] LAYOUT CHILD
    */

    /*
    ---------------------------------------------------------------------------
      [01] COMPUTE BOX DIMENSIONS FOR AN INDIVIDUAL CHILD
    ---------------------------------------------------------------------------
    */

    /**
     * Compute and return the box width of the given child
     *
     * @param vChild {qx.legacy.ui.core.Widget} TODOC
     * @return {Integer} box width of the given child
     */
    computeChildBoxWidth : function(vChild) {
      return vChild.getWidthValue() || vChild._computeBoxWidthFallback();
    },


    /**
     * Compute and return the box height of the given child
     *
     * @param vChild {qx.legacy.ui.core.Widget} TODOC
     * @return {Integer} box height of the given child
     */
    computeChildBoxHeight : function(vChild) {
      return vChild.getHeightValue() || vChild._computeBoxHeightFallback();
    },




    /*
    ---------------------------------------------------------------------------
      [02] COMPUTE NEEDED DIMENSIONS FOR AN INDIVIDUAL CHILD
    ---------------------------------------------------------------------------
    */

    /**
     * Compute and return the needed width of the given child
     *
     * @param vChild {qx.legacy.ui.core.Widget} TODOC
     * @return {Integer} needed width
     */
    computeChildNeededWidth : function(vChild)
    {
      // omit ultra long lines, these two variables only needed once
      // here, but this enhance the readability of the code :)
      var vMinBox = vChild._computedMinWidthTypePercent ? null : vChild.getMinWidthValue();
      var vMaxBox = vChild._computedMaxWidthTypePercent ? null : vChild.getMaxWidthValue();

      var vBox = (vChild._computedWidthTypePercent || vChild._computedWidthTypeFlex ? null : vChild.getWidthValue()) || vChild.getPreferredBoxWidth() || 0;

      return qx.lang.Number.limit(vBox, vMinBox, vMaxBox) + vChild.getMarginLeft() + vChild.getMarginRight();
    },


    /**
     * Compute and return the needed height of the given child
     *
     * @param vChild {qx.legacy.ui.core.Widget} TODOC
     * @return {Integer} needed height
     */
    computeChildNeededHeight : function(vChild)
    {
      // omit ultra long lines, these two variables only needed once
      // here, but this enhance the readability of the code :)
      var vMinBox = vChild._computedMinHeightTypePercent ? null : vChild.getMinHeightValue();
      var vMaxBox = vChild._computedMaxHeightTypePercent ? null : vChild.getMaxHeightValue();

      var vBox = (vChild._computedHeightTypePercent || vChild._computedHeightTypeFlex ? null : vChild.getHeightValue()) || vChild.getPreferredBoxHeight() || 0;

      return qx.lang.Number.limit(vBox, vMinBox, vMaxBox) + vChild.getMarginTop() + vChild.getMarginBottom();
    },




    /*
    ---------------------------------------------------------------------------
      [03] COMPUTE NEEDED DIMENSIONS FOR ALL CHILDREN
    ---------------------------------------------------------------------------
    */

    /**
     * Calculate the maximum needed width of all children
     *
     * @return {Integer} maximum needed width of all children
     */
    computeChildrenNeededWidth_max : function()
    {
      for (var i=0, ch=this.getWidget().getVisibleChildren(), chl=ch.length, maxv=0; i<chl; i++) {
        maxv = Math.max(maxv, ch[i].getNeededWidth());
      }

      return maxv;
    },


    /**
     * Calculate the maximum needed height of all children
     *
     * @return {Integer} maximum needed height of all children
     */
    computeChildrenNeededHeight_max : function()
    {
      for (var i=0, ch=this.getWidget().getVisibleChildren(), chl=ch.length, maxv=0; i<chl; i++) {
        maxv = Math.max(maxv, ch[i].getNeededHeight());
      }

      return maxv;
    },


    /**
     * Compute and return the width needed by all children of this widget
     *
     * @return {Integer} TODOC
     */
    computeChildrenNeededWidth_sum : function()
    {
      for (var i=0, ch=this.getWidget().getVisibleChildren(), chl=ch.length, sumv=0; i<chl; i++) {
        sumv += ch[i].getNeededWidth();
      }

      return sumv;
    },


    /**
     * Compute and return the height needed by all children of this widget
     *
     * @return {Integer} height needed by all children of this widget
     */
    computeChildrenNeededHeight_sum : function()
    {
      for (var i=0, ch=this.getWidget().getVisibleChildren(), chl=ch.length, sumv=0; i<chl; i++) {
        sumv += ch[i].getNeededHeight();
      }

      return sumv;
    },


    /**
     * Compute and return the width needed by all children of this widget
     *
     * @return {Integer} width needed by all children of this widget
     */
    computeChildrenNeededWidth : null,  // alias set in defer


    /**
     * Compute and return the height needed by all children of this widget
     *
     * @return {Integer} height needed by all children of this widget
     */
    computeChildrenNeededHeight : null,  // alias set in defer




    /*
    ---------------------------------------------------------------------------
      [04] UPDATE LAYOUT WHEN A CHILD CHANGES ITS OUTER DIMENSIONS
    ---------------------------------------------------------------------------
    */

    /**
     * Things to do and layout when any of the childs changes its outer width.
     * Needed by layouts where the children depend on each other, like flow or box layouts.
     *
     * Subclasses might implement this method
     *
     * @param vChild {qx.legacy.ui.core.Widget} changed child widget
     * @return {void}
     */
    updateSelfOnChildOuterWidthChange : function(vChild) {},


    /**
     * Things to do and layout when any of the childs changes its outer height.
     * Needed by layouts where the children depend on each other, like flow or box layouts.
     *
     * Subclasses might implement this method
     *
     * @param vChild {qx.legacy.ui.core.Widget} changed child widget
     * @return {void}
     */
    updateSelfOnChildOuterHeightChange : function(vChild) {},




    /*
    ---------------------------------------------------------------------------
      [05] UPDATE CHILD ON INNER DIMENSION CHANGES OF LAYOUT
    ---------------------------------------------------------------------------
    */

    /**
     * Actions that should be done if the inner width of the layout widget has changed.
     * Normally this includes updates to percent values and ranges.
     *
     * Subclasses might implement this method
     *
     * @param vChild {qx.legacy.ui.core.Widget} changed child widget
     * @return {boolean}
     */
    updateChildOnInnerWidthChange : function(vChild) {},


    /**
     * Actions that should be done if the inner height of the layout widget has changed.
     * Normally this includes updates to percent values and ranges.
     *
     * Subclasses might implement this method
     *
     * @param vChild {qx.legacy.ui.core.Widget} changed child widget
     * @return {void}
     */
    updateChildOnInnerHeightChange : function(vChild) {},




    /*
    ---------------------------------------------------------------------------
      [06] UPDATE LAYOUT ON JOB QUEUE FLUSH
    ---------------------------------------------------------------------------
    */

    /**
     * Invalidate and recompute cached data according to job queue.
     * This is executed at the beginning of the job queue handling.
     *
     * Subclasses might implement this method
     *
     * @param vJobQueue {Object} TODOC
     * @return {void}
     */
    updateSelfOnJobQueueFlush : function(vJobQueue) {},




    /*
    ---------------------------------------------------------------------------
      [07] UPDATE CHILDREN ON JOB QUEUE FLUSH
    ---------------------------------------------------------------------------
    */

    /**
     * Updates children on job queue flush.
     * This is executed at the end of the job queue handling.
     *
     * Subclasses might implement this method
     *
     * @param vJobQueue {Object} TODOC
     * @return {boolean}
     */
    updateChildrenOnJobQueueFlush : function(vJobQueue) {},




    /*
    ---------------------------------------------------------------------------
      [08] CHILDREN ADD/REMOVE/MOVE HANDLING
    ---------------------------------------------------------------------------
    */

    /**
     * Add child to current layout. Rarely needed by some layout implementations.
     *
     * Subclasses might implement this method
     *
     * @param vChild {qx.legacy.ui.core.Widget} newly added child
     * @param vIndex {Integer} index of the child
     * @return {void}
     */
    updateChildrenOnAddChild : function(vChild, vIndex) {},


    /**
     * Remove child from current layout.
     *  Needed by layouts where the children depend on each other, like flow or box layouts.
     *
     *  Subclasses might implement this method
     *
     * @param vChild {qx.legacy.ui.core.Widget} newly added child
     * @param vIndex {Integer} index of the child
     * @return {void}
     */
    updateChildrenOnRemoveChild : function(vChild, vIndex) {},


    /**
     * Move child within its parent to a new position.
     *  Needed by layouts where the children depend on each other, like flow or box layouts.
     *
     * Subclasses might implement this method
     *
     * @param vChild {qx.legacy.ui.core.Widget} newly added child
     * @param vIndex {Integer} new index of the child
     * @param vOldIndex {Integer} old index of the child
     * @return {void}
     */
    updateChildrenOnMoveChild : function(vChild, vIndex, vOldIndex) {},




    /*
    ---------------------------------------------------------------------------
      [09] FLUSH LAYOUT QUEUES OF CHILDREN
    ---------------------------------------------------------------------------
    */

    /**
     * Has full control of the order in which the registered
     * (or non-registered) children should be layouted.
     *
     * @param vChildrenQueue {Object} TODOC
     * @return {void}
     */
    flushChildrenQueue : function(vChildrenQueue)
    {
      var vWidget = this.getWidget();

      for (var vHashCode in vChildrenQueue) {
        vWidget._layoutChild(vChildrenQueue[vHashCode]);
      }
    },




    /*
    ---------------------------------------------------------------------------
      [10] LAYOUT CHILD
    ---------------------------------------------------------------------------
    */

    /**
     * Called from qx.legacy.ui.core.Parent. Its task is to apply the layout
     * (excluding border and padding) to the child.
     *
     * @param vChild {qx.legacy.ui.core.Widget} child to layout
     * @param vJobs {Set} layout changes to perform
     * @return {void}
     */
    layoutChild : function(vChild, vJobs) {},


    /**
     * Apply min-/max-width to the child. Direct usage of stylesheet properties.
     * This is only possible in modern capable clients (i.e. excluding all current
     *  versions of Internet Explorer)
     *
     * @param vChild {qx.legacy.ui.core.Widget} child to layout
     * @param vJobs {Set} layout changes to perform
     * @return {void}
     * @signature function(vChild, vJobs)
     */
    layoutChild_sizeLimitX : qx.core.Variant.select("qx.client",
    {
      "mshtml" : qx.lang.Function.returnTrue,

      "default" : function(vChild, vJobs)
      {
        if (vJobs.minWidth) {
          vChild._computedMinWidthTypeNull ? vChild._resetRuntimeMinWidth() : vChild._renderRuntimeMinWidth(vChild.getMinWidthValue());
        } else if (vJobs.initial && !vChild._computedMinWidthTypeNull) {
          vChild._renderRuntimeMinWidth(vChild.getMinWidthValue());
        }

        if (vJobs.maxWidth) {
          vChild._computedMaxWidthTypeNull ? vChild._resetRuntimeMaxWidth() : vChild._renderRuntimeMaxWidth(vChild.getMaxWidthValue());
        } else if (vJobs.initial && !vChild._computedMaxWidthTypeNull) {
          vChild._renderRuntimeMaxWidth(vChild.getMaxWidthValue());
        }
      }
    }),


    /**
     * Apply min-/max-height to the child. Direct usage of stylesheet properties.
     * This is only possible in modern capable clients (i.e. excluding all current
     *  versions of Internet Explorer)
     *
     * @param vChild {qx.legacy.ui.core.Widget} child to layout
     * @param vJobs {Set} layout changes to perform
     * @return {void}
     * @signature function(vChild, vJobs)
     */
    layoutChild_sizeLimitY :  qx.core.Variant.select("qx.client",
    {
      "mshtml" : qx.lang.Function.returnTrue,

      "default" : function(vChild, vJobs)
      {
        if (vJobs.minHeight) {
          vChild._computedMinHeightTypeNull ? vChild._resetRuntimeMinHeight() : vChild._renderRuntimeMinHeight(vChild.getMinHeightValue());
        } else if (vJobs.initial && !vChild._computedMinHeightTypeNull) {
          vChild._renderRuntimeMinHeight(vChild.getMinHeightValue());
        }

        if (vJobs.maxHeight) {
          vChild._computedMaxHeightTypeNull ? vChild._resetRuntimeMaxHeight() : vChild._renderRuntimeMaxHeight(vChild.getMaxHeightValue());
        } else if (vJobs.initial && !vChild._computedMaxHeightTypeNull) {
          vChild._renderRuntimeMaxHeight(vChild.getMaxHeightValue());
        }
      }
    }),


    /**
     * Apply the X margin values as pure stylesheet equivalent.
     *
     * @param vChild {qx.legacy.ui.core.Widget} child to layout
     * @param vJobs {Set} layout changes to perform
     * @return {void}
     */
    layoutChild_marginX : function(vChild, vJobs)
    {
      if (vJobs.marginLeft || vJobs.initial)
      {
        var vValueLeft = vChild.getMarginLeft();
        vValueLeft != null ? vChild._renderRuntimeMarginLeft(vValueLeft) : vChild._resetRuntimeMarginLeft();
      }

      if (vJobs.marginRight || vJobs.initial)
      {
        var vValueRight = vChild.getMarginRight();
        vValueRight != null ? vChild._renderRuntimeMarginRight(vValueRight) : vChild._resetRuntimeMarginRight();
      }
    },


    /**
     * Apply the Y margin values as pure stylesheet equivalent.
     *
     * @param vChild {qx.legacy.ui.core.Widget} child to layout
     * @param vJobs {Set} layout changes to perform
     * @return {void}
     */
    layoutChild_marginY : function(vChild, vJobs)
    {
      if (vJobs.marginTop || vJobs.initial)
      {
        var vValueTop = vChild.getMarginTop();
        vValueTop != null ? vChild._renderRuntimeMarginTop(vValueTop) : vChild._resetRuntimeMarginTop();
      }

      if (vJobs.marginBottom || vJobs.initial)
      {
        var vValueBottom = vChild.getMarginBottom();
        vValueBottom != null ? vChild._renderRuntimeMarginBottom(vValueBottom) : vChild._resetRuntimeMarginBottom();
      }
    },


    /**
     * TODOC
     *
     * @param vChild {var} TODOC
     * @param vJobs {var} TODOC
     * @return {var} TODOC
     */
    layoutChild_sizeX_essentialWrapper : function(vChild, vJobs) {
      return vChild._isWidthEssential() ? this.layoutChild_sizeX(vChild, vJobs) : vChild._resetRuntimeWidth();
    },


    /**
     * TODOC
     *
     * @param vChild {var} TODOC
     * @param vJobs {var} TODOC
     * @return {var} TODOC
     */
    layoutChild_sizeY_essentialWrapper : function(vChild, vJobs) {
      return vChild._isHeightEssential() ? this.layoutChild_sizeY(vChild, vJobs) : vChild._resetRuntimeHeight();
    }
  },




  /*
  *****************************************************************************
     DEFER
  *****************************************************************************
  */

  defer : function(statics, members)
  {
    members.computeChildrenNeededWidth = members.computeChildrenNeededWidth_max;
    members.computeChildrenNeededHeight = members.computeChildrenNeededHeight_max;
  },




  /*
  *****************************************************************************
     DESTRUCTOR
  *****************************************************************************
  */

  destruct : function() {
    this._disposeFields("_widget");
  }
});
