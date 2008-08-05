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
 * One of the widgets which could be used to structurize the interface.
 *
 *  qx.legacy.ui.pageview.buttonview.ButtonView creates the typical apple-like tabview-replacements which could also
 *  be found in more modern versions of the settings dialog in Mozilla Firefox.
 *
 * @appearance button-view
 */
qx.Class.define("qx.legacy.ui.pageview.buttonview.ButtonView",
{
  extend : qx.legacy.ui.pageview.AbstractPageView,




  /*
  *****************************************************************************
     CONSTRUCTOR
  *****************************************************************************
  */

  construct : function()
  {
    this.base(arguments, qx.legacy.ui.pageview.buttonview.Bar, qx.legacy.ui.pageview.buttonview.Pane);

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
      init : "button-view"
    },

    barPosition :
    {
      init   : "top",
      check : [ "top", "right", "bottom", "left" ],
      apply : "_applyBarPosition",
      event : "changeBarPosition"
    }
  },





  /*
  *****************************************************************************
     MEMBERS
  *****************************************************************************
  */

  members :
  {
    _applyBarPosition : function(value, old)
    {
      var vBar = this._bar;
      var vPane = this._pane;

      // move bar around and change orientation
      switch(value)
      {
        case "top":
          vBar.moveSelfToBegin();
          vBar.setHeight("auto");
          vBar.setWidth(null);
          vBar.setOrientation("horizontal");

          vPane.setWidth(null);
          vPane.setHeight("1*");

          this.setOrientation("vertical");
          break;

        case "bottom":
          vBar.moveSelfToEnd();
          vBar.setHeight("auto");
          vBar.setWidth(null);
          vBar.setOrientation("horizontal");

          vPane.setWidth(null);
          vPane.setHeight("1*");

          this.setOrientation("vertical");
          break;

        case "left":
          vBar.moveSelfToBegin();
          vBar.setWidth("auto");
          vBar.setHeight(null);
          vBar.setOrientation("vertical");

          vPane.setHeight(null);
          vPane.setWidth("1*");

          this.setOrientation("horizontal");
          break;

        case "right":
          vBar.moveSelfToEnd();
          vBar.setWidth("auto");
          vBar.setHeight(null);
          vBar.setOrientation("vertical");

          vPane.setHeight(null);
          vPane.setWidth("1*");

          this.setOrientation("horizontal");
          break;
      }

      // force re-apply of states for bar and pane
      this._addChildrenToStateQueue();

      // force re-apply of states for all tabs
      vBar._addChildrenToStateQueue();
    }
  }
});
