qx.Bootstrap.define("qx.module.Event", {
  statics :
  {
    on : function(type, listener, ctx) {
      for (var i=0; i < this.length; i++) {
        var el = this[i];
        // add native listener
        if (qx.bom.Event.supportsEvent(el, type)) {
          var bound = qx.lang.Function.bind(listener, ctx);
          qx.bom.Event.addNativeListener(el, type, bound);
          el.__bound = bound;
        }
        // create an emitter if necessary
        if (!el.__emitter) {
          el.__emitter = new qx.event.Emitter();
        }
        el.__emitter.on(type, listener, ctx);
      };
      return this;
    },


    off : function(type, listener, ctx) {
      for (var j=0; j < this.length; j++) {
        var el = this[j];
        if (el.__emitter) {
          el.__emitter.off(type, listener, ctx);
        }
        // remove the native listener
        if (qx.bom.Event.supportsEvent(el, type)) {
          qx.bom.Event.removeNativeListener(el, type, el.__bound);
          delete el.__bound;
        }
      };
      return this;
    },


    emit : function(type, data) {
      for (var j=0; j < this.length; j++) {
        var el = this[j];
        if (el.__emitter) {
          el.__emitter.emit(type, data);
        }
      };
      return this;
    },


    once : function(type, listener, ctx) {
      var self = this;
      var wrappedListener = function(data) {
        listener.call(this, data);
        self.off(type, wrappedListener, ctx);
      };
      this.on(type, wrappedListener, ctx);
      return this;
    },

    ready : function(callback) {
      // handle case that its already ready
      if (document.readyState === "complete") {
        window.setTimeout(callback, 0);
        return;
      }
      qx.bom.Event.addNativeListener(window, "load", callback);
    }
  },


  defer : function(statics) {
    qx.q.attach({
      "on" : statics.on,
      "off" : statics.off,
      "once" : statics.once,
      "emit" : statics.emit
    });

    qx.q.attachStatic({"ready": statics.ready});
  }
});
