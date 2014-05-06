/* ************************************************************************

   qooxdoo - the new era of web development

   http://qooxdoo.org

   Copyright:
     2013 1&1 Internet AG, Germany, http://www.1und1.de

   License:
     LGPL: http://www.gnu.org/licenses/lgpl.html
     EPL: http://www.eclipse.org/org/documents/epl-v10.php
     See the LICENSE file in the project's top-level directory for details.

   Authors:
     * Martin Wittemann (wittemann)
     * Daniel Wagner (danielwagner)

************************************************************************ */

/**
 * This is the base collection for all widgets and offers a good foundation
 * for all widgets including enabled state handling, config and template storage
 * and event handling to name a few key features.
 *
 * @require(qx.module.Dataset)
 * @require(qx.module.util.String)
 * @require(qx.module.event.Native)
 *
 * @group (Widget)
 */
qx.Bootstrap.define("qx.ui.website.Widget", {
  extend : qxWeb,

  statics : {

    /**
     * Factory method for the widget which converts a standard
     * collection into a collection of widgets.
     *
     * @return {qx.ui.website.Widget} A collection of widgets.
     *
     * @attach {qxWeb}
     */
    widget : function() {
      var widgets = new qx.ui.website.Widget(this);
      widgets.init();
      return widgets;
    },


    /**
     * Creates a new collection from the given argument. This can either be an
     * HTML string, a single DOM element or an array of elements
     *
     * @param html {String|Element[]} HTML string or DOM element(s)
     * @return {qxWeb} Collection of elements
     */
    create : function(html) {
      return new qx.ui.website.Widget(qxWeb.create(html));
    },


    /**
     * Special 'on' method for qx.Website widgets that prevents memory
     * leaks and duplicate listeners.
     *
     * During the lifetime of a widget, multiple collection instances can
     * be created for the same DOM element. In the initialization of each
     * of these widget collections, listeners can be attached using this method
     * to prevent memory leaks and duplicate listeners.
     *
     * This is done by storing a reference to the collection the first time a
     * listener is attached. For subsequent listeners, this stored collection
     * is used as the context. If the context object already has the new listener,
     * it is not attached again. This means that new collections don't create
     * references to DOM elements and don't need to be disposed manually.
     *
     * @attach {qxWeb}
     * @param type {String} Type of the event to listen for
     * @param listener {Function} Listener callback
     * @param ctx {Object?} Context the callback function will be executed in.
     * Default: The element on which the listener was registered
     * @param useCapture {Boolean?} Attach the listener to the capturing
     * phase if true.
     * @return {qxWeb} The collection for chaining
     */
    $onFirstCollection : function(type, listener, ctx, useCapture) {
      var propertyName = this.classname.replace(/\./g, "-") + "-context";
      if (!this.getProperty(propertyName)) {
        this.setProperty(propertyName, ctx);
      }
      var originalCtx = this.getProperty(propertyName);

      if (!this.hasListener(type, listener, originalCtx)) {
        this.on(type, listener, originalCtx, useCapture);
      }

      return this;
    },

    /**
     * Removes a listener added with {@link #$onFirstCollection}.
     *
     * @attach {qxWeb}
     * @param type {String} Type of the event to listen for
     * @param listener {Function} Listener callback
     * @param ctx {Object?} Context the callback function will be executed in.
     * Default: The element on which the listener was registered
     * @param useCapture {Boolean?} Attach the listener to the capturing
     * phase if true. Default: false
     * @return {qxWeb} The collection for chaining
     */
    $offFirstCollection : function(type, listener, ctx, useCapture) {
      var propertyName = this.classname.replace(/\./g, "-") + "-context";
      this._forEachElementWrapped(function(item) {
        var originalCtx = item.getProperty(propertyName);
        item.off(type, listener, originalCtx, useCapture);
      });

      return this;
    },

    /**
     * Fetches elements with a data attribute named <code>data-qx-class</code>
     * containing the class name of the desired widget and initializes them as
     * widgets.
     *
     * @param selector {String?} Optional selector expression or filter function to
     * restrict the list of elements
     * @attachStatic {qxWeb}
     */
    initWidgets : function(selector) {
      var elements = qxWeb("*[data-qx-class]");
      if (selector) {
        elements = elements.filter(selector);
      }
      elements._forEachElementWrapped(function(widget) {
        widget.init();
      });
    }
  },


  construct : function(selector, context) {
    var col = this.base(arguments, selector, context);
    Array.prototype.push.apply(this, Array.prototype.slice.call(col, 0, col.length));
  },


  members : {
    __cssPrefix : null,


    /**
     * Responsible for initializing of the widget. This checks for the data attribute
     * named <code>data-qx-class</code> and initializes the widget if necessary.
     * @return {Boolean} <code>true</code> if the widget has been initialized
     */
    init : function() {
      if (this.getProperty("$$qx-widget-initialized")) {
        return false;
      }
      this.setAttribute("data-qx-class", this.classname);
      this.addClass("qx-widget");
      this.addClass(this.getCssPrefix());
      this.setProperty("$$qx-widget-initialized", true);
      return true;
    },


    /**
     * Return the proper CSS prefix for the current widget. This prefix is
     * based on the current classname.
     *
     * @return {String} The CSS prefix for the current object.
     */
    getCssPrefix : function() {
      if (!this.__cssPrefix) {
        var split = this.classname.split(".");
        this.__cssPrefix = "qx-" + split[split.length - 1].toLowerCase();
      }
      return this.__cssPrefix;
    },


    /**
     * Changes the enabled state of the current collection, which means all
     * widgets in the collection. This sets the disabled attribute on the
     * elements and all its children.
     *
     * @param value {Boolean} The enabled value.
     * @return {qx.ui.website.Widget} The collection for chaining
     */
    setEnabled : function(value) {
      this.setAttribute("disabled", !value);
      this.find("*").setAttribute("disabled", !value);
      return this;
    },


    /**
     * Returns weather the first widget in the collection is enabled or not.
     *
     * @return {Boolean} The enabled state of the collection.
     */
    getEnabled : function() {
      return !this.getAttribute("disabled");
    },


    /**
     * Setter for the widget-specific templates. The available templates can
     * be found in the documentation of the corresponding widget. The templates
     * will be rendered using
     * <a href='https://github.com/janl/mustache.js/'>mustache.js</a>.
     *
     * Please keep in mind to call {@link #render} after you change any
     * template or config setting.
     *
     * @param name {String} The name of the template.
     * @param template {String} The template string.
     *
     * @return {qx.ui.website.Widget} The widget instance for chaining.
     */
    setTemplate : function(name, template) {
      return this._setData("templates", name, template);
    },


    /**
     * Setter for the widget-specific config. The available config settings can
     * be found in the documentation of the corresponding widget. Each config
     * setting can be set in the markup as data-attribute, prefixed with
     * <code>data-qx</code> e.g. <code>data-qx-length="5"</code>.
     *
     * Please keep in mind to call {@link #render} after you change any
     * template or config setting.
     *
     * @param name {String} The name of the config setting.
     * @param config {var} The value of the config setting.
     * @return {qx.ui.website.Widget} The widget instance for chaining.
     */
    setConfig : function(name, config) {
      return this._setData("config", name, config);
    },


    /**
     * Helper to set either config or template values.
     *
     * @param type {String} Either <code>templates</code> or <code>config</code>.
     * @param name {String} The name for the value to store.
     * @param data {var} The data to store.
     * @return {qx.ui.website.Widget} The widget instance for chaining.
     */
    _setData : function(type, name, data) {
      this.forEach(function(item) {
        if (!item[type]) {
          item[type] = {};
        }
        item[type][name] = data;
      });

      return this;
    },


    /**
     * Returns the used template. This includes custom templates
     * as the default templates defined by the widgets.
     *
     * @param name {String} The name of the template.
     * @return {String} The template string or <code>undefined</code>.
     */
    getTemplate : function(name) {
      return this._getData("templates", name);
    },


    /**
     * Returns the config setting currently in use for the given widget.
     * This can either be the user set config value, the value set in
     * the markup via data-attribute, the widgets default config value or
     * <code>undefined</code>, if non is set.
     *
     * @param name {String} The name of the config.
     * @return {var} The value of the config or <code>undefined</code>.
     */
    getConfig : function(name) {
      return this._getData("config", name);
    },


    /**
     * Internal helper for querying the values for templates and configs. In the
     * case of a config value, the method also reads the corresponding data-attribute
     * for possible values.
     *
     * @param type {String} Either <code>templates</code> or <code>config</code>.
     * @param name {String} The name for the value to fetch.
     * @return {var} The value store for the given arguments.
     */
    _getData : function(type, name) {
      var storage = this.getProperty(type);
      var item;

      if (storage) {
        item = storage[name];
      }

      if (item === undefined && type == "config") {
        var attribName = "qx" + qxWeb.string.firstUp(type) +
          qxWeb.string.firstUp(name);
        item = this.getData(attribName);

        // not defined HTML attributes result in 'null' values
        if (!this[0] || (!this[0].dataset && item === null)) {
          item = undefined;
        }

        try {
          item = JSON.parse(item);
        } catch(e) {}
      }

      if (item === undefined && this.constructor["_" + type]) {
        return this.constructor["_" + type][name];
      }

      return item;
    },


    /**
     * The render method is responsible for applying changed config
     * and template settings. This method is usually overridden and specified
     * by the subclassing widgets like the slider or tabs.
     *
     * @return {qx.ui.website.Widget} The widget collection for chaining.
     */
    render : function() {
      // empty method
      return this;
    },


    /**
     * Dispose the widget, making sure all objects are ready for
     * garbage collection. This mainly means deleting connections to the
     * DOM including event listeners.
     * @return {qxWeb} Plain qxWeb collection
     */
    dispose : function() {
      this.removeAttribute("data-qx-class");
      this.setProperty("config", undefined);
      this.setProperty("templates", undefined);
      var contextProperty = this.classname.replace(/\./g, "-") + "-context";
      this.setProperty(contextProperty, undefined);
      this.setProperty("$$qx-widget-initialized", undefined);
      this.removeClass("qx-widget");
      this.removeClass(this.getCssPrefix());

      for (var name in this.constructor.$$events) {
        this.allOff(name);
      }

      return qxWeb.$init(this, qxWeb);
    }
  },


  defer : function(statics) {
    qxWeb.$attach({
      $onFirstCollection : statics.$onFirstCollection,
      $offFirstCollection : statics.$offFirstCollection,
      widget: statics.widget
    });
    qxWeb.$attachStatic({
      initWidgets : statics.initWidgets
    });
  }
});
