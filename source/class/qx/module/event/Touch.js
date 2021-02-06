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
 * Normalization for touch events. For cross-device applications that
 * support both mouse and touchscreen interaction, consider using
 * <a href="#Pointer">Pointer</a> and/or Gesture events (e.g. <a href="Tap"></a>).
 * @require(qx.module.Event)
 *
 * @group (Event_Normalization)
 */
qx.Bootstrap.define("qx.module.event.Touch", {
  statics :
  {
    /**
     * List of event types to be normalized
     */
    TYPES : ["tap", "longtap", "swipe", "dbltap"],


    /**
     * Manipulates the native event object, adding methods if they're not
     * already present
     *
     * @param event {Event} Native event object
     * @param element {Element} DOM element the listener was attached to
     * @param type {String} Event type
     * @return {Event} Normalized event object
     * @internal
     */
    normalize : function(event, element, type)
    {
      if (!event) {
        return event;
      }
      event._type = type;
      return event;
    }
  },

  defer : function(statics) {
    qxWeb.$registerEventNormalization(statics.TYPES, statics.normalize);
  }
});
