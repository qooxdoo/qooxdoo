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

#module(ui_buttonview)

************************************************************************ */

/**
 * @appearance button-view-pane
 */
qx.Class.define("qx.ui.pageview.buttonview.Pane",
{
  extend : qx.ui.pageview.AbstractPane,





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
      init : "button-view-pane"
    }
  },




  /*
  *****************************************************************************
     MEMBERS
  *****************************************************************************
  */

  members :
  {
    _renderAppearance : function()
    {
      if (this._hasParent)
      {
        var vPos = this.getParent().getBarPosition();

        vPos === "top" || vPos === "bottom" ? this.addState("barHorizontal") : this.removeState("barHorizontal");
        vPos === "left" || vPos === "right" ? this.addState("barVertical") : this.removeState("barVertical");
      }

      this.base(arguments);
    }
  }
});
