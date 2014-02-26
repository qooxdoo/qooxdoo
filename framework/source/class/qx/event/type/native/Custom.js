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
     * Christopher Zuendorf (czuendorf)
     * Daniel Wagner (danielwagner)

************************************************************************ */

/**
 * Cross-browser custom UI event
 */
qx.Bootstrap.define("qx.event.type.native.Custom", {

  extend : Object,

  statics : {
    PROPERTIES : {
      bubbles : true,
      cancelable : true
    }
  },

  /**
   * @param type {String} event type
   * @param domEvent {Event} Native event that will be used as a template for the new event
   * @param customProps {Map} Map of event properties (will override the domEvent's values)
   * @return {Event} event object
   */
  construct : function(type, domEvent, customProps) {
    this._type = type;
    this._event = this._createEvent();
    this._initEvent(domEvent, customProps);
    return this._event;
  },

  members : {
    _type : null,
    _event : null,


    /**
     * Creates a custom event object
     * @return {Event} event object
     */
    _createEvent : function() {
      var evt;
        if (typeof window.CustomEvent == "function") {
        evt = new window.CustomEvent(this._type);
      } else if (typeof document.createEvent == "function") {
        evt = document.createEvent("UIEvents");
      } else if (typeof document.createEventObject == "object") {
        evt = document.createEventObject();
        evt.type = this._type;
      }
      return evt;
    },

    /**
     * Initializes a custom event
     *
     * @param domEvent {Event} Native event that will be used as a template for the new event
     * @param customProps {Map} Map of event properties (will override the domEvent's values)
     */
    _initEvent : function(domEvent, customProps) {
      var properties = qx.event.type.native.Custom.PROPERTIES;
      if (this._event.initEvent) {
        this._event.initEvent(this._type, properties.bubbles, properties.cancelable);
      }
    }
  }
});
