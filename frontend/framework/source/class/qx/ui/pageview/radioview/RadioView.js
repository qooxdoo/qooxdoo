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
     * Derrell Lipman (derrell)
     * Sebastian Werner (wpbasti)

************************************************************************ */

/* ************************************************************************

#module(ui_radioview)

************************************************************************ */

/**
 * One of the widgets which could be used to structurize the interface.
 *
 *  qx.ui.pageview.radioview.RadioView creates a series of horizontal radio
 *  buttons at the top of the view.
 *
 * @appearance radio-view
 */
qx.Class.define("qx.ui.pageview.radioview.RadioView",
{
  extend : qx.ui.pageview.AbstractPageView,




  /*
  *****************************************************************************
     CONSTRUCTOR
  *****************************************************************************
  */

  construct : function()
  {
    this.base(arguments, qx.ui.pageview.radioview.Bar, qx.ui.pageview.radioview.Pane);

    this.initBarPosition();
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
      init : "radio-view"
    },

    orientation :
    {
      refine : true,
      init : "vertical"
    },

    barPosition :
    {
      init   : "top",
      check : [ "top", "bottom" ],
      apply : "_applyBarPosition",
      event : "changeBarPosition"
    }
  },

  members :
  {
    _applyBarPosition : function(value, old)
    {
      var bar = this._bar;
      var pane = this._pane;

      bar.setWidth(null);
      bar.setHeight("auto");
      bar.setOrientation("vertical");
      pane.setWidth(null);
      pane.setHeight("1*");

      // move bar around and change orientation
      switch(value)
      {
        case "top":
          bar.moveSelfToBegin();
          this.setOrientation("vertical");
          break;

        case "bottom":
          bar.moveSelfToEnd();
          this.setOrientation("vertical");
          break;
      }

      // force re-apply of states for bar and pane
      this._addChildrenToStateQueue();

      // force re-apply of states for all tabs
      bar._addChildrenToStateQueue();
    }
  }
});
