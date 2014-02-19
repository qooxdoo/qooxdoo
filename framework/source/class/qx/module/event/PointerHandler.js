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
 * TODOC
 *
 * @require(qx.module.Event)
 *
 * @group (Event_Normalization)
 */
qx.Bootstrap.define("qx.module.event.PointerHandler", {

  statics :
  {
    /**
     * List of events that require a pointer handler
     */
    TYPES : [
      "pointermove",
      "pointerover",
      "pointerout",
      "pointerdown",
      "pointerup",
      "pointercancel"
    ],

    /**
     * Creates a pointer handler for the given element when a pointer event listener
     * is attached to it
     *
     * @param element {Element} DOM element
     */
    register : function(element) {
      if (!element.__pointerHandler) {
        if (!element.__emitter) {
          element.__emitter = new qx.event.Emitter();
        }
        element.__pointerHandler = new qx.event.handler.PointerCore(element, element.__emitter);
      }
    },


    /**
     * Removes the pointer event handler from the element if there are no more
     * pointer event listeners attached to it
     * @param element {Element} DOM element
     */
    unregister : function(element) {
      if (element.__pointerHandler) {
        if (!element.__emitter) {
          element.__pointerHandler = null;
        }
        else {
          var hasPointerListener = false;
          var listeners = element.__emitter.getListeners();
          qx.module.event.PointerHandler.TYPES.forEach(function(type) {
            if (type in listeners && listeners[type].length > 0) {
              hasPointerListener = true;
            }
          });
          if (!hasPointerListener) {
            element.__pointerHandler = null;
          }
        }
      }
    }
  },

  defer : function(statics)
  {
    if (!qx.core.Environment.get("event.mspointer")) {
      qxWeb.$registerEventHook(statics.TYPES, statics.register, statics.unregister);
    }
  }
});
