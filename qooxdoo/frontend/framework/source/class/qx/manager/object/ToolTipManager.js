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

************************************************************************ */

/** This manages ToolTip instances */
qx.Class.define("qx.manager.object.ToolTipManager",
{
  type : "singleton",
  extend : qx.manager.object.ObjectManager,




  /*
  *****************************************************************************
     CONSTRUCTOR
  *****************************************************************************
  */

  construct : function() {
    this.base(arguments);
  },




  /*
  *****************************************************************************
     PROPERTIES
  *****************************************************************************
  */

  properties :
  {
    currentToolTip :
    {
      check : "qx.ui.popup.ToolTip",
      nullable : true,
      apply : "_modifyCurrentToolTip"
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
     * @return {void | Boolean} TODOC
     */
    _modifyCurrentToolTip : function(propValue, propOldValue, propData)
    {
      // Return if the new tooltip is a child of the old one
      if (propOldValue && propOldValue.contains(propValue)) {
        return;
      }

      // If old tooltip existing, hide it and clear widget binding
      if (propOldValue)
      {
        propOldValue.hide();

        propOldValue._stopShowTimer();
        propOldValue._stopHideTimer();
      }

      // If new tooltip is not null, set it up and start the timer
      if (propValue) {
        propValue._startShowTimer();
      }

      return true;
    },




    /*
    ---------------------------------------------------------------------------
      EVENT INTERFACE: MOUSE
    ---------------------------------------------------------------------------
    */

    /**
     * TODOC
     *
     * @type member
     * @param e {Event} TODOC
     * @return {void}
     */
    handleMouseOver : function(e)
    {
      var vTarget = e.getTarget();
      var vToolTip;

      // Allows us to use DOM Nodes as tooltip target :)
      if (!(vTarget instanceof qx.ui.core.Widget) && vTarget.nodeType == 1) {
        vTarget = qx.event.handler.EventHandler.getTargetObject(vTarget);
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
     * TODOC
     *
     * @type member
     * @param e {Event} TODOC
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
     * TODOC
     *
     * @type member
     * @param e {Event} TODOC
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
     * TODOC
     *
     * @type member
     * @param e {Event} TODOC
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
