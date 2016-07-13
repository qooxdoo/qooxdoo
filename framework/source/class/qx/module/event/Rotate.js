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
 * Normalization for the rotate gesture.
 *
 * @require(qx.module.Event)
 *
 * @group (Event_Normalization)
 */
qx.Bootstrap.define("qx.module.event.Rotate", {
  statics :
  {
    /**
     * List of event types to be normalized
     */
    TYPES : ["rotate"],


    BIND_METHODS : [ "getAngle" ],


    /**
     * Returns a number with the current calculated angle between the primary and secondary active pointers.
     *
     * @return {Number} the angle of the two active pointers.
     */
    getAngle : function() {
      return this._original.angle;
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
    normalize : function(event, element)
    {
      if (!event) {
        return event;
      }
      // apply mouse event normalizations
      var bindMethods = qx.module.event.Rotate.BIND_METHODS;
      for (var i=0, l=bindMethods.length; i<l; i++) {
        if (typeof event[bindMethods[i]] != "function") {
          event[bindMethods[i]] = qx.module.event.Rotate[bindMethods[i]].bind(event);
        }
      }

      return event;
    }
  },

  defer : function(statics) {
    qxWeb.$registerEventNormalization(qx.module.event.Rotate.TYPES, statics.normalize);
  }
});
