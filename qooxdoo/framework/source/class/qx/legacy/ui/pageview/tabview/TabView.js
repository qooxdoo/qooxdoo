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
 * @appearance tab-view
 */
qx.Class.define("qx.legacy.ui.pageview.tabview.TabView",
{
  extend : qx.legacy.ui.pageview.AbstractPageView,




  /*
  *****************************************************************************
     CONSTRUCTOR
  *****************************************************************************
  */

  construct : function() {
    this.base(arguments, qx.legacy.ui.pageview.tabview.Bar, qx.legacy.ui.pageview.tabview.Pane);
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
      apply : "_applyAlignTabsToLeft"
    },

    placeBarOnTop :
    {
      check : "Boolean",
      init : true,
      apply : "_applyPlaceBarOnTop"
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
     * @param value {var} Current value
     * @param old {var} Previous value
     */
    _applyAlignTabsToLeft : function(value, old)
    {
      var vBar = this._bar;

      vBar.setHorizontalChildrenAlign(value ? "left" : "right");

      // force re-apply of states for all tabs
      vBar._addChildrenToStateQueue();
    },


    /**
     * TODOC
     *
     * @param value {var} Current value
     * @param old {var} Previous value
     */
    _applyPlaceBarOnTop : function(value, old)
    {
      // This does not work if we use flexible zones
      // this.setReverseChildrenOrder(!value);
      var vBar = this._bar;

      // move bar around
      if (value) {
        vBar.moveSelfToBegin();
      } else {
        vBar.moveSelfToEnd();
      }

      // force re-apply of states for all tabs
      vBar._addChildrenToStateQueue();
    }
  }
});
