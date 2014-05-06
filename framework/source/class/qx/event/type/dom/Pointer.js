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
qx.Bootstrap.define("qx.event.type.dom.Pointer", {
  extend: qx.event.type.dom.Custom,

  statics : {

    MOUSE_PROPERTIES : [
      "bubbles",
      "cancelable",
      "view",
      "detail",
      "screenX",
      "screenY",
      "clientX",
      "clientY",
      "pageX",
      "pageY",
      "ctrlKey",
      "altKey",
      "shiftKey",
      "metaKey",
      "button",
      "which",
      "relatedTarget",
      // IE8 properties:
      "fromElement",
      "toElement"
    ],

    POINTER_PROPERTIES : {
      pointerId: 1,
      width: 0,
      height: 0,
      pressure: 0.5,
      tiltX: 0,
      tiltY: 0,
      pointerType: "",
      isPrimary: false
    },

    BIND_METHODS : ["getPointerType", "getViewportLeft", "getViewportTop",
      "getDocumentLeft", "getDocumentTop", "getScreenLeft", "getScreenTop"],

    /**
     * Returns the device type which the event triggered. This can be one
     * of the following strings: <code>mouse</code>, <code>pen</code>
     * or <code>touch</code>.
     *
     * @return {String} The type of the pointer.
     */
    getPointerType : function() {
      if (typeof this.pointerType == "string") {
        return this.pointerType;
      }

      if (typeof this.pointerType == "number") {
        if (this.pointerType == this.MSPOINTER_TYPE_MOUSE) {
          return "mouse";
        }
        if (this.pointerType == this.MSPOINTER_TYPE_PEN) {
          return "pen";
        }
        if (this.pointerType == this.MSPOINTER_TYPE_TOUCH) {
          return "touch";
        }
      }

      return "";
    },


    /**
     * Get the horizontal coordinate at which the event occurred relative
     * to the viewport.
     *
     * @return {Number} The horizontal mouse position
     */
    getViewportLeft : function() {
      return this.clientX;
    },


    /**
     * Get the vertical coordinate at which the event occurred relative
     * to the viewport.
     *
     * @return {Number} The vertical mouse position
     * @signature function()
     */
    getViewportTop : function() {
      return this.clientY;
    },


    /**
     * Get the horizontal position at which the event occurred relative to the
     * left of the document. This property takes into account any scrolling of
     * the page.
     *
     * @return {Number} The horizontal mouse position in the document.
     */
    getDocumentLeft : function()
    {
      if (this.pageX !== undefined) {
        return this.pageX;
      } else {
        var win = qx.dom.Node.getWindow(this.srcElement);
        return this.clientX + qx.bom.Viewport.getScrollLeft(win);
      }
    },


    /**
     * Get the vertical position at which the event occurred relative to the
     * top of the document. This property takes into account any scrolling of
     * the page.
     *
     * @return {Number} The vertical mouse position in the document.
     */
    getDocumentTop : function()
    {
      if (this.pageY !== undefined) {
        return this.pageY;
      } else {
        var win = qx.dom.Node.getWindow(this.srcElement);
        return this.clientY + qx.bom.Viewport.getScrollTop(win);
      }
    },


    /**
     * Get the horizontal coordinate at which the event occurred relative to
     * the origin of the screen coordinate system.
     *
     * Note: This value is usually not very useful unless you want to
     * position a native popup window at this coordinate.
     *
     * @return {Number} The horizontal mouse position on the screen.
     */
    getScreenLeft : function() {
      return this.screenX;
    },


    /**
     * Get the vertical coordinate at which the event occurred relative to
     * the origin of the screen coordinate system.
     *
     * Note: This value is usually not very useful unless you want to
     * position a native popup window at this coordinate.
     *
     * @return {Number} The vertical mouse position on the screen.
     */
    getScreenTop : function() {
      return this.screenY;
    },


    /**
     * Manipulates the event object, adding methods if they're not
     * already present
     *
     * @param event {Event} Native event object
     */
    normalize : function(event) {
      var bindMethods = qx.event.type.dom.Pointer.BIND_METHODS;
      for (var i=0, l=bindMethods.length; i<l; i++) {
        if (typeof event[bindMethods[i]] != "function") {
          event[bindMethods[i]] = qx.event.type.dom.Pointer[bindMethods[i]].bind(event);
        }
      }
    }

  },

  construct : function(type, domEvent, customProps) {
    return this.base(arguments, type, domEvent, customProps);
  },

  members : {

    _createEvent : function() {
      var evt;
      if (qx.core.Environment.get("event.mouseevent")) {
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

      qx.event.type.dom.Pointer.normalize(domEvent);

      var properties = {};

      // mouse properties
      var mousePropNames = qx.event.type.dom.Pointer.MOUSE_PROPERTIES;
      for (var i = 0; i < mousePropNames.length; i++) {
        var propName = mousePropNames[i];
        if (propName in domEvent) {
          properties[propName] = domEvent[propName];
        }
        if (customProps && customProps[propName] !== undefined) {
          properties[propName] = customProps[propName];
        }
      }

      // pointer properties
      for (var pointerPropName in qx.event.type.dom.Pointer.POINTER_PROPERTIES) {
        properties[pointerPropName] = qx.event.type.dom.Pointer.POINTER_PROPERTIES[pointerPropName];
        if (pointerPropName in domEvent) {
          properties[pointerPropName] = domEvent[pointerPropName];
        }
        if (customProps && customProps[pointerPropName] !== undefined) {
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

      // normalize Windows 8 pointer types
      switch(evt.pointerType) {
        case domEvent.MSPOINTER_TYPE_MOUSE:
          evt.pointerType = "mouse";
          break;
        case domEvent.MSPOINTER_TYPE_PEN:
          evt.pointerType = "pen";
          break;
        case domEvent.MSPOINTER_TYPE_TOUCH:
          evt.pointerType = "touch";
          break;
      }

      if (evt.pointerType == "mouse") {
        evt.isPrimary = true;
      }
    }
  }
});
