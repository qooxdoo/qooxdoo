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

qx.Bootstrap.define("qx.event.type.native.Pointer", {
  extend: Object,

  statics : {
    PROPERTIES : {
      bubbles : false,
      cancelable : false,
      view : null,
      detail : null,
      screenX : 0,
      screenY : 0,
      clientX : 0,
      clientY : 0,
      ctrlKey : false,
      altKey : false,
      shiftKey : false,
      metaKey : false,
      button : 0,
      relatedTarget : null,

      pointerId: 0,
      width: 0,
      height: 0,
      pressure: 0,
      tiltX: 0,
      tiltY: 0,
      pointerType: '',
      hwTimestamp: 0,
      isPrimary: false
    }
  },

  construct : function(type, domEvent) {
    var evt;
    if (typeof window.MouseEvent == "function") {
      evt = new MouseEvent(type);
    } else if (typeof document.createEvent == "function") {
      evt = document.createEvent("MouseEvents");
      evt.initMouseEvent(type, properties.bubbles, properties.cancelable, properties.view, properties.detail,
        properties.screenX, properties.screenY, properties.clientX, properties.clientY, properties.ctrlKey,
        properties.altKey, properties.shiftKey, properties.metaKey, properties.button, properties.relatedTarget);
    } else if (typeof document.createEventObject == "object") {
      evt = document.createEventObject();
      evt.type = type;
    }

    var properties = qx.lang.Object.clone(qx.event.type.native.Pointer.PROPERTIES);
    var propNames = Object.keys(qx.event.type.native.Pointer.PROPERTIES);
    for (var i=0; i<propNames.length; i++) {
      var propName = propNames[i];
      if (propName in domEvent) {
        properties[propName] = domEvent[propName];
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
    }

    if (domEvent.pressure) {
      properties.pressure = domEvent.pressure;
    } else {
      properties.pressure = buttons ? 0.5 : 0;
    }

    for (var prop in properties) {
      evt[prop] = properties[prop];
    }

    return evt;
  }
});
