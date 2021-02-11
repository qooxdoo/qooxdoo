/* ************************************************************************

   qooxdoo - the new era of web development

   http://qooxdoo.org

   Copyright:
     2004-2008 1&1 Internet AG, Germany, http://www.1und1.de

   License:
     MIT: https://opensource.org/licenses/MIT
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

    // Create data structure, use an array because order matters [BUG #4323]
    this.__objects = [];

    // Register pointerdown handler
    qx.event.Registration.addListener(document.documentElement, "pointerdown",
                                      this.__onPointerDown, this, true);

    // Hide all popups on window blur
    qx.bom.Element.addListener(window, "blur", this.hideAll, this);
  },


  properties :
  {
    /**
     * Function that is used to determine if a widget is contained within another one.
     **/
    containsFunction :
    {
      check : "Function",
      init : qx.ui.core.Widget.contains
    }
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

      qx.lang.Array.remove(this.__objects, obj);
      this.__updateIndexes();
    },


    /**
     * Excludes all currently open popups,
     * except those with {@link qx.ui.popup.Popup#autoHide} set to false.
     */
    hideAll : function()
    {
      var l = this.__objects.length, current = {};

      while (l--) {
        current = this.__objects[l];
        if (current.getAutoHide()) {
          current.exclude();
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
     * Event handler for pointer down events
     *
     * @param e {qx.event.type.Pointer} Pointer event object
     */
    __onPointerDown : function(e)
    {
      // Get the corresponding widget of the target since we are dealing with
      // DOM elements here. This is necessary because we have to be aware of
      // Inline applications which are not covering the whole document and
      // therefore are not able to get all pointer events when only the
      // application root is monitored.
      var target = qx.ui.core.Widget.getWidgetByElement(e.getTarget());

      var reg = this.__objects;
      for (var i = 0; i < reg.length; i++)
      {
        var obj = reg[i];

        if (!obj.getAutoHide() || target == obj || this.getContainsFunction()(obj, target)) {
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
    qx.event.Registration.removeListener(document.documentElement, "pointerdown",
                                         this.__onPointerDown, this, true);

    this._disposeArray("__objects");
  }
});
