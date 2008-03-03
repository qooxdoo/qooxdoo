 /* ************************************************************************

   qooxdoo - the new era of web development

   http://qooxdoo.org

   Copyright:
     2007-2008 1&1 Internet AG, Germany, http://www.1und1.de

   License:
     LGPL: http://www.gnu.org/licenses/lgpl.html
     EPL: http://www.eclipse.org/org/documents/epl-v10.php
     See the LICENSE file in the project's top-level directory for details.

   Authors:
     * Fabian Jakobs (fjakobs)

************************************************************************ */

/* ************************************************************************

#require(qx.event.handler.Focus)
#require(qx.event.handler.Window)
#require(qx.event.handler.Capture)
#require(qx.event.handler.ViewportLeave)

************************************************************************ */

/**
 * Implementation of the Internet Explorer specific event capturing mode for
 * mouse events http://msdn2.microsoft.com/en-us/library/ms536742.aspx.
 *
 * This class is used internally by {@link qx.event.Manager} to do mouse event
 * capturing.
 */
qx.Class.define("qx.event.dispatch.MouseCapture",
{
  extend : qx.core.Object,
  implement : qx.event.IEventDispatcher,




  /*
  *****************************************************************************
     CONSTRUCTOR
  *****************************************************************************
  */

  /**
   * Create a new instance
   *
   * @type constructor
   * @param manager {qx.event.Manager} Event manager for the window to use
   */
  construct : function(manager)
  {
    this.base(arguments);

    this._manager = manager;
    this._window = manager.getWindow();

    manager.addListener(this._window, "blur", this.releaseCapture, this);
    manager.addListener(this._window, "focus", this.releaseCapture, this);
    manager.addListener(this._window, "scroll", this.releaseCapture, this);
  },







  /*
  *****************************************************************************
     STATICS
  *****************************************************************************
  */

  statics :
  {
    /** {Integer} Priority of this dispatcher */
    PRIORITY : qx.event.Registration.PRIORITY_FIRST
  },






  /*
  *****************************************************************************
     MEMBERS
  *****************************************************************************
  */

  members:
  {
    /*
    ---------------------------------------------------------------------------
      EVENT DISPATCHER INTERFACE
    ---------------------------------------------------------------------------
    */

    // interface implementation
    canDispatchEvent : function(target, event, type) {
      return this._captureElement && this.__captureEvents[type];
    },


    // interface implementation
    dispatchEvent : function(target, event, type)
    {
      // Conforming to the MS implementation a mouse click will stop mouse
      // capturing. The event is "eaten" by the capturing handler.
      if (type == "click")
      {
        event.preventDefault();
        event.stopPropagation();

        this.releaseCapture();
        return;
      }

      var listeners = this._manager.getListeners(this._captureElement, type, false);

      if (listeners)
      {
        event.setCurrentTarget(this._captureElement);
        event.setEventPhase(qx.event.type.Event.AT_TARGET);

        for (var i=0, l=listeners.length; i<l; i++)
        {
          var context = listeners[i].context || event.getCurrentTarget();
          listeners[i].handler.call(context, event);
        }
      }
    },




    /*
    ---------------------------------------------------------------------------
      HELPER
    ---------------------------------------------------------------------------
    */

    __captureEvents :
    {
      "mouseup": 1,
      "mousedown": 1,
      "click": 1,
      "dblclick": 1,
      "mousemove": 1,
      "mouseout": 1,
      "mouseover": 1
    },






    /*
    ---------------------------------------------------------------------------
      USER ACCESS
    ---------------------------------------------------------------------------
    */

    /**
     * Set the given element as target for event
     *
     * @param element {Element} The element which should capture the mouse evnets.
     */
    activateCapture : function(element)
    {
      if (this._captureElement === element) {
        return;
      }

      if (this._captureElement) {
        this.releaseCapture();
      }

      this._captureElement = element;
      qx.event.Registration.fireEvent(element, "capture");
    },


    /**
     * Stop capturing of mouse events.
     */
    releaseCapture : function()
    {
      var element = this._captureElement;

      if (!element) {
        return;
      }

      this._captureElement = null;
      qx.event.Registration.fireEvent(element, "losecapture");
    }
  },



  /*
  *****************************************************************************
     DESTRUCTOR
  *****************************************************************************
  */

  destruct : function() {
    this._disposeFields("_captureElement", "_manager", "_window");
  },





  /*
  *****************************************************************************
     DEFER
  *****************************************************************************
  */

  defer : function(statics) {
    qx.event.Registration.addDispatcher(statics);
  }
});
