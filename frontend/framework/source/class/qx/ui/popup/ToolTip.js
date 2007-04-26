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

/**
 * @appearance tool-tip
 */
qx.Class.define("qx.ui.popup.ToolTip",
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
      refine : true,
      init : "tool-tip"
    },

    hideOnHover :
    {
      check : "Boolean",
      init : true
    },

    mousePointerOffsetX :
    {
      check : "Integer",
      init : 1
    },

    mousePointerOffsetY :
    {
      check : "Integer",
      init : 20
    },

    showInterval :
    {
      check : "Integer",
      init : 1000,
      apply : "_modifyShowInterval"
    },

    hideInterval :
    {
      check : "Integer",
      init : 4000,
      apply : "_modifyHideInterval"
    },

    boundToWidget :
    {
      check : "qx.ui.core.Widget",
      apply : "_modifyBoundToWidget"
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
     * @return {Boolean} TODOC
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
     * @return {Boolean} TODOC
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
     * @return {Boolean} TODOC
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


    /**
     * TODOC
     *
     * @type member
     * @return {void}
     */
    _afterAppear : function()
    {
      this.base(arguments);

      if (this.getRestrictToPageOnOpen()) {
        var doc = qx.ui.core.ClientDocument.getInstance();
        var docWidth = doc.getClientWidth();
        var docHeight = doc.getClientHeight();
        var restrictToPageLeft   = parseInt(this._restrictToPageLeft);
        var restrictToPageRight  = parseInt(this._restrictToPageRight);
        var restrictToPageTop    = parseInt(this._restrictToPageTop);
        var restrictToPageBottom = parseInt(this._restrictToPageBottom);
        var left   = (this._wantedLeft == null) ? this.getLeft() : this._wantedLeft;
        var top    = this.getTop();
        var width  = this.getBoxWidth();
        var height = this.getBoxHeight();

        var mouseX = qx.event.type.MouseEvent.getPageX();
        var mouseY = qx.event.type.MouseEvent.getPageY();

        var oldLeft = this.getLeft();
        var oldTop = top;

        // NOTE: We check right and bottom first, because top and left should have
        //       priority, when both sides are violated.
        if (left + width > docWidth - restrictToPageRight) {
          left = docWidth - restrictToPageRight - width;
        }
        if (top + height > docHeight - restrictToPageBottom) {
          top = docHeight - restrictToPageBottom - height;
        }
        if (left < restrictToPageLeft) {
          left = restrictToPageLeft;
        }
        if (top < restrictToPageTop) {
          top = restrictToPageTop;
        }

        // REPAIR: If mousecursor /within/ newly positioned popup, move away.
        if (left <= mouseX && mouseX <= left+width &&
            top <= mouseY && mouseY <= top+height){
            // compute possible movements in all four directions
            var deltaYdown = mouseY - top;
            var deltaYup = deltaYdown - height;
            var deltaXright = mouseX - left;
            var deltaXleft = deltaXright - width;
            var violationUp = Math.max(0, restrictToPageTop - (top+deltaYup));
            var violationDown = Math.max(0, top+height+deltaYdown - (docHeight-restrictToPageBottom));
            var violationLeft = Math.max(0, restrictToPageLeft - (left+deltaXleft));
            var violationRight = Math.max(0, left+width+deltaXright - (docWidth-restrictToPageRight));
            var possibleMovements = [// (deltaX, deltaY, violation)
                [0, deltaYup,    violationUp], // up
                [0, deltaYdown,  violationDown], // down
                [deltaXleft, 0,  violationLeft], // left
                [deltaXright, 0, violationRight] // right
            ];

            possibleMovements.sort(function(a, b){
                // first sort criterion: overlap/clipping - fewer, better
                // second criterion: combined movements - fewer, better
                return a[2]-b[2] || (Math.abs(a[0]) + Math.abs(a[1])) - (Math.abs(b[0]) + Math.abs(b[1]));
            });

            var minimalNonClippingMovement = possibleMovements[0];
            left = left + minimalNonClippingMovement[0];
            top = top + minimalNonClippingMovement[1];
        }

        if (left != oldLeft || top != oldTop) {
          var self = this;
          window.setTimeout(function() {
            self.setLeft(left);
            self.setTop(top);
            qx.ui.core.Widget.flushGlobalQueues();
          }, 0);
        }
      }
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
     * @return {Boolean} TODOC
     */
    _onshowtimer : function(e)
    {
      this.setLeft(qx.event.type.MouseEvent.getPageX() + this.getMousePointerOffsetX());
      this.setTop(qx.event.type.MouseEvent.getPageY() + this.getMousePointerOffsetY());

      this.show();

      // we need a manual flushing because it could be that
      // there is currently no event which does this for us
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
    }
  },




  /*
  *****************************************************************************
     DESTRUCTOR
  *****************************************************************************
  */

  destruct : function() {
    this._disposeObjects("_showTimer", "_hideTimer");
  }
});
