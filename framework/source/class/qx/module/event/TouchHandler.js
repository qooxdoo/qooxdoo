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
     * Creates a touch handler for the given element when a touch event listener
     * is attached to it
     *
     * @param element {Element} DOM element
     */
    register : function(element)
    {
      if (!element.__touchHandler) {
        if (!element.__emitter) {
          element.__emitter = new qx.event.Emitter();
        }
        element.__touchHandler = new qx.event.handler.TouchCore(element, element.__emitter);
      }
    },


    /**
     * Removes the touch event handler from the element if there are no more
     * touch event listeners attached to it
     * @param element {Element} DOM element
     */
    unregister : function(element)
    {
      if (element.__touchHandler) {
        if (!element.__emitter) {
          element.__touchHandler = null;
        }
        else {
          var hasTouchListener = false;
          var listeners = element.__emitter.getListeners();
          qx.module.event.TouchHandler.TYPES.forEach(function(type) {
            if (type in listeners && listeners[type].length > 0) {
              hasTouchListener = true;
            }
          });
          if (!hasTouchListener) {
            element.__touchHandler = null;
          }
        }
      }
    }
  },

  defer : function(statics)
  {
    q.$registerEventHook(statics.TYPES, statics.register, statics.unregister);
  }
});