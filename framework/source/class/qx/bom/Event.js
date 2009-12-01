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
 * Wrapper around native event management capabilities of the browser.
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
      "mshtml" : function(target, type, listener) 
      {
        try {
          target.detachEvent("on" + type, listener);
	}
        catch(e)
        {
          if(e.number !== -2146828218) {
            throw e;
          };
        }
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

      "gecko" : function(e)
      {
        // In Firefox the related target of mouse events is sometimes an
        // anonymous div inside of a text area, which raises an exception if
        // the nodeType is read. This is why the try/catch block is needed.
        try {
          e.relatedTarget && e.relatedTarget.nodeType;
        } catch (e) {
          return null;
        }
        return e.relatedTarget;
      },

      "default" : function(e) {
        return e.relatedTarget;
      }
    }),


    /**
     * Prevent the native default of the event to be processed.
     *
     * This is useful to stop native keybindings, native selection
     * and other native functionality behind events.
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

        // not working in firefox 3 and above
        if (qx.bom.client.Engine.VERSION < 1.9) {
          try
          {
            // this allows us to prevent some key press events in IE and Firefox.
            // See bug #1049
            e.keyCode = 0;
          } catch(ex) {}
        }
      },

      "mshtml" : function(e)
      {
        try
        {
          // this allows us to prevent some key press events in IE and Firefox.
          // See bug #1049
          e.keyCode = 0;
        } catch(ex) {}

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
    },


    /**
     * Fires a synthetic native event on the given element.
     *
     * @param target {Element} DOM element to fire event on
     * @param type {String} Name of the event to fire
     */
    fire : function(target, type)
    {
      // dispatch for IE
      if (document.createEventObject)
      {
        var evt = document.createEventObject();
        return target.fireEvent("on" + type, evt);
      }

      // dispatch for others
      else
      {
        var evt = document.createEvent("HTMLEvents");
        evt.initEvent(type, true, true);

        return !target.dispatchEvent(evt);
      }
    },


    /** 
     * Whether the given target supports the given event type.
     *
     * Useful for testing for support of new features like
     * touch events, gesture events, orientation change, on/offline, etc.
     * 
     * @param target {var} Any valid target e.g. window, dom node, etc.
     * @param type {String} Type of the event e.g. click, mousedown
     * @return {Boolean} Whether the given event is supported
     */
    supportsEvent : function(target, type) {
      return target.hasOwnProperty("on" + type);
    }
  }
});
