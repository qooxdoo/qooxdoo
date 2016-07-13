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
 * Common normalizations for native events
 *
 * @require(qx.module.Event)
 * @require(qx.bom.Event#getTarget)
 * @require(qx.bom.Event#getRelatedTarget)
 *
 * @group (Event_Normalization)
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
     * Returns the target of the event.
     *
     * @signature function ()
     * @return {Object} Any valid native event target
     */
    getTarget : function() {},


    /**
     * Computes the related target from the native DOM event
     *
     * @signature function ()
     * @return {Element} The related target
     */
    getRelatedTarget : function() {},


    /**
     * Computes the current target from the native DOM event. Emulates the current target
     * for all browsers without native support (like older IEs).
     *
     * @signature function ()
     * @return {Element} The current target
     */
    getCurrentTarget : function() {},

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
        event[fwdMethods[i]] = qx.bom.Event[fwdMethods[i]].bind(null, event);
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
    qxWeb.$registerEventNormalization(statics.TYPES, statics.normalize);
  }
});
