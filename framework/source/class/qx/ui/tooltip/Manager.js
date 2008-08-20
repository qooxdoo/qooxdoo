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
 * The tooltip manager globally manages the tooltips of all widgets. It will
 * display tooltips if the user hovers a widgets with a tooltip and hides all
 * other tooltips.
 */
qx.Class.define("qx.ui.tooltip.Manager",
{
  type : "singleton",
  extend : qx.core.Object,



  /*
  *****************************************************************************
     CONSTRUCTOR
  *****************************************************************************
  */

  construct : function()
  {
    this.base(arguments);

    // Register events
    var root = qx.core.Init.getApplication().getRoot();
    root.addListener("mouseover", this.__onMouseOverRoot, this, true);
    root.addListener("focusin", this.__onFocusInRoot, this, true);

    // Instantiate timers
    this.__showTimer = new qx.event.Timer();
    this.__showTimer.addListener("interval", this.__onShowInterval, this);

    this.__hideTimer = new qx.event.Timer();
    this.__hideTimer.addListener("interval", this.__onHideInterval, this);

    // Init mouse position
    this.__mousePosition = { left: 0, top: 0 };
  },




  /*
  *****************************************************************************
     PROPERTIES
  *****************************************************************************
  */

  properties :
  {
    /** Holds the current ToolTip instance */
    current :
    {
      check : "qx.ui.tooltip.ToolTip",
      nullable : true,
      apply : "_applyCurrent"
    }
  },




  /*
  *****************************************************************************
     MEMBERS
  *****************************************************************************
  */

  members :
  {
    __mousePosition : null,
    __hideTimer : null,
    __showTimer : null,


    /*
    ---------------------------------------------------------------------------
      PROPERTY APPLY ROUTINES
    ---------------------------------------------------------------------------
    */

    // property apply
    _applyCurrent : function(value, old)
    {
      // Return if the new tooltip is a child of the old one
      if (old && qx.ui.core.Widget.contains(old, value)) {
        return;
      }

      // If old tooltip existing, hide it and clear widget binding
      if (old)
      {
        old.exclude();

        this.__showTimer.stop();
        this.__hideTimer.stop();
      }

      var root = qx.core.Init.getApplication().getRoot();

      // If new tooltip is not null, set it up and start the timer
      if (value)
      {
        this.__showTimer.startWith(value.getShowTimeout());

        // Register hide handler
        root.addListener("mouseout", this.__onMouseOutRoot, this, true);
        root.addListener("focusout", this.__onFocusOutRoot, this, true);
        root.addListener("mousemove", this.__onMouseMoveRoot, this, true);
      }
      else
      {
        // Deregister hide handler
        root.removeListener("mouseout", this.__onMouseOutRoot, this, true);
        root.removeListener("focusout", this.__onFocusOutRoot, this, true);
        root.removeListener("mousemove", this.__onMouseMoveRoot, this, true);
      }
    },




    /*
    ---------------------------------------------------------------------------
      TIMER EVENT HANDLER
    ---------------------------------------------------------------------------
    */

    /**
     * Event listener for the interval event of the show timer.
     *
     * @param e {qx.event.type.Event} Event object
     */
    __onShowInterval : function(e)
    {
      var current = this.getCurrent();
      if (current)
      {
        this.__hideTimer.startWith(current.getHideTimeout());

        current.placeToPoint(this.__mousePosition);
        current.show();
      }

      this.__showTimer.stop();
    },


    /**
     * Event listener for the interval event of the hide timer.
     *
     * @param e {qx.event.type.Event} Event object
     */
    __onHideInterval : function(e)
    {
      var current = this.getCurrent();
      if (current) {
        current.exclude();
      }

      this.__hideTimer.stop();
      this.resetCurrent();
    },




    /*
    ---------------------------------------------------------------------------
      MOUSE EVENT HANDLER
    ---------------------------------------------------------------------------
    */

    /**
     * Global mouse move event handler
     *
     * @param e {qx.event.type.Mouse} The move mouse event
     */
    __onMouseMoveRoot : function(e)
    {
      var pos = this.__mousePosition;

      pos.left = e.getDocumentLeft();
      pos.top = e.getDocumentTop();
    },


    /**
     * Searches for the tooltip of the target widget. If any tooltip instance
     * is found this instance is bound to the target widget and the tooltip is
     * set as {@link #currentToolTip}
     *
     * @param e {qx.event.type.Mouse} mouseOver event
     * @return {void}
     */
    __onMouseOverRoot : function(e)
    {
      var target = e.getTarget();
      var tooltip;

      // Search first parent which has a tooltip
      while (target != null)
      {
        var tooltip = target.getToolTip();
        if (tooltip) {
          break;
        }

        target = target.getLayoutParent();
      }

      // Set Property
      if (tooltip) {
        this.setCurrent(tooltip);
      }
    },


    /**
     * Resets the property {@link #currentToolTip} if there was a
     * tooltip and no new one is created.
     *
     * @param e {qx.event.type.Mouse} mouseOut event
     * @return {void}
     */
    __onMouseOutRoot : function(e)
    {
      var target = e.getTarget();
      var related = e.getRelatedTarget();

      var tooltip = this.getCurrent();

      // If there was a tooltip and
      // - the destination target is the current tooltip
      //   or
      // - the current tooltip contains the destination target
      if (tooltip && (related == tooltip || qx.ui.core.Widget.contains(tooltip, related))) {
        return;
      }

      // If the destination target exists and the target contains it
      if (related && target && qx.ui.core.Widget.contains(target, related)) {
        return;
      }

      // If there was a tooltip and there is no new one
      if (tooltip && !related) {
        this.setCurrent(null);
      } else {
        this.resetCurrent();
      }
    },




    /*
    ---------------------------------------------------------------------------
      FOCUS EVENT HANDLER
    ---------------------------------------------------------------------------
    */

    /**
     * If a widget with a tooltip get focused, bind the tooltip
     * to the target widget and set the {@link #currentToolTip} property.
     *
     * @param e {qx.event.type.Focus} focus event
     * @return {void}
     */
    __onFocusInRoot : function(e)
    {
      var target = e.getTarget();
      var tooltip = target.getToolTip();

      // Only set new tooltip if focus widget has one
      if (tooltip != null) {
        this.setCurrent(tooltip);
      }
    },


    /**
     * Reset the property {@link #currentToolTip} if the
     * current tooltip is the tooltip of the target widget.
     *
     * @param e {qx.event.type.Focus} blur event
     * @return {void}
     */
    __onFocusOutRoot : function(e)
    {
      var target = e.getTarget();
      if (!target) {
        return;
      }

      var tooltip = this.getCurrent();

      // Only set to null if blured widget is the
      // one which has created the current tooltip
      if (tooltip && tooltip == target.getToolTip()) {
        this.setCurrent(null);
      }
    }
  },




  /*
  *****************************************************************************
     DESTRUCTOR
  *****************************************************************************
  */

  destruct : function()
  {
    // Deregister events
    var root = qx.core.Init.getApplication().getRoot();
    if (root)
    {
      root.addListener("mouseover", this.__onMouseOverRoot, this, true);
      root.addListener("focusin", this.__onFocusInRoot, this, true);
    }

    // Dispose timers
    this._disposeObjects("__showTimer", "__hideTimer");
    this._disposeFields("__mousePosition");
  }
});
