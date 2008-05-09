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
     * Fabian Jakobs (fjakobs)

************************************************************************ */

/**
 * Tooltips provide additional help for widgets if the user hovers a widget.
 *
 * *Example*
 * <pre class="javascript">
 * var widget = new qx.ui.form.Button("save");
 *
 * var tooltip = new qx.ui.popup.ToolTip("Save the opened file");
 * widget.setToolTip(tooltip);
 * </pre>
 *
 * *External Documentation*
 *
 * <a href='http://qooxdoo.org/documentation/0.8/tooltip' target='_blank'>
 * Documentation of this widget in the qooxdoo wiki.</a>
 *
 * @appearance tool-tip
 */
qx.Class.define("qx.ui.popup.ToolTip",
{
  extend : qx.ui.popup.Popup,




  /*
  *****************************************************************************
     CONSTRUCTOR
  *****************************************************************************
  */

  /**
   * @param label {String} label of the tooltip
   * @param icon {String?null} Icon URL of the tooltip
   */

  construct : function(label, icon)
  {
    this.base(arguments);

    // initialize tooltip manager
    this.__mgr = qx.ui.popup.ToolTipManager.getInstance();

    // add atom
    this.__atom = new qx.ui.basic.Atom(label, icon);
    this.setLayout(new qx.ui.layout.Basic());
    this.add(this.__atom);

    // timer
    this._showTimer = new qx.event.Timer(this.getShowInterval());
    this._showTimer.addListener("interval", this._onshowtimer, this);

    this._hideTimer = new qx.event.Timer(this.getHideInterval());
    this._hideTimer.addListener("interval", this._onhidetimer, this);

    // events
    this.addListener("mouseover", this._onmouseover);
    this.addListener("mouseout", this._onmouseover);
  },




  /*
  *****************************************************************************
     PROPERTIES
  *****************************************************************************
  */

  properties :
  {
    // overridden
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


    /**
     * Accessor method to get the atom sub widget
     *
     * @type member
     * @return {qx.ui.basic.Atom} atom sub widget
     */
    getAtom : function() {
      return this.__atom;
    },


    /*
    ---------------------------------------------------------------------------
      APPLY ROUTINES
    ---------------------------------------------------------------------------
    */


    // property apply
    _applyHideInterval : function(value, old) {
      this._hideTimer.setInterval(value);
    },


    // property apply
    _applyShowInterval : function(value, old) {
      this._showTimer.setInterval(value);
    },




    /*
    ---------------------------------------------------------------------------
      APPEAR/DISAPPEAR
    ---------------------------------------------------------------------------
    */


    // overridden
    _onChangeVisibility : function(e)
    {
      this.base(arguments, e);

      var isVisible = e.getValue() == "visible";

      if (isVisible)
      {
          this.stopShowTimer();
          this.startHideTimer();
      }
      else
      {
        this.stopHideTimer();
      }
    },


    /**
     * This methods corrects the popup's position if {@link restrictToPageOnOpen}
     * is set to <code>true</code> and the popup is outside of the viewport.
     */
    _correctPosition : function()
    {
      this.base(arguments);

      var clientWidth = qx.bom.Viewport.getWidth();
      var clientHeight = qx.bom.Viewport.getHeight();
      var scrollTop = qx.bom.Viewport.getScrollTop();
      var scrollLeft = qx.bom.Viewport.getScrollLeft();

      var restrictToPageLeft = this.getRestrictToPageLeft() + scrollLeft;
      var restrictToPageRight = this.getRestrictToPageRight() - scrollLeft;
      var restrictToPageTop = this.getRestrictToPageTop() + scrollTop;
      var restrictToPageBottom = this.getRestrictToPageBottom() - scrollTop;

      var props = this.getLayoutProperties();
      var left = props.left;
      var top = props.top;

      var bounds = this.getBounds();
      var width = bounds.width;
      var height = bounds.height;

      var mousePos = this.__mgr.getLastMousePosition();
      var mouseX = mousePos.left;
      var mouseY = mousePos.top;

      // REPAIR: If mousecursor /within/ newly positioned popup, move away.
      if (
        left <= mouseX &&
        mouseX <= left+width &&
        top <= mouseY &&
        mouseY <= top+height
      )
      {
        // compute possible movements in all four directions
        var deltaYdown = mouseY - top;
        var deltaYup = deltaYdown - height;
        var deltaXright = mouseX - left;
        var deltaXleft = deltaXright - width;
        var violationUp = Math.max(0, restrictToPageTop - (top+deltaYup));
        var violationDown = Math.max(0, top+height+deltaYdown - (clientHeight-restrictToPageBottom));
        var violationLeft = Math.max(0, restrictToPageLeft - (left+deltaXleft));
        var violationRight = Math.max(0, left+width+deltaXright - (clientWidth-restrictToPageRight));

        var possibleMovements = [
          // (deltaX, deltaY, violation)
          [0, deltaYup,    violationUp], // up
          [0, deltaYdown,  violationDown], // down
          [deltaXleft, 0,  violationLeft], // left
          [deltaXright, 0, violationRight] // right
        ];

        possibleMovements.sort(function(a, b)
        {
          // first sort criterion: overlap/clipping - fewer, better
          // second criterion: combined movements - fewer, better
          return a[2]-b[2] || (Math.abs(a[0]) + Math.abs(a[1])) - (Math.abs(b[0]) + Math.abs(b[1]));
        });

        var minimalNonClippingMovement = possibleMovements[0];
        left = left + minimalNonClippingMovement[0];
        top = top + minimalNonClippingMovement[1];
      }

      if (left != props.left || top != props.top) {
        this.setLocation(left, top);
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
     * @internal
     * @type member
     * @return {void}
     */
    startShowTimer : function()
    {
      if (!this._showTimer.getEnabled()) {
        this._showTimer.start();
      }
    },


    /**
     * Utility method to start the timer for the hide interval
     * (if the timer is disabled)
     *
     * @internal
     * @type member
     * @return {void}
     */
    startHideTimer : function()
    {
      if (!this._hideTimer.getEnabled()) {
        this._hideTimer.start();
      }
    },


    /**
     * Utility method to stop the timer for the show interval
     * (if the timer is enabled)
     *
     * @internal
     * @type member
     * @return {void}
     */
    stopShowTimer : function()
    {
      if (this._showTimer.getEnabled()) {
        this._showTimer.stop();
      }
    },


    /**
     * Utility method to stop the timer for the hide interval
     * (if the timer is enabled)
     *
     * @internal
     * @type member
     * @return {void}
     */
    stopHideTimer : function()
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
      this.stopShowTimer();
      var mousePos = this.__mgr.getLastMousePosition();
      this.setLocation(
        mousePos.left + this.getMousePointerOffsetX(),
        mousePos.top + this.getMousePointerOffsetY()
      );

      this.show();
    },


    // overridden
    hide : function()
    {
      var el = this.getContainerElement().getDomElement();

      if (!el) {
        return this.base(arguments);
      }

      var args = arguments;
      var fade = new qx.fx.effect.core.Fade(el).set({
        duration: 0.3
      });
      fade.addListener("finish", function(e)
      {
        this.getContainerElement().setStyle("opacity", 1);
        this.base(args);
      }, this);

      fade.start();
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
      this.hide();
    }
  },




  /*
  *****************************************************************************
     DESTRUCTOR
  *****************************************************************************
  */

  destruct : function()
  {
    var mgr = qx.ui.popup.ToolTipManager.getInstance();

    if (mgr.getCurrentToolTip() == this) {
      mgr.resetCurrentToolTip();
    }

    this._disposeObjects("_showTimer", "_hideTimer");
  }
});
