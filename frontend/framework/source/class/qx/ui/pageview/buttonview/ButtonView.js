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

#module(ui_buttonview)

************************************************************************ */

/**
 * One of the widgets which could be used to structurize the interface.
 *
 *  qx.ui.pageview.buttonview.ButtonView creates the typical apple-like tabview-replacements which could also
 *  be found in more modern versions of the settings dialog in Mozilla Firefox.
 */
qx.Class.define("qx.ui.pageview.buttonview.ButtonView",
{
  extend : qx.ui.pageview.AbstractPageView,




  /*
  *****************************************************************************
     CONSTRUCTOR
  *****************************************************************************
  */

  construct : function()
  {
    this.base(arguments, qx.ui.pageview.buttonview.Bar, qx.ui.pageview.buttonview.Pane);

    this.setOrientation("vertical");
  },




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

    barPosition :
    {
      _legacy        : true,
      type           : "string",
      defaultValue   : "top",
      possibleValues : [ "top", "right", "bottom", "left" ]
    },

    appearance :
    {
      _legacy      : true,
      type         : "string",
      defaultValue : "bar-view"
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
     * @return {Boolean} TODOC
     */
    _modifyBarPosition : function(propValue, propOldValue, propData)
    {
      var vBar = this._bar;

      // move bar around and change orientation
      switch(propValue)
      {
        case "top":
          vBar.moveSelfToBegin();
          this.setOrientation("vertical");
          break;

        case "bottom":
          vBar.moveSelfToEnd();
          this.setOrientation("vertical");
          break;

        case "left":
          vBar.moveSelfToBegin();
          this.setOrientation("horizontal");
          break;

        case "right":
          vBar.moveSelfToEnd();
          this.setOrientation("horizontal");
          break;
      }

      // force re-apply of states for bar and pane
      this._addChildrenToStateQueue();

      // force re-apply of states for all tabs
      vBar._addChildrenToStateQueue();

      return true;
    }
  }
});
