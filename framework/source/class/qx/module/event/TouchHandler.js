/* ************************************************************************

   qooxdoo - the new era of web development

   http://qooxdoo.org

   Copyright:
     2012 1&1 Internet AG, Germany, http://www.1und1.de

   License:
     LGPL: http://www.gnu.org/licenses/lgpl.html
     EPL: http://www.eclipse.org/org/documents/epl-v10.php
     See the LICENSE file in the project's top-level directory for details.

   Authors:
     * Daniel Wagner (danielwagner)

************************************************************************ */

/* ************************************************************************
#require(qx.module.Event)
************************************************************************ */

/**
 * Creates a touch event handler that fires high-level events such as "swipe"
 * based on low-level event sequences on the given element
 */
qx.Bootstrap.define("qx.module.event.TouchHandler", {

  statics :
  {
    /**
     * List of events that require a touch handler
     * @type Array
     */
    TYPES : ["tap", "swipe"],
    
    /**
     * Creates a touch handler for the given element
     * 
     * @param element {Element} DOM element
     */
    eventHook : function(element)
    {
      if (!element.__touchHandler) {
        if (!element.__emitter) {
          element.__emitter = new qx.event.Emitter();
        }
        element.__touchHandler = new qx.event.handler.TouchCore(element, element.__emitter);
      }
    }
  },
  
  defer : function(statics)
  {
    q.registerEventHook(statics.TYPES, statics.eventHook);
  }
});