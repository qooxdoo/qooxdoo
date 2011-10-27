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
qx.Class.define("qx.ui.popup.Manager",
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

    // Create data structure, use an array becasue order matters [BUG #4323]
    this.__objects = [];

    // Register mousedown handler
    qx.event.Registration.addListener(document.documentElement, "mousedown",
                                      this.__onMouseDown, this, true);

    // Hide all popups on window blur
    qx.bom.Element.addListener(window, "blur", this.hideAll, this);
  },




  /*
  *****************************************************************************
     MEMBERS
  *****************************************************************************
  */

  members :
  {
    __objects : null,


    /**
     * Registers a visible popup.
     *
     * @param obj {qx.ui.popup.Popup} The popup to register
     */
    add : function(obj)
    {
      if (qx.core.Environment.get("qx.debug"))
      {
        if (!(obj instanceof qx.ui.popup.Popup)) {
          throw new Error("Object is no popup: " + obj);
        }
      }

      this.__objects.push(obj);
      this.__updateIndexes();
    },


    /**
     * Removes a popup from the registry
     *
     * @param obj {qx.ui.popup.Popup} The popup which was excluded
     */
    remove : function(obj)
    {
      if (qx.core.Environment.get("qx.debug"))
      {
        if (!(obj instanceof qx.ui.popup.Popup)) {
          throw new Error("Object is no popup: " + obj);
        }
      }

      if (this.__objects) {
        qx.lang.Array.remove(this.__objects, obj)
        this.__updateIndexes();
      }
    },


    /**
     * Excludes all currently open popups,
     * except those with {@link qx.ui.popup.Popup#autoHide} set to false.
     */
    hideAll : function()
    {
      var current;
      var objects = this.__objects;

      if (objects) {
        for (var i = 0, l = objects.length; i < l; i++) {
          var current = objects[i];
          current.getAutoHide() && current.exclude();
        }
      }
    },




    /*
    ---------------------------------------------------------------------------
      INTERNAL HELPER
    ---------------------------------------------------------------------------
    */

    /**
     * Updates the zIndex of all registered items to push
     * newly added ones on top of existing ones
     *
     * @return {void}
     */
    __updateIndexes : function()
    {
      var min = 1e7;
      for (var i = 0; i < this.__objects.length; i++) {
        this.__objects[i].setZIndex(min++);
      }
    },




    /*
    ---------------------------------------------------------------------------
      EVENT HANDLER
    ---------------------------------------------------------------------------
    */

    /**
     * Event handler for mouse down events
     *
     * @param e {qx.event.type.Mouse} Mouse event object
     */
    __onMouseDown : function(e)
    {
      // Get the corresponding widget of the target since we are dealing with
      // DOM elements here. This is necessary because we have to be aware of
      // Inline applications which are not covering the whole document and
      // therefore are not able to get all mouse events when only the
      // application root is monitored.
      var target = qx.ui.core.Widget.getWidgetByElement(e.getTarget());

      var reg = this.__objects;
      for (var i = 0; i < reg.length; i++)
      {
        var obj = reg[i];

        if (!obj.getAutoHide() || target == obj || qx.ui.core.Widget.contains(obj, target)) {
          continue;
        }

        obj.exclude();
      }
    }
  },



  /*
  *****************************************************************************
     DESTRUCTOR
  *****************************************************************************
  */

  destruct : function()
  {
    qx.event.Registration.removeListener(document.documentElement, "mousedown",
                                         this.__onMouseDown, this, true);

    this._disposeArray("__objects");
  }
});
