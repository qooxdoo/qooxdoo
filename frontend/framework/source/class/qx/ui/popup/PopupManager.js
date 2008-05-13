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
 * This singleton is used to manager multiple instances of popups and their
 * state.
 */
qx.Class.define("qx.ui.popup.PopupManager",
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
    /**
     * Event handler blur and mouse down events
     *
     * @param e {qx.event.type.Event} the event object
     */
    __onUpdateEvent : function(e)
    {
      var target = e.getType() === "blur" ? null : e.getTarget();
      var obj, list = this.getAll();

      for (var i=0, l=list.length; i<l; i++)
      {
        obj = list[i];

        if (!obj.getAutoHide() || target == obj || qx.ui.core.Widget.contains(obj, target)) {
          continue;
        }

        obj.hide();
      }
    }
  }
});
