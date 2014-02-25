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
    register : function(element, type) {
      // force qx.bom.Event.supportsEvent to return true for this type so we
      // can use the native addEventListener (synthetic gesture events use the
      // native dispatchEvent).
      if (!element["on" + type]) {
        element["on" + type] = true;
      }

      if (!element.__pointerHandler) {
        element.__pointerHandler = new qx.event.handler.PointerCore(element);
      }
    },


    /**
     * Removes the pointer event handler from the element if there are no more
     * pointer event listeners attached to it
     * @param element {Element} DOM element
     */
    unregister : function(element) {
      if (element.__pointerHandler) {
        element.__pointerHandler = null;
      }
    }
  },

  defer : function(statics)
  {
    var engineName = q.env.get("engine.name");
    var docMode = parseInt(q.env.get("browser.documentmode"), 10);
    // apply event name normalization in IE 10
    if (!qx.core.Environment.get("event.mspointer") || (engineName == "mshtml" && docMode == 10)) {
      qxWeb.$registerEventHook(statics.TYPES, statics.register, statics.unregister);
    }
  }
});
