qx.Bootstrap.define("qx.module.Event", {
  statics :
  {
    __normalizations : {},
    
    on : function(type, listener, context) {
      for (var i=0; i < this.length; i++) {
        var el = this[i];
        var ctx = context || el;

        // add native listener
        var bound;
        if (qx.bom.Event.supportsEvent(el, type)) {
          bound = function(event) {
            // apply normalizations
            var registry = qx.module.Event.__normalizations;
            // generic
            var normalizations = registry["*"] || [];
            // type specific
            if (registry[type]) {
              normalizations = normalizations.concat(registry[type]);
            }
            
            for (var x=0, y=normalizations.length; x<y; x++) {
              event = normalizations[x](event, el);
            }
            listener.apply(ctx, [event]);
          }
          
          qx.bom.Event.addNativeListener(el, type, bound);
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
    },

    registerNormalization : function(types, normalize)
    {
      if (!qx.lang.Type.isArray(types)) {
        types = [types];
      }
      var registry = qx.module.Event.__normalizations;
      for (var i=0,l=types.length; i<l; i++) {
        var type = types[i];
        if (qx.lang.Type.isFunction(normalize)) {
          if (!registry[type]) {
            registry[type] = [];
          }
          registry[type].push(normalize);
        }
      }
    },

    unregisterNormalization : function(types, normalize)
    {
      if (!qx.lang.Type.isArray(types)) {
        types = [types];
      }
      var registry = qx.module.Event.__normalizations; 
      for (var i=0,l=types.length; i<l; i++) {
        var type = types[i];
        if (registry[type]) {
          qx.lang.Array.remove(registry[type], normalize);
        }
      }
    },

    getRegistry : function()
    {
      return qx.module.Event.__normalizations;
    }
  },


  defer : function(statics) {
    q.attach({
      "on" : statics.on,
      "off" : statics.off,
      "once" : statics.once,
      "emit" : statics.emit
    });

    q.attachStatic({
      "ready": statics.ready,
      "registerEventNormalization" : statics.registerNormalization,
      "unregisterEventNormalization" : statics.unregisterNormalization,
      "getEventNormalizationRegistry" : statics.getRegistry
    });
  }
});
