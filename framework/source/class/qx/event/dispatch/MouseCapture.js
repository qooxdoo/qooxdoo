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
  extend : qx.event.dispatch.AbstractBubbling,
  

  /**
   * Create a new instance
   *
   * @param manager {qx.event.Manager} Event manager for the window to use
   */
  construct : function(manager)
  {
    this.base(arguments, manager);
    this.__window = manager.getWindow();

    manager.addListener(this.__window, "blur", this.releaseCapture, this);
    manager.addListener(this.__window, "focus", this.releaseCapture, this);
    manager.addListener(this.__window, "scroll", this.releaseCapture, this);
  },


  statics :
  {
    /** {Integer} Priority of this dispatcher */
    PRIORITY : qx.event.Registration.PRIORITY_FIRST
  },


  members:
  {
    __captureElement : null,
    __window : null,

    
    // overridden
    _getParent : function(target) {
      return target.parentNode;
    },
    
    
    /*
    ---------------------------------------------------------------------------
      EVENT DISPATCHER INTERFACE
    ---------------------------------------------------------------------------
    */

    // overridden
    canDispatchEvent : function(target, event, type)
    {
      return (
        this.__captureElement &&
        this.__captureEvents[type]
      );
    },


    // overridden
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

      this.base(arguments, this.__captureElement, event, type);
    },


    /*
    ---------------------------------------------------------------------------
      HELPER
    ---------------------------------------------------------------------------
    */

    /**
     * @lint ignoreReferenceField(__captureEvents) 
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
     * @param element {Element} The element which should capture the mouse events.
     */
    activateCapture : function(element)
    {
      if (this.__captureElement === element) {
        return;
      }

      if (this.__captureElement) {
        this.releaseCapture();
      }
      
      // turn on native mouse capturing if the browser supports it
      this.nativeSetCapture(element);
      if (this.hasNativeCapture)
      {
        var self = this;
        qx.bom.Event.addNativeListener(element, "losecapture", function()
        {
          qx.bom.Event.removeNativeListener(element, "losecapture", arguments.callee);
          self.releaseCapture();
        });
      }

      this.__captureElement = element;
      qx.event.Registration.fireEvent(element, "capture", qx.event.type.Event, [true, false]);
    },


    /**
     * Get the element currently capturing events.
     *
     * @return {Element|null} The current capture element. This value may be
     *    null.
     */
    getCaptureElement : function() {
      return this.__captureElement;
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
      
      // turn off native mouse capturing if the browser supports it
      this.nativeReleaseCapture(element);

      this.__captureElement = null;
      qx.event.Registration.fireEvent(element, "losecapture", qx.event.type.Event, [true, false]);
    },
    
    
    /** Whether the browser has native mouse capture support */
    hasNativeCapture : qx.bom.client.Engine.MSHTML,
    
    
    /**
     * If the browser supports native mouse capturing, sets the mouse capture to
     * the object that belongs to the current document.
     * 
     * @param element {Element} The capture DOM element
     * @signature function(element)
     */
    nativeSetCapture : qx.core.Variant.select("qx.client",
    {
      "mshtml" : function(element) {
        element.setCapture();
      },
      
      "default" : qx.lang.Function.empty
    }),
    
    
    /**
     * If the browser supports native mouse capturing, removes mouse capture 
     * from the object in the current document. 
     * 
     * @param element {Element} The DOM element to release the capture for
     * @signature function(element)
     */
    nativeReleaseCapture : qx.core.Variant.select("qx.client",
    {
      "mshtml" : function(element) {
        element.releaseCapture();
      },
      
      "default" : qx.lang.Function.empty
    })
  },


  destruct : function() {
    this._disposeFields("__captureElement", "__window");
  },


  defer : function(statics) {
    qx.event.Registration.addDispatcher(statics);
  }
});