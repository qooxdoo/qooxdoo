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
 * @appearance button-view-bar
 */
qx.Class.define("qx.legacy.ui.pageview.buttonview.Bar",
{
  extend : qx.legacy.ui.pageview.AbstractBar,





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
      init : "button-view-bar"
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
      EVENTS
    ---------------------------------------------------------------------------
    */

    /**
     * TODOC
     *
     * @param e {Event} TODOC
     * @return {var} TODOC
     */
    getWheelDelta : function(e)
    {
      var vWheelDelta = e.getWheelDelta();

      switch(this.getParent().getBarPosition())
      {
        case "left":
        case "right":
          vWheelDelta *= -1;
      }

      return vWheelDelta;
    },




    /*
    ---------------------------------------------------------------------------
      APPEARANCE ADDITIONS
    ---------------------------------------------------------------------------
    */

    /**
     * TODOC
     *
     * @return {void}
     */
    _renderAppearance : function()
    {
      if (this.getParent())
      {
        var vPos = this.getParent().getBarPosition();

        vPos === "left" ? this.addState("barLeft") : this.removeState("barLeft");
        vPos === "right" ? this.addState("barRight") : this.removeState("barRight");
        vPos === "top" ? this.addState("barTop") : this.removeState("barTop");
        vPos === "bottom" ? this.addState("barBottom") : this.removeState("barBottom");
      }

      this.base(arguments);
    }
  }
});
