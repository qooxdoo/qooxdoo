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
 * Normalization for the track gesture. This gesture is based on <a href="#Pointer">Pointer events</a>,
 * meaning that it's available on all devices, no matter which input device type is used (e.g. mouse or
 * touchscreen).
 *
 * @require(qx.module.Event)
 *
 * @group (Event_Normalization)
 */
qx.Bootstrap.define("qx.module.event.Track", {
  statics :
  {
    /**
     * List of event types to be normalized
     */
    TYPES : ["track"],


    BIND_METHODS : [ "getDelta" ],


    /**
     * Returns a map with the calculated delta coordinates and axis,
     * relative to the position on <code>trackstart</code> event.
     *
     * @return {Map} a map with contains the delta as <code>x</code> and
     * <code>y</code> and the movement axis as <code>axis</code>.
     */
    getDelta : function() {
      return this._original.delta;
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
      var bindMethods = qx.module.event.Track.BIND_METHODS;
      for (var i=0, l=bindMethods.length; i<l; i++) {
        if (typeof event[bindMethods[i]] != "function") {
          event[bindMethods[i]] = qx.module.event.Track[bindMethods[i]].bind(event);
        }
      }

      return event;
    }
  },

  defer : function(statics) {
    qxWeb.$registerEventNormalization(qx.module.event.Track.TYPES, statics.normalize);
  }
});
