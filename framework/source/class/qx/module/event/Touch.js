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
 * Normalization for touch events
 */
qx.Bootstrap.define("qx.module.event.Touch", {
  statics :
  {
    /**
     * List of event types to be normalized
     * @type Array
     */
    TYPES : ["tap", "swipe"],


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
    q.$registerEventNormalization(statics.TYPES, statics.normalize);
  }
});