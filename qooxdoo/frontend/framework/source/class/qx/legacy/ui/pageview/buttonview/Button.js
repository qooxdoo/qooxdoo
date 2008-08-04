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
 * @appearance button-view-button
 * @state checked Set by {@link #checked}
 * @state over
 */
qx.Class.define("qx.legacy.ui.pageview.buttonview.Button",
{
  extend : qx.legacy.ui.pageview.AbstractButton,





  /*
  *****************************************************************************
     PROPERTIES
  *****************************************************************************
  */

  properties :
  {
    allowStretchX :
    {
      refine : true,
      init : true
    },

    allowStretchY :
    {
      refine : true,
      init : true
    },

    appearance :
    {
      refine : true,
      init : "button-view-button"
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
      EVENT HANDLER
    ---------------------------------------------------------------------------
    */

    /**
     * TODOC
     *
     * @param e {Event} TODOC
     * @return {void}
     */
    _onKeyPress : function(e)
    {
      switch(this.getView().getBarPosition())
      {
        case "top":
        case "bottom":
          switch(e.getKeyIdentifier())
          {
            case "Left":
              var vPrevious = true;
              break;

            case "Right":
              var vPrevious = false;
              break;

            default:
              return;
          }

          break;

        case "left":
        case "right":
          switch(e.getKeyIdentifier())
          {
            case "Up":
              var vPrevious = true;
              break;

            case "Down":
              var vPrevious = false;
              break;

            default:
              return;
          }

          break;

        default:
          return;
      }

      var vChild =
        (vPrevious
         ? (this.isFirstChild()
            ? this.getParent().getLastChild()
            : this.getPreviousSibling())
         : (this.isLastChild()
            ? this.getParent().getFirstChild()
            : this.getNextSibling()));

      // focus next/previous button
      vChild.setFocused(true);

      // and naturally also check it
      vChild.setChecked(true);
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
        var vPos = this.getView().getBarPosition();

        vPos === "left" ? this.addState("barLeft") : this.removeState("barLeft");
        vPos === "right" ? this.addState("barRight") : this.removeState("barRight");
        vPos === "top" ? this.addState("barTop") : this.removeState("barTop");
        vPos === "bottom" ? this.addState("barBottom") : this.removeState("barBottom");
      }

      this.base(arguments);
    }
  }
});
