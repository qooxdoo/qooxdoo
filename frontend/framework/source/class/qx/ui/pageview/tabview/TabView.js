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

#module(ui_tabview)

************************************************************************ */

/**
 * @appearance tab-view
 */
qx.Class.define("qx.ui.pageview.tabview.TabView",
{
  extend : qx.ui.pageview.AbstractPageView,




  /*
  *****************************************************************************
     CONSTRUCTOR
  *****************************************************************************
  */

  construct : function() {
    this.base(arguments, qx.ui.pageview.tabview.Bar, qx.ui.pageview.tabview.Pane);
  },




  /*
  *****************************************************************************
     PROPERTIES
  *****************************************************************************
  */

  properties :
  {
    appearance :
    {
      refine : true,
      init : "tab-view"
    },

    orientation :
    {
      refine : true,
      init : "vertical"
    },

    alignTabsToLeft :
    {
      check : "Boolean",
      init : true,
      apply : "_modifyAlignTabsToLeft"
    },

    placeBarOnTop :
    {
      check : "Boolean",
      init : true,
      apply : "_modifyPlaceBarOnTop"
    }
  },




  /*
  *****************************************************************************
     MEMBERS
  *****************************************************************************
  */

  members :
  {
    /**
     * TODOC
     *
     * @type member
     * @param propValue {var} Current value
     * @param propOldValue {var} Previous value
     * @param propData {var} Property configuration map
     * @return {Boolean} TODOC
     */
    _modifyAlignTabsToLeft : function(propValue, propOldValue, propData)
    {
      var vBar = this._bar;

      vBar.setHorizontalChildrenAlign(propValue ? "left" : "right");

      // force re-apply of states for all tabs
      vBar._addChildrenToStateQueue();
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
    _modifyPlaceBarOnTop : function(propValue, propOldValue, propData)
    {
      // This does not work if we use flexible zones
      // this.setReverseChildrenOrder(!propValue);
      var vBar = this._bar;

      // move bar around
      if (propValue) {
        vBar.moveSelfToBegin();
      } else {
        vBar.moveSelfToEnd();
      }

      // force re-apply of states for all tabs
      vBar._addChildrenToStateQueue();
    }
  }
});
