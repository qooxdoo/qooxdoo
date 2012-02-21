qx.Bootstrap.define("qx.module.Event", {
  statics :
  {
    on : function(type, listener, ctx) {
      for (var i=0; i < this.length; i++) {
        var el = this[i];
        // add native listener
        var bound;
        if (qx.bom.Event.supportsEvent(el, type)) {
          bound = qx.lang.Function.bind(listener, ctx);
        }
        // create an emitter if necessary
        if (!el.__emitter) {
          el.__emitter = new qx.event.Emitter();
        }
        var id = el.__emitter.on(type, listener, ctx);
        if (id && bound) {
          el.__bound ? el.__bound[id] = listener : el.__bound = {
            id : bound
          };
        }
      };
      return this;
    },


    off : function(type, listener, ctx) {
      for (var j=0; j < this.length; j++) {
        var el = this[j];
        var id;
        if (el.__emitter) {
          id = el.__emitter.off(type, listener, ctx);
        }
        // remove the native listener
        if (qx.bom.Event.supportsEvent(el, type)) {
          qx.bom.Event.removeNativeListener(el, type, el.__bound);
          if (id) {
            delete el.__bound[id];
          }
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
    q.attach({
      "on" : statics.on,
      "off" : statics.off,
      "once" : statics.once,
      "emit" : statics.emit
    });

    q.attachStatic({"ready": statics.ready});
  }
});
