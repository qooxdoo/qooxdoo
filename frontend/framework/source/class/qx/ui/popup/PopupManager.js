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

#module(ui_popup)
#optional(qx.ui.popup.ToolTip)

************************************************************************ */

/** This singleton is used to manager multiple instances of popups and their state. */
qx.Class.define("qx.ui.popup.PopupManager",
{
  type : "singleton",
  extend : qx.util.manager.Object,




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
     MEMBERS
  *****************************************************************************
  */

  members :
  {
    /*
    ---------------------------------------------------------------------------
      METHODS
    ---------------------------------------------------------------------------
    */

    /**
     * Updates all registered popups
     *
     * @type member
     * @param vTarget {qx.ui.popup.Popup | qx.ui.popup.ToolTip} current widget
     * @return {void}
     */
    update : function(vTarget)
    {
      // be sure that target is correctly set (needed for contains() later)
      if (!(vTarget instanceof qx.ui.core.Widget)) {
        vTarget = null;
      }

      var vPopup, vHashCode;
      var vAll = this.getAll();

      for (vHashCode in vAll)
      {
        vPopup = vAll[vHashCode];

        if (!vPopup.getAutoHide() || vTarget == vPopup || vPopup.contains(vTarget)) {
          continue;
        }

        if (qx.Class.isDefined("qx.ui.popup.ToolTip") && vTarget instanceof qx.ui.popup.ToolTip && !(vPopup instanceof qx.ui.popup.ToolTip)) {
          continue;
        }

        vPopup.hide();
      }
    }
  }
});
