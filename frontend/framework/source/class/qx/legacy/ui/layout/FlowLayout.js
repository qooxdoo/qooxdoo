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

qx.Class.define("qx.ui.layout.FlowLayout",
{
  extend : qx.ui.core.Parent,




  /*
  *****************************************************************************
     PROPERTIES
  *****************************************************************************
  */

  properties :
  {
    /** The spacing between childrens. Could be any positive integer value. */
    horizontalSpacing :
    {
      check : "Integer",
      init : 0,
      apply : "_applyHorizontalSpacing",
      themeable : true
    },


    /** The spacing between childrens. Could be any positive integer value. */
    verticalSpacing :
    {
      check : "Integer",
      init : 0,
      apply : "_applyVerticalSpacing",
      themeable : true
    },


    /** The horizontal align of the children. Allowed values are: "left" and "right" */
    horizontalChildrenAlign :
    {
      check : [ "left", "right" ],
      init : "left",
      apply : "_applyHorizontalChildrenAlign",
      themeable : true
    },


    /** The vertical align of the children. Allowed values are: "top" and "bottom" */
    verticalChildrenAlign :
    {
      check : [ "top", "bottom" ],
      init : "top",
      apply : "_applyVerticalChildrenAlign",
      themeable : true
    },


    /** Should the children be layouted in reverse order? */
    reverseChildrenOrder :
    {
      check : "Boolean",
      init : false,
      apply : "_applyReverseChildrenOrder",
      themeable : true
    }
  },




  /*
  *****************************************************************************
     MEMBERS
  *****************************************************************************
  */

  members :
  {
    _applyHorizontalSpacing : function(value, old)
    {
      this.addToQueueRuntime("horizontalSpacing");

      // invalidate inner preferred dimensions
      this._invalidatePreferredInnerDimensions();
    },

    _applyVerticalSpacing : function(value, old)
    {
      this.addToQueueRuntime("verticalSpacing");

      // invalidate inner preferred dimensions
      this._invalidatePreferredInnerDimensions();
    },

    _applyHorizontalChildrenAlign :function(value, old)
    {
      this.addToQueueRuntime("horizontalChildrenAlign");
    },

    _applyVerticalChildrenAlign :function(value, old)
    {
      this.addToQueueRuntime("verticalChildrenAlign");
    },

    _applyReverseChildrenOrder : function(value, old)
    {
      this.addToQueueRuntime("reverseChildrenOrder");

      // invalidate inner preferred dimensions
      this._invalidatePreferredInnerDimensions();
    },





    /*
    ---------------------------------------------------------------------------
      INIT LAYOUT IMPL
    ---------------------------------------------------------------------------
    */

    /**
     * This creates an new instance of the layout impl this widget uses
     *
     * @type member
     * @return {qx.ui.layout.BoxLayout} TODOC
     */
    _createLayoutImpl : function() {
      return new qx.ui.layout.impl.FlowLayoutImpl(this);
    },




    /*
    ---------------------------------------------------------------------------
      DIMENSION CACHE
    ---------------------------------------------------------------------------
    */

    /**
     * TODOC
     *
     * @type member
     * @param vNew {var} TODOC
     * @param vOld {var} TODOC
     * @return {void}
     */
    _changeInnerWidth : function(vNew, vOld)
    {
      this.base(arguments, vNew, vOld);

      // allow 'auto' values for height to update when the inner width changes
      this._invalidatePreferredInnerHeight();
    }
  }
});
