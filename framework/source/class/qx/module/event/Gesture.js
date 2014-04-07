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
 * Normalization for gesture events
 *
 * @require(qx.module.Event)
 *
 * @group (Event_Normalization)
 */
qx.Bootstrap.define("qx.module.event.Gesture", {
  statics :
  {
    /**
     * List of event types to be normalized
     */
    TYPES : ["tap", "longtap", "dbltap"],

    /**
     * List methods to be attached to gesture event
     * objects
     * @internal
     */
    BIND_METHODS : ["getViewportLeft", "getViewportTop",
      "getDocumentLeft", "getDocumentTop", "getScreenLeft", "getScreenTop"],

    /**
     * Get the horizontal coordinate at which the event occurred relative
     * to the viewport.
     *
     * @return {Number} The horizontal contact position
     */
    getViewportLeft : function() {
      return this._original.getViewportLeft();
    },


    /**
     * Get the vertical coordinate at which the event occurred relative
     * to the viewport.
     *
     * @return {Number} The vertical contact position
     * @signature function()
     */
    getViewportTop : function() {
      return this._original.getViewportTop();
    },


    /**
     * Get the horizontal position at which the event occurred relative to the
     * left of the document. This property takes into account any scrolling of
     * the page.
     *
     * @return {Number} The horizontal contact position in the document.
     */
    getDocumentLeft : function()
    {
      return this._original.getDocumentLeft();
    },


    /**
     * Get the vertical position at which the event occurred relative to the
     * top of the document. This property takes into account any scrolling of
     * the page.
     *
     * @return {Number} The vertical contact position in the document.
     */
    getDocumentTop : function()
    {
      return this._original.getDocumentTop();
    },


    /**
     * Get the horizontal coordinate at which the event occurred relative to
     * the origin of the screen coordinate system.
     *
     * Note: This value is usually not very useful unless you want to
     * position a native popup window at this coordinate.
     *
     * @return {Number} The horizontal contact position on the screen.
     */
    getScreenLeft : function() {
      return this._original.getScreenLeft();
    },


    /**
     * Get the vertical coordinate at which the event occurred relative to
     * the origin of the screen coordinate system.
     *
     * Note: This value is usually not very useful unless you want to
     * position a native popup window at this coordinate.
     *
     * @return {Number} The vertical contact position on the screen.
     */
    getScreenTop : function() {
      return this._original.getScreenTop();
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

      var bindMethods = qx.module.event.Gesture.BIND_METHODS;
      for (var i=0, l=bindMethods.length; i<l; i++) {
        if (typeof event[bindMethods[i]] != "function") {
          event[bindMethods[i]] = qx.module.event.Gesture[bindMethods[i]].bind(event);
        }
      }

      bindMethods = qx.module.event.Pointer.BIND_METHODS;
      for (var i=0, l=bindMethods.length; i<l; i++) {
        if (typeof event[bindMethods[i]] != "function") {
          event[bindMethods[i]] = qx.module.event.Pointer[bindMethods[i]].bind(event);
        }
      }

      return event;
    }
  },

  defer : function(statics) {
    qxWeb.$registerEventNormalization(qx.module.event.Gesture.TYPES, statics.normalize);
  }
});
