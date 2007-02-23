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

#module(ui_layout)

************************************************************************ */

qx.Clazz.define("qx.ui.layout.FlowLayout",
{
  extend : qx.ui.core.Parent,




  /*
  *****************************************************************************
     CONSTRUCTOR
  *****************************************************************************
  */

  construct : function() {
    qx.ui.core.Parent.call(this);
  },




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
      _legacy           : true,
      type              : "number",
      defaultValue      : 0,
      addToQueueRuntime : true,
      impl              : "layout"
    },


    /** The spacing between childrens. Could be any positive integer value. */
    verticalSpacing :
    {
      _legacy           : true,
      type              : "number",
      defaultValue      : 0,
      addToQueueRuntime : true,
      impl              : "layout"
    },


    /** The horizontal align of the children. Allowed values are: "left" and "right" */
    horizontalChildrenAlign :
    {
      _legacy           : true,
      type              : "string",
      defaultValue      : "left",
      possibleValues    : [ "left", "right" ],
      addToQueueRuntime : true
    },


    /** The vertical align of the children. Allowed values are: "top" and "bottom" */
    verticalChildrenAlign :
    {
      _legacy           : true,
      type              : "string",
      defaultValue      : "top",
      possibleValues    : [ "top", "bottom" ],
      addToQueueRuntime : true
    },


    /** Should the children be layouted in reverse order? */
    reverseChildrenOrder :
    {
      _legacy           : true,
      type              : "boolean",
      defaultValue      : false,
      addToQueueRuntime : true,
      impl              : "layout"
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
      return new qx.renderer.layout.FlowLayoutImpl(this);
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
      qx.ui.core.Parent.prototype._changeInnerWidth.call(this, vNew, vOld);

      // allow 'auto' values for height to update when the inner width changes
      this._invalidatePreferredInnerHeight();
    },




    /*
    ---------------------------------------------------------------------------
      MODIFIER
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
    _modifyLayout : function(propValue, propOldValue, propData)
    {
      // invalidate inner preferred dimensions
      this._invalidatePreferredInnerDimensions();

      return true;
    }
  }
});
