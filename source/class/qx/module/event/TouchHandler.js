/* ************************************************************************

   qooxdoo - the new era of web development

   http://qooxdoo.org

   Copyright:
     2012 1&1 Internet AG, Germany, http://www.1und1.de

   License:
     MIT: https://opensource.org/licenses/MIT
     See the LICENSE file in the project's top-level directory for details.

   Authors:
     * Daniel Wagner (danielwagner)

************************************************************************ */

/**
 * Creates a touch event handler that fires high-level events such as "swipe"
 * based on low-level event sequences on the given element
 *
 * @require(qx.module.Event)
 *
 * @group (Event_Normalization)
 */
qx.Bootstrap.define("qx.module.event.TouchHandler", {

  statics :
  {
    /**
     * List of events that require a touch handler
     */
    TYPES : ["touchstart", "touchend", "touchmove", "touchcancel"],

    /**
     * Creates a touch handler for the given element when a touch event listener
     * is attached to it
     *
     * @param element {Element} DOM element
     */
    register : function(element)
    {
      if (!element.__touchHandler) {
        if (!element.$$emitter) {
          element.$$emitter = new qx.event.Emitter();
        }
        element.__touchHandler = new qx.event.handler.TouchCore(element, element.$$emitter);
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
        if (!element.$$emitter) {
          element.__touchHandler = null;
        }
        else {
          var hasTouchListener = false;
          var listeners = element.$$emitter.getListeners();
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
    qxWeb.$registerEventHook(statics.TYPES, statics.register, statics.unregister);
  }
});
