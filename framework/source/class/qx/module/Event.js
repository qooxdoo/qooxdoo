/* ************************************************************************

   qooxdoo - the new era of web development

   http://qooxdoo.org

   Copyright:
     2011-2012 1&1 Internet AG, Germany, http://www.1und1.de

   License:
     LGPL: http://www.gnu.org/licenses/lgpl.html
     EPL: http://www.eclipse.org/org/documents/epl-v10.php
     See the LICENSE file in the project's top-level directory for details.

   Authors:
     * Martin Wittemann (wittemann)
     * Daniel Wagner (danielwagner)

************************************************************************ */

/**
 * Event module
 */
qx.Bootstrap.define("qx.module.Event", {
  statics :
  {
    /**
     * Event normalization registry
     *
     * @type Map
     * @internal
     */
    __normalizations : {},

    /**
     * Register a listener for the given event type on each item in the
     * collection. This can be either native or custom events.
     *
     * @attach {qx.Collection}
     * @param type {String} Type of the event to listen for
     * @param listener {Function} Listener callback
     * @param context {Object?} Context the callback function will be executed in.
     * Default: The element on which the listener was registered
     * @return {qx.Collection} The collection for chaining
     */
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
            listener.apply(this, [event]);
          }.bind(ctx);
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
          if (!el.__bound[type]) {
            el.__bound[type] = {};
          }
          el.__bound[type][id] = bound;
        }
        if (!context) {
          // store a reference to the dynamically created context so we know
          // what to check for when removing the listener
          if (!el.__ctx) {
            el.__ctx = {};
          }
          el.__ctx[id] = ctx;
        }
      };
      return this;
    },


    /**
     * Unregister event listeners for the given type from each element in the
     * collection.
     *
     * @attach {qx.Collection}
     * @param type {String} Type of the event
     * @param listener {Function} Listener callback
     * @param context {Object?} Listener callback context
     * @return {qx.Collection} The collection for chaining
     */
    off : function(type, listener, context) {
      for (var j=0; j < this.length; j++) {
        var el = this[j];
        if (!el.__bound || !type in el.__bound) {
          el.__emitter.off(type, listener, context);
        }
        else {
          for (var id in el.__bound[type]) {
            if (el.__bound[type][id].original == listener) {
              var storedContext = typeof el.__ctx !== "undefined" && el.__ctx[id];
              if (!context && storedContext) {
                context = el.__ctx[id];
              } 

              el.__emitter.off(type, el.__bound[type][id], context);
              // remove the native listener
              qx.bom.Event.removeNativeListener(el, type, el.__bound[type][id]);
              delete el.__bound[type][id];

              if (storedContext) {
                delete el.__ctx[id];
              }
            }
          }
        }
      };
      return this;
    },


    /**
     * Fire an event of the given type.
     *
     * @attach {qx.Collection}
     * @param type {String} Event type
     * @param data {?var} Optional data that will be passed to the listener
     * callback function.
     * @return {qx.Collection} The collection for chaining
     */
    emit : function(type, data) {
      for (var j=0; j < this.length; j++) {
        var el = this[j];
        if (el.__emitter) {
          el.__emitter.emit(type, data);
        }
      };
      return this;
    },


    /**
     * Attach a listener for the given event that will be executed only once.
     *
     * @attach {qx.Collection}
     * @param type {String} Type of the event to listen for
     * @param listener {Function} Listener callback
     * @param context {Object?} Context the callback function will be executed in.
     * Default: The element on which the listener was registered
     * @return {qx.Collection} The collection for chaining
     */
    once : function(type, listener, context) {
      var self = this;
      var wrappedListener = function(data) {
        listener.call(this, data);
        self.off(type, wrappedListener, context);
      };
      this.on(type, wrappedListener, context);
      return this;
    },


    /**
     * Checks if one or more listeners for the given event type are attached to
     * the first element in the collection
     *
     * @attach {qx.Collection}
     * @param type {String} Event type, e.g. <code>mousedown</code>
     * @return {Boolean} <code>true</code> if one or more listeners are attached
     */
    hasListener : function(type) {
      if (!this[0] || !this[0].__emitter || 
        !this[0].__emitter.getListeners()[type]) 
      {
        return false;
      }

      return this[0].__emitter.getListeners()[type].length > 0;
    },


    /**
     * Copies any event listeners that are attached to the elements in the
     * collection to the provided target element
     *
     * @internal
     * @param target {Element} Element to attach the copied listeners to
     */
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


    /**
     * Executes the given function once the document is ready.
     *
     * @attachStatic {q}
     * @param callback {Function} callback function
     */
    ready : function(callback) {
      // DOM is already ready
      if (document.readyState === "complete") {
        window.setTimeout(callback, 1);
        return;
      }
      
      // listen for the load event so the callback is executed no matter what
      q.wrap(window).on("load", callback);
      
      var wrappedCallback = function() {
        q.wrap(window).off("load", callback);
        callback();
      };
      
      // Listen for DOMContentLoaded event if available (no way to reliably detect
      // support)
      if (q.env.get("engine.name") !== "mshtml" || q.env.get("browser.documentmode") > 8) {
        qx.bom.Event.addNativeListener(document, "DOMContentLoaded", wrappedCallback);
      }
      else {
        var self = this;

        // Continually check to see if the document is ready
        var timer = function() {
          try {
            // If DOMContentLoaded is unavailable, use the trick by Diego Perini
            // http://javascript.nwbox.com/IEContentLoaded/
            document.documentElement.doScroll("left");
            if (document.body) {
              wrappedCallback();
            }
          }
          catch(error) {
            window.setTimeout(timer, 100);
          }
        };

        timer();
      }
    },


    /**
     * Register a normalization function for the given event types. Listener
     * callbacks for these types will be called with the return value of the
     * normalization function instead of the regular event object.
     *
     * The normalizer will be called with two arguments: The original event
     * object and the element on which the event was triggered
     *
     * @attachStatic {q, q.registerEventNormalization}
     * @param types {String[]} List of event types to be normalized. Use an
     * asterisk (<code>*</code>) to normalize all event types
     * @param normalizer {Function} Normalizer function
     */
    registerNormalization : function(types, normalizer)
    {
      if (!qx.lang.Type.isArray(types)) {
        types = [types];
      }
      var registry = qx.module.Event.__normalizations;
      for (var i=0,l=types.length; i<l; i++) {
        var type = types[i];
        if (qx.lang.Type.isFunction(normalizer)) {
          if (!registry[type]) {
            registry[type] = [];
          }
          registry[type].push(normalizer);
        }
      }
    },


    /**
     * Unregister a normalization function from the given event types.
     *
     * @attachStatic {q, q.unregisterEventNormalization}
     * @param types {String[]} List of event types
     * @param normalizer {Function} Normalizer function
     */
    unregisterNormalization : function(types, normalizer)
    {
      if (!qx.lang.Type.isArray(types)) {
        types = [types];
      }
      var registry = qx.module.Event.__normalizations;
      for (var i=0,l=types.length; i<l; i++) {
        var type = types[i];
        if (registry[type]) {
          qx.lang.Array.remove(registry[type], normalizer);
        }
      }
    },


    /**
     * Returns all registered event normalizers
     *
     * @attachStatic {q, q.getEventNormalizationRegistry}
     * @return {Map} Map of event types/normalizer functions
     */
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
      "hasListener" : statics.hasListener,
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
