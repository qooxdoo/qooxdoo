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


  construct : function()
  {
    this.base(arguments);

    var root = qx.core.Init.getApplication().getRoot();

    this.__lastMousePos = {
      left: 0,
      top: 0
    };

    root.addListener("mousemove", this.__onMouseMoveRoot, this, true);
    root.addListener("mouseover", this.__onMouseOverRoot, this, true);
    root.addListener("mouseout", this.__onMouseOutRoot, this, true);
    root.addListener("focusin", this.__onFocusinRoot, this, true);
    root.addListener("focusout", this.__onFocusoutRoot, this, true);
  },


  /*
  *****************************************************************************
     PROPERTIES
  *****************************************************************************
  */

  properties :
  {
    /** Holds the current ToolTip instance */
    currentToolTip :
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
      APPLY ROUTINES
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

        old._stopShowTimer();
        old._stopHideTimer();
      }

      // If new tooltip is not null, set it up and start the timer
      if (value) {
        value._startShowTimer();
      }
    },




    /*
    ---------------------------------------------------------------------------
      EVENT INTERFACE: MOUSE
    ---------------------------------------------------------------------------
    */


    /**
     * The viewport position of the last mouse move event.
     *
     * @return {Map} a map with the <code>left</code> and <code>right</code>
     *     viewport voordinate of the last move event.
     */
    getLastMousePosition : function() {
      return this.__lastMousePos;
    },


    /**
     * Global mouse move event handler
     *
     * @param e {qx.event.type.Mouse} The move mouse event
     */
    __onMouseMoveRoot : function(e)
    {
      this.__lastMousePos.left = e.getViewportLeft();
      this.__lastMousePos.top = e.getViewportTop();
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
      var vTarget = e.getTarget();
      var vToolTip;

      // Search first parent which has a tooltip
      while (vTarget != null && !(vToolTip = vTarget.getToolTip())) {
        vTarget = vTarget.getLayoutParent();
      }

      // Set Property
      this.setCurrentToolTip(vToolTip);
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
      var vTarget = e.getTarget();
      var vRelatedTarget = e.getRelatedTarget();

      var vToolTip = this.getCurrentToolTip();

      // If there was a tooltip and
      // - the destination target is the current tooltip
      //   or
      // - the current tooltip contains the destination target
      if (
        vToolTip && (
          vRelatedTarget == vToolTip ||
          qx.ui.core.Widget.contains(vToolTip, vRelatedTarget)
        )
      ) {
        return;
      }

      // If the destination target exists and the target contains it
      if (vRelatedTarget && vTarget && qx.ui.core.Widget.contains(vTarget, vRelatedTarget)) {
        return;
      }

      // If there was a tooltip and there is no new one
      if (vToolTip && !vRelatedTarget) {
        this.setCurrentToolTip(null);
      }
    },




    /*
    ---------------------------------------------------------------------------
      EVENT INTERFACE: FOCUS
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
    __onFocusinRoot : function(e)
    {
      var vTarget = e.getTarget();
      var vToolTip = vTarget.getToolTip();

      // Only set new tooltip if focus widget
      // has one
      if (vToolTip != null) {
        this.setCurrentToolTip(vToolTip);
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
    __onFocusoutRoot : function(e)
    {
      var vTarget = e.getTarget();

      if (!vTarget) {
        return;
      }

      var vToolTip = this.getCurrentToolTip();

      // Only set to null if blured widget is the
      // one which has created the current tooltip
      if (vToolTip && vToolTip == vTarget.getToolTip()) {
        this.setCurrentToolTip(null);
      }
    }
  }
});
