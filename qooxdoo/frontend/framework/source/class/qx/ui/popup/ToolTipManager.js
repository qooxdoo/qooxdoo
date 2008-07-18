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
qx.Class.define("qx.ui.popup.ToolTipManager",
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

    var root = qx.core.Init.getApplication().getRoot();

    // Register events
    root.addListener("mousemove", this.__onMouseMoveRoot, this, true);
    root.addListener("mouseover", this.__onMouseOverRoot, this, true);
    root.addListener("mouseout", this.__onMouseOutRoot, this, true);
    root.addListener("focusin", this.__onFocusInRoot, this, true);
    root.addListener("focusout", this.__onFocusOutRoot, this, true);
  },




  /*
  *****************************************************************************
     PROPERTIES
  *****************************************************************************
  */

  properties :
  {
    /** Holds the current ToolTip instance */
    toolTip :
    {
      check : "qx.ui.popup.ToolTip",
      nullable : true,
      apply : "_applyCurrentToolTip"
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
      PROPERTY APPLY ROUTINES
    ---------------------------------------------------------------------------
    */

    // property apply
    _applyCurrentToolTip : function(value, old)
    {
      // Return if the new tooltip is a child of the old one
      if (old && qx.ui.core.Widget.contains(old, value)) {
        return;
      }

      // If old tooltip existing, hide it and clear widget binding
      if (old && !old.isDisposed())
      {
        old.hide();

        old.stopShowTimer();
        old.stopHideTimer();
      }

      // If new tooltip is not null, set it up and start the timer
      if (value) {
        value.startShowTimer();
      }
    },






    /*
    ---------------------------------------------------------------------------
      UTILITIES
    ---------------------------------------------------------------------------
    */

    /**
     * The viewport position of the last mouse move event.
     *
     * @return {Integer} Left viewport coordinate of the last move event.
     */
    getLastLeft : function() {
      return this.__lastLeft;
    },


    /**
     * The viewport position of the last mouse move event.
     *
     * @return {Integer} Top viewport coordinate of the last move event.
     */
    getLastTop : function() {
      return this.__lastTop;
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
      this.__lastLeft = e.getViewportLeft();
      this.__lastTop = e.getViewportTop();
    },


    /**
     * Searches for the tooltip of the target widget. If any tooltip instance
     * is found this instance is bound to the target widget and the tooltip is
     * set as {@link #currentToolTip}
     *
     * @type member
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
        this.setToolTip(tooltip);
      }
    },


    /**
     * Resets the property {@link #currentToolTip} if there was a
     * tooltip and no new one is created.
     *
     * @type member
     * @param e {qx.event.type.Mouse} mouseOut event
     * @return {void}
     */
    __onMouseOutRoot : function(e)
    {
      var target = e.getTarget();
      var related = e.getRelatedTarget();

      var tooltip = this.getToolTip();

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
        this.setToolTip(null);
      } else {
        this.resetToolTip();
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
     * @type member
     * @param e {qx.event.type.Focus} focus event
     * @return {void}
     */
    __onFocusInRoot : function(e)
    {
      var target = e.getTarget();
      var tooltip = target.getToolTip();

      // Only set new tooltip if focus widget has one
      if (tooltip != null) {
        this.setToolTip(tooltip);
      }
    },


    /**
     * Reset the property {@link #currentToolTip} if the
     * current tooltip is the tooltip of the target widget.
     *
     * @type member
     * @param e {qx.event.type.Focus} blur event
     * @return {void}
     */
    __onFocusOutRoot : function(e)
    {
      var target = e.getTarget();
      if (!target) {
        return;
      }

      var tooltip = this.getToolTip();

      // Only set to null if blured widget is the
      // one which has created the current tooltip
      if (tooltip && tooltip == target.getToolTip()) {
        this.setToolTip(null);
      }
    }
  }
});
