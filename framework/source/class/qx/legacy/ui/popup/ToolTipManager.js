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

/** This manages ToolTip instances */
qx.Class.define("qx.legacy.ui.popup.ToolTipManager",
{
  type : "singleton",
  extend : qx.legacy.util.ObjectManager,





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
      check : "qx.legacy.ui.popup.ToolTip",
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

    /**
     * TODOC
     *
     * @param value {var} Current value
     * @param old {var} Previous value
     * @return {void | Boolean} TODOC
     */
    _applyCurrentToolTip : function(value, old)
    {
      // Return if the new tooltip is a child of the old one
      if (old && old.contains(value)) {
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
     * Searches for the tooltip of the target widget. If any tooltip instance
     * is found this instance is bound to the target widget and the tooltip is
     * set as {@link #currentToolTip}
     *
     * @param e {qx.legacy.event.type.MouseEvent} mouseOver event
     * @return {void}
     */
    handleMouseOver : function(e)
    {
      var vTarget = e.getTarget();
      var vToolTip;

      // Allows us to use DOM Nodes as tooltip target :)
      if (!(vTarget instanceof qx.legacy.ui.core.Widget) && vTarget.nodeType == 1) {
        vTarget = qx.legacy.event.handler.EventHandler.getTargetObject(vTarget);
      }

      // Search first parent which has a tooltip
      while (vTarget != null && !(vToolTip = vTarget.getToolTip())) {
        vTarget = vTarget.getParent();
      }

      // Bind tooltip to widget
      if (vToolTip != null) {
        vToolTip.setBoundToWidget(vTarget);
      }

      // Set Property
      this.setCurrentToolTip(vToolTip);
    },


    /**
     * Resets the property {@link #currentToolTip} if there was a
     * tooltip and no new one is created.
     *
     * @param e {qx.legacy.event.type.MouseEvent} mouseOut event
     * @return {void}
     */
    handleMouseOut : function(e)
    {
      var vTarget = e.getTarget();
      var vRelatedTarget = e.getRelatedTarget();

      var vToolTip = this.getCurrentToolTip();

      // If there was a tooltip and
      // - the destination target is the current tooltip
      //   or
      // - the current tooltip contains the destination target
      if (vToolTip && (vRelatedTarget == vToolTip || vToolTip.contains(vRelatedTarget))) {
        return;
      }

      // If the destination target exists and the target contains it
      if (vRelatedTarget && vTarget && vTarget.contains(vRelatedTarget)) {
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
     * @param e {qx.legacy.event.type.FocusEvent} focus event
     * @return {void}
     */
    handleFocus : function(e)
    {
      var vTarget = e.getTarget();
      var vToolTip = vTarget.getToolTip();

      // Only set new tooltip if focus widget
      // has one
      if (vToolTip != null)
      {
        // Bind tooltip to widget
        vToolTip.setBoundToWidget(vTarget);

        // Set Property
        this.setCurrentToolTip(vToolTip);
      }
    },


    /**
     * Reset the property {@link #currentToolTip} if the
     * current tooltip is the tooltip of the target widget.
     *
     * @param e {qx.legacy.event.type.FocusEvent} blur event
     * @return {void}
     */
    handleBlur : function(e)
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
