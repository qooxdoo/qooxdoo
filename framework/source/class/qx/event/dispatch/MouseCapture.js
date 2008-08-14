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

#use(qx.event.handler.Focus)
#use(qx.event.handler.Window)
#use(qx.event.handler.Capture)

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
   * @param manager {qx.event.Manager} Event manager for the window to use
   */
  construct : function(manager)
  {
    this.base(arguments);

    this.__manager = manager;
    this.__window = manager.getWindow();

    manager.addListener(this.__window, "blur", this.releaseCapture, this);
    manager.addListener(this.__window, "focus", this.releaseCapture, this);
    manager.addListener(this.__window, "scroll", this.releaseCapture, this);
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

    __captureElement : null,
    __manager : null,
    __window : null,

    /*
    ---------------------------------------------------------------------------
      EVENT DISPATCHER INTERFACE
    ---------------------------------------------------------------------------
    */

    // interface implementation
    canDispatchEvent : function(target, event, type) {
      return this.__captureElement && this.__captureEvents[type];
    },


    // interface implementation
    dispatchEvent : function(target, event, type)
    {
      // Conforming to the MS implementation a mouse click will stop mouse
      // capturing. The event is "eaten" by the capturing handler.
      if (type == "click")
      {
        event.stopPropagation();

        this.releaseCapture();
        return;
      }

      var listeners = this.__manager.getListeners(this.__captureElement, type, false);

      if (listeners)
      {
        event.setCurrentTarget(this.__captureElement);
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
      if (this.__captureElement === element) {
        return;
      }

      if (this.__captureElement) {
        this.releaseCapture();
      }

      this.__captureElement = element;
      qx.event.Registration.fireEvent(element, "capture", qx.event.type.Event, [true, false]);
    },


    /**
     * Stop capturing of mouse events.
     */
    releaseCapture : function()
    {
      var element = this.__captureElement;

      if (!element) {
        return;
      }

      this.__captureElement = null;
      qx.event.Registration.fireEvent(element, "losecapture", qx.event.type.Event, [true, false]);
    }
  },



  /*
  *****************************************************************************
     DESTRUCTOR
  *****************************************************************************
  */

  destruct : function() {
    this._disposeFields("__captureElement", "__manager", "__window");
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
