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
 * For further details, take a look at the documentation in the
 * <a href='http://manual.qooxdoo.org/${qxversion}/pages/website.html' target='_blank'>user manual</a>.
 */
qx.Bootstrap.define("q", {
  extend : qx.type.BaseArray,
  statics : {
    // internal storage for all initializers
    __init : [],

    // internal reference to the used qx namespace
    $$qx : qx,

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
          if (q[name] != undefined) {
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
     * @param config {Map} Class definition structure.
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
   * Accepts a selector string and returns a set of found items. The optional context
   * element can be used to reduce the amount of found elements to children of the
   * context element.
   *
   * <a href="http://sizzlejs.com/" target="_blank">Sizzle</a> is used as selector engine.
   * Check out the <a href="https://github.com/jquery/sizzle/wiki/Sizzle-Home" target="_blank">documentation</a>
   * for more details.
   *
   * @param selector {String|Element|Array} Valid selector (CSS3 + extensions)
   *   or DOM element or Array of DOM Elements.
   * @param context {Element} Only the children of this element are considered.
   * @return {q} A collection of DOM elements.
   */
  construct : function(selector, context) {
    if (!selector && this != window) {
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