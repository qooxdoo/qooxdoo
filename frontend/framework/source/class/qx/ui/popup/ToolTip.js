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

#module(ui_tooltip)
#use(qx.manager.object.ToolTipManager)

************************************************************************ */

qx.Clazz.define("qx.ui.popup.ToolTip",
{
  extend : qx.ui.popup.PopupAtom,




  /*
  *****************************************************************************
     CONSTRUCTOR
  *****************************************************************************
  */

  construct : function(vLabel, vIcon)
  {
    // ************************************************************************
    //   INIT
    // ************************************************************************
    this.base(arguments, vLabel, vIcon);

    // Apply shadow
    this.setStyleProperty("filter", "progid:DXImageTransform.Microsoft.Shadow(color='Gray', Direction=135, Strength=4)");

    // ************************************************************************
    //   TIMER
    // ************************************************************************
    this._showTimer = new qx.client.Timer(this.getShowInterval());
    this._showTimer.addEventListener("interval", this._onshowtimer, this);

    this._hideTimer = new qx.client.Timer(this.getHideInterval());
    this._hideTimer.addEventListener("interval", this._onhidetimer, this);

    // ************************************************************************
    //   EVENTS
    // ************************************************************************
    this.addEventListener("mouseover", this._onmouseover);
    this.addEventListener("mouseout", this._onmouseover);
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

    appearance :
    {
      _legacy      : true,
      type         : "string",
      defaultValue : "tool-tip"
    },

    hideOnHover :
    {
      _legacy      : true,
      type         : "boolean",
      defaultValue : true
    },

    mousePointerOffsetX :
    {
      _legacy      : true,
      type         : "number",
      defaultValue : 1
    },

    mousePointerOffsetY :
    {
      _legacy      : true,
      type         : "number",
      defaultValue : 20
    },

    showInterval :
    {
      _legacy      : true,
      type         : "number",
      defaultValue : 1000
    },

    hideInterval :
    {
      _legacy      : true,
      type         : "number",
      defaultValue : 4000
    },

    boundToWidget :
    {
      _legacy  : true,
      type     : "object",
      instance : "qx.ui.core.Widget"
    }
  },




  /*
  *****************************************************************************
     MEMBERS
  *****************************************************************************
  */

  members :
  {
    _minZIndex : 1e7,




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
    _modifyHideInterval : function(propValue, propOldValue, propData)
    {
      this._hideTimer.setInterval(propValue);
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
    _modifyShowInterval : function(propValue, propOldValue, propData)
    {
      this._showTimer.setInterval(propValue);
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
    _modifyBoundToWidget : function(propValue, propOldValue, propData)
    {
      if (propValue) {
        this.setParent(propValue.getTopLevelWidget());
      } else if (propOldValue) {
        this.setParent(null);
      }

      return true;
    },




    /*
    ---------------------------------------------------------------------------
      APPEAR/DISAPPEAR
    ---------------------------------------------------------------------------
    */

    /**
     * TODOC
     *
     * @type member
     * @return {void}
     */
    _beforeAppear : function()
    {
      this.base(arguments);

      this._stopShowTimer();
      this._startHideTimer();
    },


    /**
     * TODOC
     *
     * @type member
     * @return {void}
     */
    _beforeDisappear : function()
    {
      this.base(arguments);

      this._stopHideTimer();
    },




    /*
    ---------------------------------------------------------------------------
      TIMER
    ---------------------------------------------------------------------------
    */

    /**
     * TODOC
     *
     * @type member
     * @return {void}
     */
    _startShowTimer : function()
    {
      if (!this._showTimer.getEnabled()) {
        this._showTimer.start();
      }
    },


    /**
     * TODOC
     *
     * @type member
     * @return {void}
     */
    _startHideTimer : function()
    {
      if (!this._hideTimer.getEnabled()) {
        this._hideTimer.start();
      }
    },


    /**
     * TODOC
     *
     * @type member
     * @return {void}
     */
    _stopShowTimer : function()
    {
      if (this._showTimer.getEnabled()) {
        this._showTimer.stop();
      }
    },


    /**
     * TODOC
     *
     * @type member
     * @return {void}
     */
    _stopHideTimer : function()
    {
      if (this._hideTimer.getEnabled()) {
        this._hideTimer.stop();
      }
    },




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
     * @return {void}
     */
    _onmouseover : function(e)
    {
      if (this.getHideOnHover()) {
        this.hide();
      }
    },


    /**
     * TODOC
     *
     * @type member
     * @param e {Event} TODOC
     * @return {boolean} TODOC
     */
    _onshowtimer : function(e)
    {
      this.setLeft(qx.event.type.MouseEvent.getPageX() + this.getMousePointerOffsetX());
      this.setTop(qx.event.type.MouseEvent.getPageY() + this.getMousePointerOffsetY());

      this.show();

      // we need a manual flushing because it could be that
      // there is currently no event which do this for us
      // and so show the tooltip.
      qx.ui.core.Widget.flushGlobalQueues();

      return true;
    },


    /**
     * TODOC
     *
     * @type member
     * @param e {Event} TODOC
     * @return {var} TODOC
     */
    _onhidetimer : function(e) {
      return this.hide();
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

      this.removeEventListener("mouseover", this._onmouseover);
      this.removeEventListener("mouseout", this._onmouseover);

      if (this._showTimer)
      {
        this._showTimer.removeEventListener("interval", this._onshowtimer, this);
        this._showTimer.dispose();
        this._showTimer = null;
      }

      if (this._hideTimer)
      {
        this._hideTimer.removeEventListener("interval", this._onhidetimer, this);
        this._hideTimer.dispose();
        this._hideTimer = null;
      }

      return this.base(arguments);
    }
  }
});
