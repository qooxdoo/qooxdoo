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

#module(ui_menu)

************************************************************************ */

/** This singleton manages multiple instances of qx.ui.menu.Menu and their state. */
qx.Class.define("qx.manager.object.MenuManager",
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
     * TODOC
     *
     * @type member
     * @param vTarget {var} TODOC
     * @param vEventName {var} TODOC
     * @return {void}
     */
    update : function(vTarget, vEventName)
    {
      var vMenu, vHashCode;
      var vAll = this.getAll();

      for (vHashCode in vAll)
      {
        vMenu = vAll[vHashCode];

        if (!vMenu.getAutoHide()) {
          continue;
        }

        if (vTarget && vTarget.getMenu && vTarget.getMenu()) {
          continue;
        }

        // Hide on global events (mouseup, window focus, window blur, ...)
        if (!vTarget)
        {
          vMenu.hide();
          continue;
        }

        // Hide only if the target is not a button inside this
        // or any sub menu and is not the opener
        var isMouseDown = vEventName == "mousedown";
        var isMouseUp = vEventName == "mouseup";

        // Close menu if the target is not the opener button...
        if (vMenu.getOpener() !==

        //  and
        vTarget &&
        (vTarget &&

        // or the event is a mouse up on a child button of the menu

        // the event is a mouse down on a non-child of the menu
        (!vMenu.isSubElement(vTarget) && isMouseDown) ||

        // or the event is a key (esc) event
        (vMenu.isSubElement(vTarget, true) && isMouseUp) || (!isMouseDown && !isMouseUp)))
        {
          vMenu.hide();
          continue;
        }
      }
    }
  }
});
