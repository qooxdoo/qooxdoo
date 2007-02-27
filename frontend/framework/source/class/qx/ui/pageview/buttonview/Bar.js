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

qx.Clazz.define("qx.ui.pageview.buttonview.Bar",
{
  extend : qx.ui.pageview.AbstractBar,




  /*
  *****************************************************************************
     CONSTRUCTOR
  *****************************************************************************
  */

  construct : function() {
    qx.ui.pageview.AbstractBar.call(this);
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
      _legacy      : true,
      type         : "string",
      defaultValue : "bar-view-bar"
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
     * @type member
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
     * @type member
     * @return {void}
     */
    _applyStateAppearance : function()
    {
      var vPos = this.getParent().getBarPosition();

      this._states.barLeft = vPos === "left";
      this._states.barRight = vPos === "right";
      this._states.barTop = vPos === "top";
      this._states.barBottom = vPos === "bottom";

      qx.ui.pageview.AbstractButton.prototype._applyStateAppearance.call(this);
    }
  }
});
