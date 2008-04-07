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
     * Fabian Jakobs (fjakobs)

************************************************************************ */

// IE
//document.ondragstart = document.onselectstart = function() {
//  return false;
//}
//
// "ondragenter = return false" stops Drag&Drop in IE
// "-webkit-user-drag = none stops Drag&Drop in Webkit
// "ondragstart should work in gecko as well" / "dragdrop is also there, try capturing mode"
// IE: hideFocus still missing to omit dotted border around focused elements.
// IE: onresizestart/onresizeend??

/**
 * Shared implementation for all root widgets.
 */
qx.Class.define("qx.ui.root.Abstract",
{
  extend : qx.ui.core.Widget,


  /*
  *****************************************************************************
     CONSTRUCTOR
  *****************************************************************************
  */

  construct : function()
  {
    this.base(arguments);

    this.addListener("mousedown", this._onmousedown, this, true);
    this.addListener("mouseup", this._onmouseup, this, true);
  },




  /*
  *****************************************************************************
     PROPERTIES
  *****************************************************************************
  */

  properties :
  {
    // overridden
    appearance :
    {
      refine : true,
      init : "root"
    },

    // overridden
    enabled :
    {
      refine : true,
      init : true
    },

    // overridden
    focusable :
    {
      refine : true,
      init : true
    }
  },



  /*
  *****************************************************************************
     MEMBERS
  *****************************************************************************
  */

  members :
  {
    /**
     * Remove child widget
     *
     * @type member
     * @param child {qx.ui.core.Widget} the widget to remove
     * @return {qx.ui.layout.Abstract} This object (for chaining support)
     */
    remove : function(child) {
      this.getLayout().remove(child);
    },


    /*
    ---------------------------------------------------------------------------
      EVENT HANDLER
    ---------------------------------------------------------------------------
    */

    /**
     * Event handler to support generic focus and selection managment
     * for all widgets.
     *
     */
    _onmousedown : function(e)
    {
      var target = e.getTarget();




    },


    _onmouseup : function(e)
    {
    },


    // overridden
    isRootWidget : function() {
      return true;
    },


    // overridden
    isLayoutRoot : function() {
      return true;
    },


    // overridden
    _applyLayout : function(value, old)
    {
      if (old) {
        throw new Error("You cannot change the layout of qx.ui.root.Page!");
      }

      this.base(arguments, value, old);
    }
  },



  /*
  *****************************************************************************
     DESTRUCT
  *****************************************************************************
  */

  destruct : function()
  {

  }
});
