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
#require(qx.bom.Event#getTarget)
#require(qx.bom.Event#getRelatedTarget)
************************************************************************ */

/**
 * Common normalizations for native events
 */
qx.Bootstrap.define("qx.module.event.Native", {
  statics :
  {
    /**
     * List of event types to be normalized
     */
    TYPES : ["*"],

    /**
     * List of qx.bom.Event methods to be attached to native event objects
     * @internal
     */
    FORWARD_METHODS : ["getTarget", "getRelatedTarget"],

    /**
     * List of qx.module.event.Native methods to be attached to native event objects
     * @internal
     */
    BIND_METHODS : ["preventDefault", "stopPropagation", "getType"],


    /**
     * Prevent the native default behavior of the event.
     */
    preventDefault : function()
    {
      try {
        // this allows us to prevent some key press events in IE.
        // See bug #1049
        this.keyCode = 0;
      } catch(ex) {}

      this.returnValue = false;
    },


    /**
     * Stops the event's propagation to the element's parent
     */
    stopPropagation : function()
    {
      this.cancelBubble = true;
    },


    /**
     * Returns the event's type
     *
     * @return {String} event type
     */
    getType : function()
    {
      return this._type || this.type;
    },

    /**
     * Manipulates the native event object, adding methods if they're not
     * already present
     *
     * @param event {Event} Native event object
     * @param element {Element} DOM element the listener was attached to
     * @return {Event} Normalized event object
     * @internal
     */
    normalize : function(event, element) {
      if (!event) {
        return event;
      }
      var fwdMethods = qx.module.event.Native.FORWARD_METHODS;
      for (var i=0, l=fwdMethods.length; i<l; i++) {
        event[fwdMethods[i]] = qx.lang.Function.curry(qx.bom.Event[fwdMethods[i]], event);
      }

      var bindMethods = qx.module.event.Native.BIND_METHODS;
      for (var i=0, l=bindMethods.length; i<l; i++) {
        if (typeof event[bindMethods[i]] != "function") {
          event[bindMethods[i]] = qx.module.event.Native[bindMethods[i]].bind(event);
        }
      }

      event.getCurrentTarget = function()
      {
        return event.currentTarget || element;
      };

      return event;
    }
  },

  defer : function(statics) {
    q.$registerEventNormalization(statics.TYPES, statics.normalize);
  }
});