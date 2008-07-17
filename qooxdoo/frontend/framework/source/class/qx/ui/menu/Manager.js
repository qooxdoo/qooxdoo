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
      var obj, list = this.getAll();

      for (var i=0, l=list.length; i<l; i++)
      {
        obj = list[i];

        obj.exclude();
      }
    }
  }
});
