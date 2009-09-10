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

#asset(qx/compat/icon/CrystalClear/16/actions/dialog-cancel.png)

************************************************************************ */

/**
 * @appearance tab-view-button
 * @state checked Set by {@link #checked}
 * @state over
 */
qx.Class.define("qx.legacy.ui.pageview.tabview.Button",
{
  extend : qx.legacy.ui.pageview.AbstractButton,






  /*
  *****************************************************************************
     EVENTS
  *****************************************************************************
  */

  events: {
    "closetab" : "qx.event.type.Event"
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
      init : "tab-view-button"
    },


    /** default Close Tab Button */
    showCloseButton :
    {
      check : "Boolean",
      init : false,
      apply : "_applyShowCloseButton",
      event : "changeShowCloseButton"
    },


    /** Close Tab Icon */
    closeButtonImage :
    {
      check : "String",
      init : "icon/16/actions/dialog-cancel.png",
      apply : "_applyCloseButtonImage"
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
    _onkeydown : function(e)
    {
      var identifier = e.getKeyIdentifier();

      if (identifier == "Enter" || identifier == "Space")
      {
        // there is no toggeling, just make it checked
        this.setChecked(true);
      }
    },


    /**
     * TODOC
     *
     * @param e {Event} TODOC
     * @return {void}
     */
    _onKeyPress : function(e)
    {
      switch(e.getKeyIdentifier())
      {
        case "Left":
          var vPrev = this.getPreviousActiveSibling();

          if (vPrev && vPrev != this)
          {
            // we want to enable the outline border, because
            // the user used the keyboard for activation
            delete qx.legacy.event.handler.FocusHandler.mouseFocus;

            // focus previous tab
            vPrev.setFocused(true);

            // and naturally make it also checked
            vPrev.setChecked(true);
          }

          break;

        case "Right":
          var vNext = this.getNextActiveSibling();

          if (vNext && vNext != this)
          {
            // we want to enable the outline border, because
            // the user used the keyboard for activation
            delete qx.legacy.event.handler.FocusHandler.mouseFocus;

            // focus next tab
            vNext.setFocused(true);

            // and naturally make it also checked
            vNext.setChecked(true);
          }

          break;
      }
    },


    /**
     * TODOC
     *
     * @param e {Event} TODOC
     * @return {void}
     */
    _ontabclose : function(e) {
      this.fireDataEvent("closetab", this);
      e.stopPropagation();
    },




    /*
    ---------------------------------------------------------------------------
      APPLY ROUTINES
    ---------------------------------------------------------------------------
    */

    _applyChecked : function(value, old)
    {
      this.base(arguments, value, old);

      this.setZIndex(value ? 1 : 0);
    },

    /**
     * TODOC
     *
     * @param value {var} Current value
     * @param old {var} Previous value
     */
    _applyShowCloseButton : function(value, old)
    {
      // if no image exists, then create one
      if (!this._closeButtonImage) {
        this._closeButtonImage = new qx.legacy.ui.basic.Image(this.getCloseButtonImage());
      }

      if (value)
      {
        this._closeButtonImage.addListener("click", this._ontabclose, this);
        this.add(this._closeButtonImage);
      }
      else
      {
        this.remove(this._closeButtonImage);
        this._closeButtonImage.removeListener("click", this._ontabclose, this);
      }
    },


    /**
     * TODOC
     *
     * @param value {var} Current value
     * @param old {var} Previous value
     */
    _applyCloseButtonImage : function(value, old)
    {
      if (this._closeButtonImage) {
        this._closeButtonImage.setSource(value);
      }
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
      if (this.getView())
      {
        this.isFirstVisibleChild() ? this.addState("firstChild") : this.removeState("lastChild");
        this.isLastVisibleChild() ? this.addState("lastChild") : this.removeState("lastChild");
        this.getView().getAlignTabsToLeft() ? this.addState("alignLeft") : this.removeState("alignLeft");
        !this.getView().getAlignTabsToLeft() ? this.addState("alignRight") : this.removeState("alignRight");
        this.getView().getPlaceBarOnTop() ? this.addState("barTop") : this.removeState("barTop");
        !this.getView().getPlaceBarOnTop() ? this.addState("barBottom") : this.removeState("barBottom");
      }

      this.base(arguments);
    }
  },




  /*
  *****************************************************************************
     DESTRUCTOR
  *****************************************************************************
  */

  destruct : function() {
    this._disposeObjects("_closeButtonImage");
  }
});
