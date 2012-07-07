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
 * TODO
 */
qx.Bootstrap.define("qx.module.event.OrientationHandler", {

  statics :
  {
    /**
     * List of events that require an orientation handler
     * @type Array
     */
    TYPES : ["orientationchange"],

    /**
     * Creates an orientation handler for the given window when an
     * orientationchange event listener is attached to it
     *
     * @param element {Window} DOM Window
     */
    register : function(element)
    {
      if (!qx.dom.Node.isWindow(element)) {
        throw new Error("The 'orientationchange' event is only available on window objects!");
      }

      if (!element.__orientationHandler) {
        if (!element.__emitter) {
          element.__emitter = new qx.event.Emitter();
        }

        element.__orientationHandler = new qx.event.handler.OrientationCore(element, element.__emitter);
      }
    },


    /**
     * Removes the orientation event handler from the element if there are no more
     * orientationchange event listeners attached to it
     * @param element {Element} DOM element
     */
    unregister : function(element)
    {
      if (element.__orientationHandler) {
        if (!element.__emitter) {
          element.__orientationHandler = null;
        }
        else {
          var hasListener = false;
          var listeners = element.__emitter.getListeners();
          qx.module.event.OrientationHandler.TYPES.forEach(function(type) {
            if (type in listeners && listeners[type].length > 0) {
              hasListener = true;
            }
          });
          if (!hasListener) {
            element.__orientationHandler = null;
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