/* ************************************************************************

   qooxdoo - the new era of web development

   http://qooxdoo.org

   Copyright:
     2014 1&1 Internet AG, Germany, http://www.1und1.de

   License:
     LGPL: http://www.gnu.org/licenses/lgpl.html
     EPL: http://www.eclipse.org/org/documents/epl-v10.php
     See the LICENSE file in the project's top-level directory for details.

   Authors:
     * Daniel Wagner (danielwagner)

************************************************************************ */

/**
 * Creates a gesture handler that fires high-level events such as "swipe"
 * based on low-level event sequences on the given element
 *
 * @require(qx.module.Event)
 * @require(qx.module.event.PointerHandler)
 *
 * @group (Event_Normalization)
 */
qx.Bootstrap.define("qx.module.event.GestureHandler", {

  statics : {

    TYPES : ["tap", "longtap", "swipe"],

    POINTER_EVENTS : ["pointerdown", "pointerup", "pointermove"],

    /**
     * Creates a gesture handler for the given element when a gesture event listener
     * is attached to it
     *
     * @param element {Element} DOM element
     */
    register : function(element, type) {
      // force qx.bom.Event.supportsEvent to return true for this type so we
      // can use the native addEventListener (synthetic gesture events use the
      // native dispatchEvent).
      if (!element["on" + type]) {
        element["on" + type] = true;
      }

      if (!element.__gestureHandler) {
        element.__gestureHandler = new qx.event.handler.GestureCore(element);

        qx.module.event.GestureHandler.POINTER_EVENTS.forEach(function(pointerType) {
          var propName = "__on" + pointerType;
          element[propName] = function(pointerEvent) {
            element.__gestureHandler.checkAndFireGesture(pointerEvent, pointerType, element);
          };
          q(element).on(pointerType, element[propName], element.__gestureHandler);
        });
      }
    },


    /**
     * Removes the gesture event handler from the element if there are no more
     * gesture event listeners attached to it
     * @param element {Element} DOM element
     */
    unregister : function(element) {
      if (element.__gestureHandler) {
        element.__gestureHandler.dispose();
        element.__gestureHandler = null;
      }
    }
  },

  defer : function(statics)
  {
    qxWeb.$registerEventHook(statics.TYPES, statics.register, statics.unregister);
  }
});
