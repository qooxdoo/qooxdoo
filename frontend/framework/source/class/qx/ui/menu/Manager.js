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

/** This singleton manages multiple instances of qx.legacy.ui.menu.Menu and their state. */
qx.Class.define("qx.ui.menu.Manager",
{
  type : "singleton",
  extend : qx.util.Set,


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
    root.addListener("mousedown", this.__onUpdateEvent, this, true);
    qx.bom.Element.addListener(window, "blur", this.__onUpdateEvent, this);
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
     * Updates all registered menus
     *
     * @type member
     * @param target {Object} target of the processed event
     * @param eventName {String} processed event as string
     * @return {void}
     */
    __onUpdateEvent : function(event)
    {
      var target = event.getTarget();
      var eventName = event.getType();

      var menu, hash;
      var menus = this.getAll();

      for (var hash in menus)
      {
        menu = menus[hash];

        if (!menu.getAutoHide()) {
          continue;
        }

        if (target && target.getMenu && target.getMenu()) {
          continue;
        }

        // Hide on global events (mouseup, window focus, window blur, ...)
        if (!target)
        {
          menu.hide();
          continue;
        }

        // Hide only if the target is not a button inside this
        // or any sub menu and is not the opener
        var isMouseDown = eventName == "mousedown";
        var isMouseUp = eventName == "mouseup";

        // Close menu if the target is not the opener button...
        if (menu.getOpener() !==

        //  and
        target &&
        (target &&

        // or the event is a mouse up on a child button of the menu

        // the event is a mouse down on a non-child of the menu
        (!menu.isSubElement(target) && isMouseDown) ||

        // or the event is a key (esc) event
        (menu.isSubElement(target, true) && isMouseUp) || (!isMouseDown && !isMouseUp)))
        {
          menu.hide();
          continue;
        }
      }
    }
  }
});
