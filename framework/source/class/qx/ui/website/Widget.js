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
 * EXPERIMENTAL - NOT READY FOR PRODUCTION
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
     * TODOC
     *
     * @attach {qxWeb}
     * @param type {String} Type of the event to listen for
     * @param listener {Function} Listener callback
     * @param context {Object?} Context the callback function will be executed in.
     * Default: The element on which the listener was registered
     * @param useCapture {Boolean?} Attach the listener to the capturing
     * phase if true.
     * @return {qxWeb} The collection for chaining
     */
    onWidget : function(type, listener, ctx, useCapture) {
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
     * TODOC
     *
     * @attach {qxWeb}
     * @param type {String} Type of the event to listen for
     * @param listener {Function} Listener callback
     * @param context {Object?} Context the callback function will be executed in.
     * Default: The element on which the listener was registered
     * @param useCapture {Boolean?} Attach the listener to the capturing
     * phase if true.
     * @return {qxWeb} The collection for chaining
     */
    offWidget : function(type, listener, ctx, useCapture) {
      var propertyName = this.classname.replace(/\./g, "-") + "-context";
      this._forEachElementWrapped(function(item) {
        var originalCtx = item.getProperty(propertyName);
        item.off(type, listener, originalCtx, useCapture);
      });

      return this;
    },

    /**
     * TODOC
     *
     * @attachStatic {qxWeb}
     */
    initWidgets : function() {
      qxWeb("*[data-qx-class]")._forEachElementWrapped(function(widget) {
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


    getCssPrefix : function() {
      if (!this.__cssPrefix) {
        var split = this.classname.split(".");
        this.__cssPrefix = "qx-" + split[split.length - 1].toLowerCase();
      }
      return this.__cssPrefix;
    },


    setEnabled : function(value) {
      this.setAttribute("disabled", !value);
      this.find("*").setAttribute("disabled", !value);
      return this;
    },


    getEnabled : function() {
      return !this.getProperty("disabled");
    },


    setTemplate : function(name, template) {
      return this._setData("templates", name, template);
    },


    setConfig : function(name, config) {
      return this._setData("config", name, config);
    },


    _setData : function(type, name, data) {
      this.forEach(function(item) {
        if (!item[type]) {
          item[type] = {};
        }
        item[type][name] = data;
      });

      return this;
    },


    getTemplate : function(name) {
      return this._getData("templates", name);
    },


    getConfig : function(name) {
      return this._getData("config", name);
    },


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


    setSelectable : function(value) {
      if (!this[0]) {
        return;
      }
      var contentElement = this.eq(0);
      contentElement.setAttribute("qxSelectable", value ? "on" : "off");
      var userSelect = qx.core.Environment.get("css.userselect");
      if (userSelect) {
        contentElement.setStyle(userSelect, value ? "text" :
          qx.core.Environment.get("css.userselect.none"));
      }
      return this;
    },


    render : function() {
      // empty method
    },

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
      onWidget : statics.onWidget,
      offWidget : statics.offWidget
    });
    qxWeb.$attachStatic({
      initWidgets : statics.initWidgets
    });
  }
});
