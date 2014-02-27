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
 * Synthetic pointer event
 */
qx.Bootstrap.define("qx.event.type.native.Pointer", {
  extend: qx.event.type.native.Custom,

  statics : {
    PROPERTIES : {
      bubbles : true,
      cancelable : false,
      view : null,
      detail : null,
      screenX : 0,
      screenY : 0,
      clientX : 0,
      clientY : 0,
      pageX : 0,
      pageY : 0,
      ctrlKey : false,
      altKey : false,
      shiftKey : false,
      metaKey : false,
      button : 0,
      which : 0,
      relatedTarget : null,

      pointerId: 1,
      width: 0,
      height: 0,
      pressure: 0.5,
      tiltX: 0,
      tiltY: 0,
      pointerType: '',
      isPrimary: false
    }
  },

  construct : function(type, domEvent, customProps) {
    return this.base(arguments, type, domEvent, customProps);
  },

  members : {

    _createEvent : function() {
      var evt;
        if (typeof window.MouseEvent == "function") {
        evt = new window.MouseEvent(this._type);
      } else if (typeof document.createEvent == "function") {
        evt = document.createEvent("MouseEvents");
      } else if (typeof document.createEventObject == "object") {
        evt = document.createEventObject();
        evt.type = this._type;
      }
      return evt;
    },


    _initEvent : function(domEvent, customProps) {
      var evt = this._event;
      var properties = qx.lang.Object.clone(qx.event.type.native.Pointer.PROPERTIES);
      var propNames = Object.keys(qx.event.type.native.Pointer.PROPERTIES);
      for (var i = 0; i < propNames.length; i++) {
        var propName = propNames[i];
        if (propName in domEvent) {
          properties[propName] = domEvent[propName];
        }
        if (customProps && customProps[propName]) {
          properties[propName] = customProps[propName];
        }
      }

      var buttons;
      switch (domEvent.which) {
        case 1:
          buttons = 1;
          break;
        case 2:
          buttons = 4;
          break;
        case 3:
          buttons = 2;
          break;
        default:
          buttons = 0;
      }

      if (domEvent.pressure) {
        properties.pressure = domEvent.pressure;
      }

      if (buttons) {
        properties.buttons = buttons;
        properties.pressure = buttons ? 0.5 : 0;
      }

      evt.initMouseEvent && evt.initMouseEvent(this._type, properties.bubbles, properties.cancelable, properties.view, properties.detail,
          properties.screenX, properties.screenY, properties.clientX, properties.clientY, properties.ctrlKey,
          properties.altKey, properties.shiftKey, properties.metaKey, properties.button, properties.relatedTarget);

      for (var prop in properties) {
        evt[prop] = properties[prop];
      }
    }
  }
});
