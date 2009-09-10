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
 * The CanvasLayout, which fires scroll events. Widgets which need to react on scroll
 * events should extend thie class.
 */
qx.Class.define("qx.legacy.ui.basic.ScrollArea",
{
  extend : qx.legacy.ui.layout.CanvasLayout,



  /*
  *****************************************************************************
     CONSTRUCTOR
  *****************************************************************************
  */

  construct : function()
  {
    this.base(arguments);

    this.__onscroll = qx.lang.Function.listener(this._onscroll, this);
  },



  /*
  *****************************************************************************
     EVENTS
  *****************************************************************************
  */

  events :
  {
    /** Fired each time the widget gets scrolled. */
    "scroll" : "qx.event.type.Event"
  },



  /*
  *****************************************************************************
     MEMBERS
  *****************************************************************************
  */

  members :
  {
    _applyElement : function(value, old)
    {
      this.base(arguments, value, old);

      if (value)
      {
        // Register inline event
        if (qx.core.Variant.isSet("qx.client", "mshtml")) {
          value.attachEvent("onscroll", this.__onscroll);
        } else {
          value.addEventListener("scroll", this.__onscroll, false);
        }
      }
    },

    /**
     * Event handler for the scroll event
     *
     * @param e {Event} the event object
     */
    _onscroll : function(e)
    {
      this.fireEvent("scroll");
      qx.legacy.event.handler.EventHandler.stopDomEvent(e);
    }
  },



  /*
  *****************************************************************************
     DESTRUCTOR
  *****************************************************************************
  */

  destruct : function()
  {
    var el = this.getElement();

    if (el)
    {
      // Register inline event
      if (qx.core.Variant.isSet("qx.client", "mshtml")) {
        el.detachEvent("onscroll", this.__onscroll);
      } else {
        el.removeEventListener("scroll", this.__onscroll, false);
      }

      delete this.__onscroll;
    }
  }
});
