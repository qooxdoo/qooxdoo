/* ************************************************************************

   qooxdoo - the new era of web development

   http://qooxdoo.org

   Copyright:
     2014 1&1 Internet AG, Germany, http://www.1und1.de

   License:
     MIT: https://opensource.org/licenses/MIT
     See the LICENSE file in the project's top-level directory for details.

   Authors:
     * Daniel Wagner (danielwagner)

************************************************************************ */

/**
 * Creates a gesture handler that fires high-level events such as "swipe"
 * based on low-level event sequences on the given element
 *
 * @require(qx.module.Event)
 * @use(qx.module.event.PointerHandler)
 *
 * @group (Event_Normalization)
 */
qx.Bootstrap.define("qx.module.event.GestureHandler", {

  statics : {

    TYPES : ["tap", "longtap", "swipe", "dbltap", "track", "trackstart", "trackend", "roll", "rotate", "pinch"],


    /**
     * Creates a gesture handler for the given element when a gesture event listener
     * is attached to it
     *
     * @param element {Element} DOM element
     * @param type {String} event type
     */
    register : function(element, type) {
      if (!element.$$gestureHandler) {

        if (!qx.core.Environment.get("event.dispatchevent")) {
          if (!element.$$emitter) {
            element.$$emitter = new qx.event.Emitter();
          }
        }

        element.$$gestureHandler = new qx.event.handler.GestureCore(element, element.$$emitter);
      }
    },


    /**
     * Removes the gesture event handler from the element if there are no more
     * gesture event listeners attached to it
     * @param element {Element} DOM element
     */
    unregister : function(element) {
      // check if there are any registered listeners left
      if (element.$$gestureHandler) {
        var listeners = element.$$emitter.getListeners();
        for (var type in listeners) {
          if (qx.module.event.GestureHandler.TYPES.indexOf(type) !== -1) {
            if (listeners[type].length > 0) {
              return;
            }
          }
        }

        // no more listeners, get rid of the handler
        element.$$gestureHandler.dispose();
        element.$$gestureHandler = undefined;
      }
    }
  },

  defer : function(statics)
  {
    qxWeb.$registerEventHook(statics.TYPES, statics.register, statics.unregister);
  }
});
