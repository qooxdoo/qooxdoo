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

    MOUSE_PROPERTIES : {
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
      //IE properties:
      fromElement : null,
      toElement : null
    },

    POINTER_PROPERTIES : {
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
        /* In IE9, the pageX property of synthetic MouseEvents is always 0
         and cannot be overriden, so we create a plain UIEvent and add
         the mouse event properties ourselves. */
        evt = document.createEvent("UIEvents");
      } else if (typeof document.createEventObject == "object") {
        // IE8 doesn't support custom event types
        evt = {};
        evt.type = this._type;
      }
      return evt;
    },


    _initEvent : function(domEvent, customProps) {
      var evt = this._event;

      var properties = {};

      // mouse properties
      var mousePropNames = Object.keys(qx.event.type.native.Pointer.MOUSE_PROPERTIES);
      for (var i = 0; i < mousePropNames.length; i++) {
        var propName = mousePropNames[i];
        if (propName in domEvent) {
          properties[propName] = domEvent[propName];
        }
        if (customProps && customProps[propName]) {
          properties[propName] = customProps[propName];
        }
      }

      // pointer properties
      for (var pointerPropName in qx.event.type.native.Pointer.POINTER_PROPERTIES) {
        properties[pointerPropName] = qx.event.type.native.Pointer.POINTER_PROPERTIES[pointerPropName];
        if (pointerPropName in domEvent) {
          properties[pointerPropName] = domEvent[pointerPropName];
        }
        if (customProps && customProps[pointerPropName]) {
          properties[pointerPropName] = customProps[pointerPropName];
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

      if (buttons) {
        properties.buttons = buttons;
        properties.pressure = buttons ? 0.5 : 0;
      }

      if (domEvent.pressure) {
        properties.pressure = domEvent.pressure;
      }

      if (evt.initMouseEvent) {
        evt.initMouseEvent(this._type, properties.bubbles, properties.cancelable, properties.view, properties.detail,
          properties.screenX, properties.screenY, properties.clientX, properties.clientY, properties.ctrlKey,
          properties.altKey, properties.shiftKey, properties.metaKey, properties.button, properties.relatedTarget);
      }
      else if (evt.initUIEvent) {
        evt.initUIEvent(this._type,
          properties.bubbles, properties.cancelable, properties.view, properties.detail);
      }

      for (var prop in properties) {
        evt[prop] = properties[prop];
      }
    }
  }
});
