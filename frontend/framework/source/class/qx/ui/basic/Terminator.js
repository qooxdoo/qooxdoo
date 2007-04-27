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

#module(ui_core)

************************************************************************ */

/** This widget is the last widget of the current child chain. */
qx.Class.define("qx.ui.basic.Terminator",
{
  extend : qx.ui.core.Widget,





  /*
  *****************************************************************************
     MEMBERS
  *****************************************************************************
  */

  members :
  {
    /*
    ---------------------------------------------------------------------------
      PADDING
    ---------------------------------------------------------------------------
    */

    /**
     * TODOC
     *
     * @type member
     * @param changes {Map} TODOC
     * @return {void}
     */
    renderPadding : function(changes)
    {
      if (changes.paddingLeft) {
        this._applyRuntimePaddingLeft(this.getPaddingLeft());
      }

      if (changes.paddingRight) {
        this._applyRuntimePaddingRight(this.getPaddingRight());
      }

      if (changes.paddingTop) {
        this._applyRuntimePaddingTop(this.getPaddingTop());
      }

      if (changes.paddingBottom) {
        this._applyRuntimePaddingBottom(this.getPaddingBottom());
      }
    },





    /*
    ---------------------------------------------------------------------------
      CONTENT
    ---------------------------------------------------------------------------
    */

    /**
     * TODOC
     *
     * @type member
     * @return {void}
     */
    _renderContent : function()
    {
      // Small optimization: Only add innerPreferred jobs
      // if we don't have a static width
      if (this._computedWidthTypePixel) {
        this._cachedPreferredInnerWidth = null;
      } else {
        this._invalidatePreferredInnerWidth();
      }

      // Small optimization: Only add innerPreferred jobs
      // if we don't have a static height
      if (this._computedHeightTypePixel) {
        this._cachedPreferredInnerHeight = null;
      } else {
        this._invalidatePreferredInnerHeight();
      }

      // add load job
      if (this._initialLayoutDone) {
        this.addToJobQueue("load");
      }
    },


    /**
     * TODOC
     *
     * @type member
     * @param changes {var} TODOC
     * @return {void}
     */
    _layoutPost : function(changes)
    {
      if (changes.initial || changes.load || changes.width || changes.height) {
        this._postApply();
      }
    },

    /**
     * @signature function()
     */
    _postApply : qx.lang.Function.returnTrue,




    /*
    ---------------------------------------------------------------------------
      BOX DIMENSION HELPERS
    ---------------------------------------------------------------------------
    */

    _computeBoxWidthFallback : function() {
      return this.getPreferredBoxWidth();
    },

    _computeBoxHeightFallback : function() {
      return this.getPreferredBoxHeight();
    },

    /**
     * @signature function()
     */
    _computePreferredInnerWidth : qx.lang.Function.returnZero,

    /**
     * @signature function()
     */
    _computePreferredInnerHeight : qx.lang.Function.returnZero,




    /*
    ---------------------------------------------------------------------------
      METHODS TO GIVE THE LAYOUTERS INFORMATIONS
    ---------------------------------------------------------------------------
    */

    /**
     * TODOC
     *
     * @type member
     * @return {Boolean} TODOC
     */
    _isWidthEssential : function()
    {
      if (!this._computedLeftTypeNull && !this._computedRightTypeNull) {
        return true;
      }

      if (!this._computedWidthTypeNull && !this._computedWidthTypeAuto) {
        return true;
      }

      if (!this._computedMinWidthTypeNull && !this._computedMinWidthTypeAuto) {
        return true;
      }

      if (!this._computedMaxWidthTypeNull && !this._computedMaxWidthTypeAuto) {
        return true;
      }

      if (this._borderElement) {
        return true;
      }

      return false;
    },


    /**
     * TODOC
     *
     * @type member
     * @return {Boolean} TODOC
     */
    _isHeightEssential : function()
    {
      if (!this._computedTopTypeNull && !this._computedBottomTypeNull) {
        return true;
      }

      if (!this._computedHeightTypeNull && !this._computedHeightTypeAuto) {
        return true;
      }

      if (!this._computedMinHeightTypeNull && !this._computedMinHeightTypeAuto) {
        return true;
      }

      if (!this._computedMaxHeightTypeNull && !this._computedMaxHeightTypeAuto) {
        return true;
      }

      if (this._borderElement) {
        return true;
      }

      return false;
    }
  }
});
