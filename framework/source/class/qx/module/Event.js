qx.Bootstrap.define("qx.module.Event", {
  statics :
  {
    __normalizations : {},

    on : function(type, listener, context) {
      for (var i=0; i < this.length; i++) {
        var el = this[i];
        var ctx = context || q.wrap(el);

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
          bound.original = listener;
          qx.bom.Event.addNativeListener(el, type, bound);
        }
        // create an emitter if necessary
        if (!el.__emitter) {
          el.__emitter = new qx.event.Emitter();
        }
        var id = el.__emitter.on(type, bound || listener, ctx);
        if (typeof id == "number" && bound) {
          if (!el.__bound) {
            el.__bound = {};
          }
          el.__bound[id] = bound;
        }
      };
      return this;
    },


    off : function(type, listener, ctx) {
      for (var j=0; j < this.length; j++) {
        var el = this[j];
        if (!el.__bound) {
          el.__emitter.off(type, listener, ctx);
        }
        else {
          for (var id in el.__bound) {
            if (el.__bound[id].original == listener) {
              el.__emitter.off(type, el.__bound[id], ctx);
              // remove the native listener
              qx.bom.Event.removeNativeListener(el, type, el.__bound[id]);
              delete el.__bound[id];
            }
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


    copyEventsTo : function(target) {
      var source = this;

      // get all children of source and target
      for (var i = source.length - 1; i >= 0; i--) {
        var descendants = source[i].getElementsByTagName("*");
        for (var j=0; j < descendants.length; j++) {
          source.push(descendants[j]);
        };
      }
      for (var i = target.length -1; i >= 0; i--) {
        var descendants = target[i].getElementsByTagName("*");
        for (var j=0; j < descendants.length; j++) {
          target.push(descendants[j]);
        };
      }


      for (var i=0; i < source.length; i++) {
        var el = source[i];
        if (!el.__emitter) {
          continue;
        }
        var storage = el.__emitter.getListeners();
        for (var name in storage) {
          for (var j=0; j < storage[name].length; j++) {
            var listener = storage[name][j].listener;
            if (listener.original) {
              listener = listener.original;
            }
            q.wrap(target[i]).on(name, listener, storage[name][j].ctx);
          };
        }
      };
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
      "emit" : statics.emit,
      "copyEventsTo" : statics.copyEventsTo
    });

    q.attachStatic({
      "ready": statics.ready,
      "registerEventNormalization" : statics.registerNormalization,
      "unregisterEventNormalization" : statics.unregisterNormalization,
      "getEventNormalizationRegistry" : statics.getRegistry
    });
  }
});
