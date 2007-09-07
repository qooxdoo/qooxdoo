/* ************************************************************************

   qooxdoo - the new era of web development

   http://qooxdoo.org

   Copyright:
     2007 1&1 Internet AG, Germany, http://www.1and1.org

   License:
     LGPL: http://www.gnu.org/licenses/lgpl.html
     EPL: http://www.eclipse.org/org/documents/epl-v10.php
     See the LICENSE file in the project's top-level directory for details.

   Authors:
     * Fabian Jakobs (fjakobs)

************************************************************************ */

/* ************************************************************************

#module(event2)

************************************************************************ */

/**
 * This class is the default event handler for all bubbling events.
 *
 * @internal
 */
qx.Class.define("qx.event.handler.Inline",
{
  extend : qx.event.handler.Abstract,




  /*
  *****************************************************************************
     CONSTRUCTOR
  *****************************************************************************
  */

  construct : function(manager)
  {
    this.base(arguments, manager);
    this.__registeredEvents = {};
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
      EVENT HANDLER INTERFACE
    ---------------------------------------------------------------------------
    */
        
    /** {Map} Internal data structure with all supported DOM events */
    _windowEvents :
    {
      // Window 
      error : true,
      beforeunload : true,
      load : true,
      unload : true,
      resize : true
    },
    
    _elementEvents :
    {
      abort : true,    // Image elements only
      scroll : true,    
      change : true,
      select : true,
      reset : true,    // Form Elements only
      submit : true    // Form Elements
    },


    // overridden
    canHandleEvent : function(target, type) {
      return (
        (this._windowEvents[type] || this._elementEvents[type]) &&
        (
          typeof(target.nodeType) === "number" ||
          typeof(target.document) === "object"
        )
      );
    },


    // overridden
    registerEvent : function(target, type)
    {
      var elementId = qx.core.Object.toHashCode(target);
      var listener = qx.lang.Function.bind(this.__handleEvent, this, false, [elementId]);

      qx.event.Manager.addNativeListener(target, type, listener);

      var id = elementId + type;

      this.__registeredEvents[id] =
      {
        element : target,
        type : type,
        listener : listener
      };
    },


    // overridden
    unregisterEvent : function(element, type)
    {
      var id = qx.core.Object.toHashCode(element) + type;

      var eventData = this.__registeredEvents[id];
      qx.event.Manager.removeNativeListener(element, type, eventData.listener);

      delete(this.__registeredEvents[id]);
    },


    // overridden
    removeAllListeners : function()
    {
      for (var id in this.__registeredEvents)
      {
        var eventData = this.__registeredEvents[id];
        qx.event.Manager.removeNativeListener(
          eventData.element,
          eventData.type,
          eventData.listener
        );
      }

      this.__registeredEvents = {};
    },





    /*
    ---------------------------------------------------------------------------
      EVENT-HANDLER
    ---------------------------------------------------------------------------
    */

    /**
     * Default event handler.
     *
     * @param elementId {Integer} element id of the current target
     * @param domEvent {Event} DOM event
     */
    __handleEvent : function(elementId, domEvent)
    {
      var event = qx.event.Manager.createEvent(qx.event.type.Dom).init(domEvent);
      event.setBubbles(false);

      var eventData = this.__registeredEvents[elementId + event.getType()];
      var element = eventData ? eventData.element : event.getTarget();
      event.setCurrentTarget(element);

      this._manager.dispatchEvent(domEvent.target, event);
    }
  },
  
  
  
  
  
  /*
  *****************************************************************************
     DESTRUCTOR
  *****************************************************************************
  */

  destruct : function()
  {
    this.removeAllListeners();
    this._disposeFields("__registeredEvents");
  }
});
