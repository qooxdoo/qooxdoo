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
 * Low-level pointer event handler.
 *
 * @require(qx.bom.client.Event)
 */
qx.Bootstrap.define("qx.event.handler.PointerCore", {

  extend : Object,

  /**
   * Create a new instance
   *
   * @param target {Element} element on which to listen for native touch events
   * @param emitter {qx.event.Emitter} Event emitter object
   */
  construct : function(target, emitter)
  {
    this.__target = target;
    this.__emitter = emitter;
    this.__pointerEventNames = [];
    this._initPointerObserver();
  },

  members : {

    __emitter : null,
    __pointerEventNames : null,
    __onPointerEventWrapper : null,

    /**
     * Adds listeners to native pointer events if supported
     */
    _initPointerObserver : function() {
      if (qx.core.Environment.get("event.mspointer")) {
        this.__onPointerEventWrapper = qx.lang.Function.listener(this._onPointerEvent, this);

        var engineVersion = parseInt(qx.core.Environment.get("engine.version"), 10);
        if (engineVersion == 10) {
          // IE 10
          this.__pointerEventNames = ["MSPointerDown", "MSPointerMove", "MSPointerUp", "MSPointerCancel"];
        } else {
          // IE 11+
          this.__pointerEventNames = ["pointerdown", "pointermove", "pointerup", "pointercancel"];
        }
        for (var i = 0; i < this.__pointerEventNames.length; i++) {
          qx.bom.Event.addNativeListener(this.__target, this.__pointerEventNames[i], this.__onPointerEventWrapper);
        }
      }
    },

    /**
     * Handler for native pointer events
     * @param domEvent {Event} Native pointer event
     */
    _onPointerEvent : function(domEvent) {

    },

    /**
     * Removes native pointer event listeners.
     */
    _stopPointerObserver : function() {
      for (var i = 0; i < this.__pointerEventNames.length; i++) {
        qx.bom.Event.removeNativeListener(this.__target, this.__pointerEventNames[i], this.__onPointerEventWrapper);
      }
    },

    /**
     * Fire a touch event with the given parameters
     *
     * @param domEvent {Event} DOM event
     * @param type {String ? null} type of the event
     * @param target {Element ? null} event target
     */
    _fireEvent : function(domEvent, type, target)
    {
      if (!target) {
        target = this._getTarget(domEvent);
      }

      var type = type || domEvent.type;

      if (target && target.nodeType && this.__emitter)
      {
        this.__emitter.emit(type, domEvent);
      }
    },

    /**
     * Dispose this object
     */
    dispose : function() {
      this._stopPointerObserver();
    }
  }
});
