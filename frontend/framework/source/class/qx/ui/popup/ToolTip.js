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
#use(qx.ui.popup.ToolTipManager)

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
    appearance :
    {
      refine : true,
      init : "tool-tip"
    },

    /** Controls whether the tooltip is hidden when hovered across */
    hideOnHover :
    {
      check : "Boolean",
      init : true
    },

    /** Horizontal offset of the mouse pointer (in pixel) */
    mousePointerOffsetX :
    {
      check : "Integer",
      init : 1
    },

    /** Vertical offset of the mouse pointer (in pixel) */
    mousePointerOffsetY :
    {
      check : "Integer",
      init : 20
    },

    /** Interval after the tooltip is shown (in milliseconds) */
    showInterval :
    {
      check : "Integer",
      init : 1000,
      apply : "_applyShowInterval"
    },

    /** Interval after the tooltip is hidden (in milliseconds) */
    hideInterval :
    {
      check : "Integer",
      init : 4000,
      apply : "_applyHideInterval"
    },

    /** Widget to which the tooltip is bound to */
    boundToWidget :
    {
      check : "qx.ui.core.Widget",
      apply : "_applyBoundToWidget"
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
      APPLY ROUTINES
    ---------------------------------------------------------------------------
    */

    /**
     * TODOC
     *
     * @type member
     * @param value {var} Current value
     * @param old {var} Previous value
     */
    _applyHideInterval : function(value, old) {
      this._hideTimer.setInterval(value);
    },


    /**
     * TODOC
     *
     * @type member
     * @param value {var} Current value
     * @param old {var} Previous value
     */
    _applyShowInterval : function(value, old) {
      this._showTimer.setInterval(value);
    },


    /**
     * TODOC
     *
     * @type member
     * @param value {var} Current value
     * @param old {var} Previous value
     */
    _applyBoundToWidget : function(value, old)
    {
      if (value) {
        this.setParent(value.getTopLevelWidget());
      } else if (old) {
        this.setParent(null);
      }
    },




    /*
    ---------------------------------------------------------------------------
      APPEAR/DISAPPEAR
    ---------------------------------------------------------------------------
    */

    /**
     * Callback method for the "beforeAppear" event.<br/>
     * Does two things: stops the timer for the show interval and
     * starts the timer for the hide interval.
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
     * Callback method for the "beforeDisappear" event.<br/>
     * Stops the timer for the hide interval.
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
     * Callback method for the "afterAppear" event.<br/>
     * If the property {@link #restrictToPageOnOpen} is set to <code>true</code>
     * the tooltip gets repositioned to ensure it is displayed within the
     * boundaries of the {@link qx.ui.core.ClientDocument}.
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
     * Utility method to start the timer for the show interval
     * (if the timer is disabled)
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
     * Utility method to start the timer for the hide interval
     * (if the timer is disabled)
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
     * Utility method to stop the timer for the show interval
     * (if the timer is enabled)
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
     * Utility method to stop the timer for the hide interval
     * (if the timer is enabled)
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
     * Callback method for the "mouseOver" event.<br/>
     * If property {@link #hideOnOver} is enabled the tooltip gets hidden
     *
     * @type member
     * @param e {qx.event.type.MouseEvent} mouseOver event
     * @return {void}
     */
    _onmouseover : function(e)
    {
      if (this.getHideOnHover()) {
        this.hide();
      }
    },


    /**
     * Callback method for the "interval" event of the show timer.<br/>
     * Positions the tooltip (sets left and top) and calls the
     * {@link #show} method.
     *
     * @type member
     * @param e {qx.event.type.Event} interval event
     */
    _onshowtimer : function(e)
    {
      this.setLeft(qx.event.type.MouseEvent.getPageX() + this.getMousePointerOffsetX());
      this.setTop(qx.event.type.MouseEvent.getPageY() + this.getMousePointerOffsetY());

      this.show();
    },


    /**
     * Callback method for the "interval" event of the hide timer.<br/>
     * Hides the tooltip by calling the corresponding {@link #hide} method.
     *
     * @type member
     * @param e {qx.event.type.Event} interval event
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
