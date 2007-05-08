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
#embed(qx.icontheme/16/actions/dialog-cancel.png)

************************************************************************ */

/**
 * @appearance tab-view-button
 * @state checked Set by {@link #checked}
 * @state over
 */
qx.Class.define("qx.ui.pageview.tabview.Button",
{
  extend : qx.ui.pageview.AbstractButton,






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
      apply : "_modifyShowCloseButton",
      event : "changeShowCloseButton"
    },


    /** Close Tab Icon */
    closeButtonImage :
    {
      check : "String",
      init : "icon/16/actions/dialog-cancel.png",
      apply : "_modifyCloseButtonImage"
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
     * @type member
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
     * @type member
     * @param e {Event} TODOC
     * @return {void}
     */
    _onkeypress : function(e)
    {
      switch(e.getKeyIdentifier())
      {
        case "Left":
          var vPrev = this.getPreviousActiveSibling();

          if (vPrev && vPrev != this)
          {
            // we want to enable the outline border, because
            // the user used the keyboard for activation
            delete qx.event.handler.FocusHandler.mouseFocus;

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
            delete qx.event.handler.FocusHandler.mouseFocus;

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
     * @type member
     * @param e {Event} TODOC
     * @return {void}
     */
    _ontabclose : function(e) {
      this.createDispatchDataEvent("closetab", this);
    },




    /*
    ---------------------------------------------------------------------------
      MODIFIER
    ---------------------------------------------------------------------------
    */

    _modifyChecked : function(propValue, propOldValue)
    {
      this.base(arguments, propValue, propOldValue);

      this.setZIndex(propValue ? 1 : 0);
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
    _modifyShowCloseButton : function(propValue, propOldValue, propData)
    {
      // if no image exists, then create one
      if (!this._closeButtonImage) {
        this._closeButtonImage = new qx.ui.basic.Image(this.getCloseButtonImage());
      }

      if (propValue)
      {
        this._closeButtonImage.addEventListener("click", this._ontabclose, this);
        this.add(this._closeButtonImage);
      }
      else
      {
        this.remove(this._closeButtonImage);
        this._closeButtonImage.removeEventListener("click", this._ontabclose);
      }

      return true;
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
    _modifyCloseButtonImage : function(propValue, propOldValue, propData)
    {
      if (this._closeButtonImage) {
        this._closeButtonImage.setSource(propValue);
      }

      return true;
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
    _applyAppearance : function()
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
