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
 * This singleton is used to manager multiple instances of popups and their state.
 */
qx.Class.define("qx.ui.popup.PopupManager",
{
  type : "singleton",
  extend : qx.util.Set,

  construct : function()
  {
    this.base(arguments);

    var root = qx.core.Init.getApplication().getRoot();

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
      var target = e.getTarget();
      this.update(target instanceof qx.ui.core.Widget ? target : null);
    },


    /**
     * Updates all registered popups
     *
     * @type member
     * @param vTarget {qx.ui.popup.Popup} current widget
     * @return {void}
     */
    update : function(vTarget)
    {
      var vPopup, vHashCode;
      var vAll = this.getAll();

      for (vHashCode in vAll)
      {
        vPopup = vAll[vHashCode];

        if (!vPopup.getAutoHide() || vTarget == vPopup || qx.ui.core.Widget.contains(vPopup, vTarget)) {
          continue;
        }

        vPopup.hide();
      }
    }
  }
});
