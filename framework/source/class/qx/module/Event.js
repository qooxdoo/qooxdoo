qx.Bootstrap.define("qx.module.Event", {
  statics :
  {
    on : function(type, listener, ctx) {
      for (var i=0; i < this.length; i++) {
        var el = this[i]
        if (qx.bom.Event.supportsEvent(el, type)) {
          var bound = qx.lang.Function.bind(listener, ctx);
          qx.bom.Event.addNativeListener(el, type, bound);
        }
        if (!el.__listeners) {
          el.__listeners = {};
        }
        if (!el.__listeners[type]) {
          el.__listeners[type] = [];
        }
        el.__listeners[type].push({listener: listener, ctx: ctx, bound: bound});
      };
      return this;
    },


    off : function(type, listener, ctx) {
      for (var j=0; j < this.length; j++) {
        var el = this[j];
        if (el.__listeners == undefined || el.__listeners[type] == undefined) {
          continue;
        }
        for (var i = el.__listeners[type].length -1; i >= 0; i--) {
          var entry = el.__listeners[type][i];
          if (entry.listener === listener && entry.ctx === ctx) {
            el.__listeners[type].splice(i, 1);
            if (qx.bom.Event.supportsEvent(el, type)) {
              qx.bom.Event.removeNativeListener(el, type, entry.bound);
            }
          }
        };
      };
      return this;
    },


    emit : function(type, data) {
      for (var j=0; j < this.length; j++) {
        var el = this[j];
        if (el.__listeners == undefined || el.__listeners[type] == undefined) {
          continue;
        }
        var listeners = el.__listeners[type];
        for (var i=0; i < listeners.length; i++) {
          var entry = listeners[i];
          entry.listener.call(entry.ctx, data);
        };
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
    }
  },


  defer : function(statics) {
    qx.q.attach({
      "on" : statics.on,
      "off" : statics.off,
      "once" : statics.once,
      "emit" : statics.emit
    });
  }
});
