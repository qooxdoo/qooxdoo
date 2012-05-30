/* ************************************************************************

   qooxdoo - the new era of web development

   http://qooxdoo.org

   Copyright:
     2012 1&1 Internet AG, Germany, http://www.1und1.de

   License:
     LGPL: http://www.gnu.org/licenses/lgpl.html
     EPL: http://www.eclipse.org/org/documents/epl-v10.php
     See the LICENSE file in the project's top-level directory for details.

   Authors:
     * Martin Wittemann (wittemann)

************************************************************************ */

qx.Bootstrap.define("q", {
  extend : qx.type.BaseArray,
  statics : {
    // internal storage for all initializers
    __init : [],

    /**
     * Internal helper to initialize collections.
     *
     * @param arg {var} An Element or an array of Elements which will
     *   be initialized as {@link q}.
     * @return {q} A new initialized collection.
     */
    $init : function(arg) {
      var col = qx.lang.Array.cast(arg, q);
      for (var i=0; i < q.__init.length; i++) {
        q.__init[i].call(col);
      };
      return col;
    },


    /**
     * This is an API for module development and can be used to attach new methods
     * to {@link q}.
     *
     * @param module {Map} A map containing the methods to attach.
     */
    $attach : function(module) {
      for (var name in module) {
        if (qx.core.Environment.get("qx.debug")) {
          if (q.prototype[name] != undefined && Array.prototype[name] == undefined) {
            throw new Error("Method '" + name + "' already available.");
          }
        }
        q.prototype[name] = module[name];
      };
    },


    /**
     * This is an API for module development and can be used to attach new methods
     * to {@link q}.
     *
     * @param module {Map} A map containing the methods to attach.
     */
    $attachStatic : function(module) {
      for (var name in module) {
        if (qx.core.Environment.get("qx.debug")) {
          if (q.prototype[name] != undefined) {
            throw new Error("Method '" + name + "' already available as static method.");
          }
        }
        q[name] = module[name];
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
     * @signature function(name, config)
     * @param name {String?} Name of the class. If null, the class will not be
     *   attached to a namespace.
     * @param config {Map ? null} Class definition structure.
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


  construct : function(selector, context) {
    if (!selector) {
      return this;
    }

    if (qx.Bootstrap.isString(selector)) {
      selector = qx.bom.Selector.query(selector, context);
    } else if (!(qx.Bootstrap.isArray(selector))) {
      selector = [selector];
    }
    return q.$init(selector);
  }
});