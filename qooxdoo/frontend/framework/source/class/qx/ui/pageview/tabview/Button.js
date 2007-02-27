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


qx.Clazz.define("qx.ui.pageview.tabview.Button",
{
  extend : qx.ui.pageview.AbstractButton,




  /*
  *****************************************************************************
     CONSTRUCTOR
  *****************************************************************************
  */

  construct : function(vText, vIcon, vIconWidth, vIconHeight, vFlash) {
    qx.ui.pageview.AbstractButton.call(this, vText, vIcon, vIconWidth, vIconHeight, vFlash);
  },




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
      _legacy      : true,
      type         : "string",
      defaultValue : "tab-view-button"
    },




    /*
    ---------------------------------------------------------------------------
      PROPERTIES
    ---------------------------------------------------------------------------
     */

    /** default Close Tab Button */
    showCloseButton :
    {
      _legacy      : true,
      type         : "boolean",
      defaultValue : false
    },


    /** Close Tab Icon */
    closeButtonImage :
    {
      _legacy      : true,
      type         : "string",
      defaultValue : "icon/16/actions/dialog-cancel.png"
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

    /**
     * TODOC
     *
     * @type member
     * @param propValue {var} Current value
     * @param propOldValue {var} Previous value
     * @param propData {var} Property configuration map
     * @return {boolean} TODOC
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
     * @return {boolean} TODOC
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
        this._states.firstChild = this.isFirstVisibleChild();
        this._states.lastChild = this.isLastVisibleChild();
        this._states.alignLeft = this.getView().getAlignTabsToLeft();
        this._states.barTop = this.getView().getPlaceBarOnTop();
      }

      qx.ui.pageview.AbstractButton.prototype._applyAppearance.call(this);
    },




    /*
    ---------------------------------------------------------------------------
      DISPOSER
    ---------------------------------------------------------------------------
     */

    /**
     * TODOC
     *
     * @type member
     * @return {void | var} TODOC
     */
    dispose : function()
    {
      if (this.getDisposed()) {
        return;
      }

      if (this._closeButtonImage)
      {
        this._closeButtonImage.dispose();
        this._closeButtonImage = null;
      }

      return qx.ui.pageview.AbstractButton.prototype.dispose.call(this);
    }
  }
});
