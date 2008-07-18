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
  extend : qx.core.Object,



  /*
  *****************************************************************************
     CONSTRUCTOR
  *****************************************************************************
  */

  construct : function()
  {
    this.base(arguments);

    // Create data structure
    this.__objects = {};

    // React on mousedown/mouseup events
    var root = qx.core.Init.getApplication().getRoot();
    root.addListener("mousedown", this.__onMouseDown, this, true);
    root.addListener("mouseup", this.__onMouseUp, this);

    // Hide all when the window is blurred
    qx.bom.Element.addListener(window, "blur", this.hideAll, this);
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
      PUBLIC METHODS
    ---------------------------------------------------------------------------
    */

    add : function(obj)
    {
      if (qx.core.Variant.isSet("qx.debug", "on"))
      {
        if (!(obj instanceof qx.ui.menu.Menu)) {
          throw new Error("Object is no menu: " + obj);
        }
      }

      this.__objects[obj.$$hash] = obj;
      obj.setZIndex(this.__currentZIndex++);
    },


    remove : function(obj)
    {
      if (qx.core.Variant.isSet("qx.debug", "on"))
      {
        if (!(obj instanceof qx.ui.menu.Menu)) {
          throw new Error("Object is no menu: " + obj);
        }
      }

      var reg = this.__objects;
      delete reg[obj.$$hash];

      // When the registry is empty reset the zIndex
      for (var hash in reg) {
        return;
      }

      this.__currentZIndex = 1e6;
    },


    hideAll : function()
    {
      var reg = this.__objects;
      for (var hash in reg) {
        reg[hash].exclude();
      }
    },


    isInMenu : function(widget)
    {
      while(widget)
      {
        if (widget instanceof qx.ui.menu.Menu) {
          return true;
        }

        widget = widget.getLayoutParent();
      }

      return false;
    },



    /*
    ---------------------------------------------------------------------------
      EVENT HANDLERS
    ---------------------------------------------------------------------------
    */

    __currentZIndex : 1e6,

    __onMouseDown : function(e)
    {
      var target = e.getTarget();
      if (!this.isInMenu(target)) {
        this.hideAll();
      }
    },

    __onMouseUp : function(e) {
      this.hideAll();
    }
  }
});
