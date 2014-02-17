/**
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
    this._initPointerObserver();
    this.__pointerEventNames = [];
  },

  members : {

    __emitter : null,
    __pointerEventNames : null,
    __onPointerEventWrapper : null,

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
      }

      for (var i = 0; i < this.__pointerEventNames.length; i++) {
        qx.bom.Event.addNativeListener(this.__target, this.__pointerEventNames[i], this.__onPointerEventWrapper);
      }
    },

    _onPointerEvent : function(domEvent) {
      this._fireEvent(domEvent, domEvent.type, qx.bom.Event.getTarget(domEvent));
    },

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
