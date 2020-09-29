/* ************************************************************************

   qooxdoo - the new era of web development

   http://qooxdoo.org

   Copyright:
     2012 1&1 Internet AG, Germany, http://www.1und1.de

   License:
     MIT: https://opensource.org/licenses/MIT
     See the LICENSE file in the project's top-level directory for details.

   Authors:
     * Martin Wittemann (wittemann)

************************************************************************ */

/**
 * The Core module's responsibility is to query the DOM for elements and offer
 * these elements as a collection. The Core module itself does not offer any methods to
 * work with the collection. These methods are added by the other included modules,
 * such as Manipulating or Attributes.
 *
 * Core also provides the plugin API which allows modules to attach either
 * static functions to the global <code>q</code> object or define methods on the
 * collection it returns.
 *
 * By default, the core module is assigned to a global module named <code>q</code>.
 * In case <code>q</code> is already defined, the name <code>qxWeb</code>
 * is used instead.
 *
 * For further details, take a look at the documentation in the
 * <a href='http://qooxdoo.org/5.0.2/pages/website.html' target='_blank'>user manual</a>.
 *
 * @ignore(q)
 *
 * @group (Core)
 */
qx.Bootstrap.define("qxWeb", {
  extend : qx.type.BaseArray,
  statics : {
    // internal storage for all initializers
    __init : [],

    // internal reference to the used qx namespace
    $$qx : qx,

    /**
     * Internal helper to initialize collections.
     *
     * @param arg {var} An array of Elements which will
     *   be initialized as {@link q}. All items in the array which are not
     *   either a window object, a DOM element node or a DOM document node will
     *   be ignored.
     * @param clazz {Class} The class of the new collection.
     * @return {q} A new initialized collection.
     */
    $init : function(arg, clazz) {
      // restore widget instance
      if (arg.length && arg.length == 1 && arg[0] && arg[0].$widget instanceof qxWeb) {
        return arg[0].$widget;
      }

      var clean = [];
      for (var i = 0; i < arg.length; i++) {
        // check for node or window object
        var isNode = !!(arg[i] && (arg[i].nodeType === 1 ||
          arg[i].nodeType === 9 || arg[i].nodeType === 11));
        if (isNode) {
          clean.push(arg[i]);
          continue;
        }
        var isWindow = !!(arg[i] && arg[i].history && arg[i].location && arg[i].document);
        if (isWindow) {
          clean.push(arg[i]);
        }
      }

      if (arg[0] && arg[0].getAttribute && arg[0].getAttribute("data-qx-class") && clean.length < 2) {
        clazz = qx.Bootstrap.getByName(arg[0].getAttribute("data-qx-class")) || clazz;
      }

      var col = qx.lang.Array.cast(clean, clazz);
      for (var i=0; i < qxWeb.__init.length; i++) {
        qxWeb.__init[i].call(col);
      }

      return col;
    },


    /**
     * This is an API for module development and can be used to attach new methods
     * to {@link q}.
     *
     * @param module {Map} A map containing the methods to attach.
     * @param override {Boolean?false} Force to override
     */
    $attach : function(module, override) {
      for (var name in module) {
        if (qxWeb.prototype[name] != undefined && Array.prototype[name] == undefined && override !== true) {
          if (qx.core.Environment.get("qx.debug")) {
            throw new Error("Method '" + name + "' already available.");
          }
        } else {
          qxWeb.prototype[name] = module[name];
        }
      }
    },


    /**
     * This is an API for module development and can be used to attach new methods
     * to {@link q}.
     *
     * @param module {Map} A map containing the methods to attach.
     * @param override {Boolean?false} Force to override
     */
    $attachStatic : function(module, override) {
      for (var name in module) {
        if (qx.core.Environment.get("qx.debug")) {
          if (qxWeb[name] != undefined && override !== true) {
            throw new Error("Method '" + name + "' already available as static method.");
          }
        }
        qxWeb[name] = module[name];
      }
    },

    /**
     * This is an API for module development and can be used to attach new methods
     * to {@link q} during runtime according to the following conventions:
     *
     * Public members of the module are attached to the collection similar to
     * <code>qxWeb.$attach</code>. Members beginning with '$' or '_' are ignored.
     *
     * Statics of the module are attached to {@link q} similar to
     * <code>qxWeb.$attachStatic</code>. Statics beginning with '$' or '_', as well as constants
     * (all upper case) and some qooxdoo-internal statics of the module are ignored.
     *
     *
     * If more fine-grained control outside if these conventions is needed,
     * simply use <code>qxWeb.$attach</code> or <code>qxWeb$attachStatic</code>.
     *
     * @param clazz {Object} the qooxdoo class definition calling this method.
     * @param staticsNamespace {String?undefined} Specifies the namespace under which statics are attached to {@link q}.
     */
    $attachAll : function(clazz, staticsNamespace) {
      // members
      for (var name in clazz.members) {
        if (name.indexOf("$") !== 0 && name.indexOf("_") !== 0)
        qxWeb.prototype[name] = clazz.members[name];
      }

      // statics
      var destination;
      if (staticsNamespace != null) {
        qxWeb[staticsNamespace] = qxWeb[staticsNamespace] || {};
        destination = qxWeb[staticsNamespace];
      } else {
        destination = qxWeb;
      }

      for (var name in clazz.statics) {
        if (name.indexOf("$") !== 0 && name.indexOf("_") !== 0 && name !== "name" && name !== "basename" &&
            name !== "classname" && name !== "toString" && name !== name.toUpperCase())
        destination[name] = clazz.statics[name];
      }
    },


    /**
     * This is an API for module development and can be used to attach new initialization
     * methods to {@link q} which will be called when a new collection is
     * created.
     *
     * @param init {Function} The initialization method for a module.
     */
    $attachInit : function(init) {
      this.__init.push(init);
    },


    /**
     * Define a new class using the qooxdoo class system.
     *
     * @param name {String?} Name of the class. If null, the class will not be
     *   attached to a namespace.
     * @param config {Map ? null} Class definition structure. The configuration map has the following keys:
     *     <table>
     *       <thead>
     *         <tr><th>Name</th><th>Type</th><th>Description</th></tr>
     *       </thead>
     *       <tr><td>extend</td><td>Class</td><td>The super class the current class inherits from.</td></tr>
     *       <tr><td>construct</td><td>Function</td><td>The constructor of the class.</td></tr>
     *       <tr><td>statics</td><td>Map</td><td>Map of static values / functions of the class.</td></tr>
     *       <tr><td>members</td><td>Map</td><td>Map of instance members of the class.</td></tr>
     *       <tr><td>defer</td><td>Function</td><td>Function that is called at the end of
     *          processing the class declaration.</td></tr>
     *     </table>
     *
     * <strong>Important hint:</strong> Please do not initialize reference types
     * (<code>Object</code> or <code>Array</code>) directly inside the <strong>members</strong> section.
     * Only list and initialize it with <code>null</code>. Initialize your reference type inside the
     * <code>construct</code>. Check out one of the samples below to get the idea.
     * @return {Function} The defined class.
     */
    define : function(name, config) {
      if (config == undefined) {
        config = name;
        name = null;
      }
      return qx.Bootstrap.define.call(qx.Bootstrap, name, config);
    }
  },


  /**
   * Primary usage:
   * Accepts a selector string and returns a collection of found items. The optional context
   * element can be used to reduce the amount of found elements to children of the
   * context element. If the context object is a collection, its first item is used.
   *
   * Secondary usage:
   * Creates a collection from an existing DOM element, document node or window object
   * (or an Array containing any such objects)
   *
   * <a href="http://sizzlejs.com/" target="_blank">Sizzle</a> is used as selector engine.
   * Check out the <a href="https://github.com/jquery/sizzle/wiki/Sizzle-Home" target="_blank">documentation</a>
   * for more details.
   *
   * @param selector {String|Element|Document|Window|Array} Valid selector (CSS3 + extensions),
   *   window object, DOM element/document or Array of DOM Elements.
   * @param context {Element|q} Only the children of this element are considered.
   * @return {q} A collection of DOM elements.
   */
  construct : function(selector, context) {
    if (!selector && this instanceof qxWeb) {
      return this;
    }

    if (!selector) {
      selector = [];
    }
    else if (qx.Bootstrap.isString(selector)) {
      if (context instanceof qxWeb && context.length != 0) {
        context = context[0];
      }
      if (context instanceof qxWeb) {
        selector = [];
      } else {
        selector = qx.bom.Selector.query(selector, context);
      }
    }
    else if ((selector.nodeType === 1 || selector.nodeType === 9 ||
      selector.nodeType === 11) ||
      (selector.history && selector.location && selector.document))
    {
      selector = [selector];
    }
    return qxWeb.$init(selector, qxWeb);
  },


  members : {
    /**
     * Gets a new collection containing only those elements that passed the
     * given filter. This can be either a selector expression or a filter
     * function.
     *
     * @param selector {String|Function} Selector expression or filter function
     * @return {q} New collection containing the elements that passed the filter
     */
    filter : function(selector) {
      if (qx.lang.Type.isFunction(selector)) {
        return qxWeb.$init(Array.prototype.filter.call(this, selector), this.constructor);
      }
      return qxWeb.$init(qx.bom.Selector.matches(selector, this), this.constructor);
    },


    /**
     * Recreates a collection which is free of all duplicate elements from the original.
     *
     * @return {q} Returns a copy with no duplicates
     */
    unique : function() {
      var unique = qx.lang.Array.unique(this);
      return qxWeb.$init(unique, this.constructor);
    },


    /**
     * Returns a copy of the collection within the given range.
     *
     * @param begin {Number} The index to begin.
     * @param end {Number?} The index to end.
     * @return {q} A new collection containing a slice of the original collection.
     */
    slice : function(begin, end) {
      // Old IEs return an empty array if the second argument is undefined
      // check 'end' explicit for "undefined" [BUG #7322]
      if (end !== undefined) {
        return qxWeb.$init(Array.prototype.slice.call(this, begin, end), this.constructor);
      }
      return qxWeb.$init(Array.prototype.slice.call(this, begin), this.constructor);
    },


    /**
     * Removes the given number of items and returns the removed items as a new collection.
     * This method can also add items. Take a look at the
     * <a href='https://developer.mozilla.org/en-US/docs/JavaScript/Reference/Global_Objects/Array/splice' target='_blank'>documentation of MDN</a> for more details.
     *
     * @param index {Number} The index to begin.
     * @param howMany {Number} the amount of items to remove.
     * @param varargs {var} As many items as you want to add.
     * @return {q} A new collection containing the removed items.
     */
    splice : function(index , howMany, varargs) {
      return qxWeb.$init(Array.prototype.splice.apply(this, arguments), this.constructor);
    },


    /**
     * Returns a new collection containing the modified elements. For more details, check out the
     * <a href='https://developer.mozilla.org/en-US/docs/JavaScript/Reference/Global_Objects/Array/map' target='_blank'>MDN documentation</a>.
     *
     * @param callback {Function} Function which produces the new element.
     * @param thisarg {var} Context of the callback.
     * @return {q} New collection containing the elements that passed the filter
     */
    map : function(callback, thisarg) {
      return qxWeb.$init(Array.prototype.map.apply(this, arguments), qxWeb);
    },


    /**
     * Returns a copy of the collection including the given elements.
     *
     * @param varargs {var} As many items as you want to add.
     * @return {q} A new collection containing all items.
     */
    concat : function(varargs) {
      var clone = Array.prototype.slice.call(this, 0);
      for (var i=0; i < arguments.length; i++) {
        if (arguments[i] instanceof qxWeb) {
          clone = clone.concat(Array.prototype.slice.call(arguments[i], 0));
        } else {
          clone.push(arguments[i]);
        }
      }
      return qxWeb.$init(clone, this.constructor);
    },


    /**
     * Returns the index of the given element within the current
     * collection or -1 if the element is not in the collection
     * @param elem {Element|Element[]|qxWeb} Element or collection of elements
     * @param fromIndex {Integer} The index to start the search at
     * @return {Number} The element's index
     */
    indexOf : function(elem, fromIndex) {
      if (!elem) {
        return -1;
      }

      if (!fromIndex) {
        fromIndex = 0;
      }

      if (typeof fromIndex !== "number") {
        return -1;
      }

      if (fromIndex < 0) {
        fromIndex = this.length + fromIndex;
        if (fromIndex < 0) {
          fromIndex = 0;
        }
      }

      if (qx.lang.Type.isArray(elem)) {
        elem = elem[0];
      }

      for (var i = fromIndex, l = this.length; i<l; i++) {
        if (this[i] === elem) {
          return i;
        }
      }

      return -1;
    },


    /**
     * Calls the browser's native debugger to easily allow debugging within
     * chained calls.
     *
     * Unlike the <a href="#.logThis">logThis</a> method this implementation blocks the further processing.
     *
     * @return {q} The collection for chaining
     * @ignore(debugger)
     */
    debug : function() {
      if (qx.core.Environment.get("qx.debug")) {
        debugger;
      }
      return this;
    },


    /**
     * Logs information about the current collection, its DOM elements and the
     * length. Very useful during development to easily check the current state of
     * your collection and avoid common pitfalls like an empty collection.
     *
     * Unlike the <a href="#.debug">debug</a> method this implementation works non-blocking.
     *
     * @return {q} The collection for chaining
     *
     */
    logThis : function() {
      if (qx.core.Environment.get("qx.debug")) {

        // loop over the collection elements to make sure we get the current content
        // of the collection and not the reference values later (they might change depending on
        // manipulation of the collection)
        var elements = [];
        this.forEach(function(item) {
          elements.push(item);
        });

        var length = this.length;

        console.group("*** Collection infos ***");
        console.info("Length:", length);
        console.info("Elements:", elements);
        console.info("Instance:", this);
        console.groupEnd();
      }

      return this;
    },


    /**
     * Calls a function for each DOM element  or document fragment in the
     * collection. This is used for DOM manipulations which can't be
     * applied to document nodes or window objects.
     *
     * @param func {Function} Callback function. Will be called with three arguments:
     * The element, the element's index within the collection and the collection itself.
     * @param ctx {Object} The context for the callback function (default: The collection)
     * @return {q} The collection for chaining
     */
    _forEachElement : function(func, ctx) {
      for (var i=0, l=this.length; i<l; i++) {
        if (this[i] && (this[i].nodeType === 1 || this[i].nodeType === 11)) {
          func.apply(ctx || this, [this[i], i, this]);
        }
      }
      return this;
    },


    /**
     * Calls a function for each DOM element node in the collection. Each node is wrapped
     * in a collection before the function is called.
     *
     * @param func {Function} Callback function. Will be called with three arguments:
     * The element wrappend in a collection, the element's index within the collection and
     * the collection itself.
     * @param ctx {Object} The context for the callback function (default: The collection)
     * @return {q} The collection for chaining
     */
    _forEachElementWrapped : function(func, ctx) {
      this._forEachElement(function(item, idx, arr) {
        func.apply(this, [qxWeb(item), idx, arr]);
      }, ctx);
      return this;
    }
  },

  /**
   * @ignore(q)
   */
  defer : function(statics) {
    if (window.q == undefined) {
      window.q = statics;
    }
  }
});
