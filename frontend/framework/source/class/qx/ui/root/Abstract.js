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

      return;

      // Stop native event
      // This is need to block low-level event handler from interfering with widget
      // focus system
      /*
      var nativeEvent = e.getNativeEvent();
      if (nativeEvent.stopPropagation) {
        nativeEvent.stopPropagation();
      }
      nativeEvent.cancelBubble = true;
      */

      // Only process targets which are not selectable
      if (target.isEnabled())
      {
        if (!target.isSelectable() && !target.isFocusable())
        {
          // According to MSDN:
          // An element with the UNSELECTABLE attribute set to on can be included
          // in a selection that starts somewhere outside the element.
          //
          // This means we must stop the selection on the element which received
          // the last mouse down. We handle this automatically and dynamically
          // here following the user configured rule (property: selectable)
          if (qx.core.Variant.isSet("qx.client", "mshtml"))
          {
            var domTarget = e.getDomTarget();

            if (this._lastMouseDown) {
              this._lastMouseDown.unselectable = null;
            }

            this._lastMouseDown = domTarget;
            domTarget.unselectable = "on";
          }

          // Stop the native event as this may intialize native
          // drag and drop which not the behavior we want to see here.
          else
          {
            e.preventDefault();
          }
        }

        /*
        // The prevent of native events afterwards breaks the focus detection
        // of qx.event.handler.Focus which relies on native events. To fix
        // this we call the focus manually.
        var focusTarget = target.getFocusTarget();
        if (focusTarget) {
          focusTarget.focus();
        }

        // Finally activate real target
        // Must be done afterwards as focus also leads to activation of the given element.
        target.activate();
        */
      }
      else
      {
        e.preventDefault();
      }
    },


    _onmouseup : function(e)
    {
      if (this._lastMouseDown) {
        //this._lastMouseDown.unselectable = null;
      }
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
