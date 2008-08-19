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
     * Sebastian Werner (wpbasti)

************************************************************************ */

/**
 * Wrapper around native event managment capabilities of the browser.
 * This class should not be used directly normally. It's better
 * to use {@link qx.event.Registration} instead.
 */
qx.Bootstrap.define("qx.bom.Event",
{
  statics :
  {
    /**
     * Use the low level browser functionality to attach event listeners
     * to DOM nodes.
     *
     * Use this with caution. This is only thought for event handlers and
     * qualified developers. These are not mem-leak protected!
     *
     * @param target {Object} Any valid native event target
     * @param type {String} Name of the event
     * @param listener {Function} The pointer to the function to assign
     * @signature function(target, type, listener)
     */
    addNativeListener : qx.core.Variant.select("qx.client",
    {
      "mshtml" : function(target, type, listener) {
        target.attachEvent("on" + type, listener);
      },

      "default" : function(target, type, listener) {
        target.addEventListener(type, listener, false);
      }
    }),


    /**
     * Use the low level browser functionality to remove event listeners
     * from DOM nodes.
     *
     * @param target {Object} Any valid native event target
     * @param type {String} Name of the event
     * @param listener {Function} The pointer to the function to assign
     * @signature function(target, type, listener)
     */
    removeNativeListener : qx.core.Variant.select("qx.client",
    {
      "mshtml" : function(target, type, listener) {
        target.detachEvent("on" + type, listener);
      },

      "default" : function(target, type, listener) {
        target.removeEventListener(type, listener, false);
      }
    }),


    /**
     * Returns the target of the event.
     *
     * @param e {Event} Native event object
     * @return {Object} Any valid native event target
     */
    getTarget : function(e) {
      return e.target || e.srcElement;
    },


    /**
     * Computes the related target from the native DOM event
     *
     * @param e {Event} Native DOM event object
     * @return {Element} The related target
     * @signature function(e)
     */
    getRelatedTarget : qx.core.Variant.select("qx.client",
    {
      "mshtml" : function(e)
      {
        if (e.type === "mouseover") {
          return e.fromEvent;
        } else {
          return e.toElement;
        }
      },

      "default" : function(e) {
        return e.relatedTarget;
      }
    }),


    /**
     * Prevent the native default of the event to be processed.
     *
     * This is useful to stop native keybindings, native selection
     * and other native funtionality behind events.
     *
     * @signature function(e)
     * @param e {Event} Native event object
     */
    preventDefault : qx.core.Variant.select("qx.client",
    {
      "gecko" : function(e)
      {
        // Firefox 3 does not fire a "contextmenu" event if the mousedown
        // called "preventDefault" => don't prevent the default behavior for
        // right clicks.
        if (
          qx.bom.client.Engine.VERSION >= 1.9 &&
          e.type == "mousedown" &&
          e.button == 2
        ) {
          return;
        }
        e.preventDefault();

        try
        {
          // this allows us to prevent some key press events in IE and Firefox.
          // See bug #1049
          e.keyCode = 0;
        } catch(e) {}
      },

      "mshtml" : function(e)
      {
        try
        {
          // this allows us to prevent some key press events in IE and Firefox.
          // See bug #1049
          e.keyCode = 0;
        } catch(e) {}

        e.returnValue = false;
      },

      "default" : function(e) {
        e.preventDefault();
      }
    }),


    /**
     * Stops the propagation of the given event to the parent element.
     *
     * Only useful for events which bubble e.g. mousedown.
     *
     * @param e {Event} Native event object
     * @return {void}
     */
    stopPropagation : function(e)
    {
      if (e.stopPropagation) {
        e.stopPropagation();
      }

      e.cancelBubble = true;
    }
  }
});
