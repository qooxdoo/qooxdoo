qx.Bootstrap.define("qx.module.Css", {
  statics: {
    // documnentatin here!
    setStyle : function(name, value) {
      if (/\w-\w/.test(name)) {
        name = qx.lang.String.camelCase(name);
      }
      for (var i=0; i < this.length; i++) {
        qx.bom.element.Style.set(this[i], name, value);
      };
      return this;
    },

    getStyle : function(name) {
      if (this[0]) {
        if (/\w-\w/.test(name)) {
          name = qx.lang.String.camelCase(name);
        }
        return qx.bom.element.Style.get(this[0], name);
      }
      return null;
    },

    setStyles : function(styles) {
      for (var name in styles) {
        this.setStyle(name, styles[name]);
      }
      return this;
    },


    getStyles : function(names) {
      var styles = {};
      for (var i=0; i < names.length; i++) {
        styles[names[i]] = this.getStyle(names[i]);
      };
      return styles;
    },


    addClass : function(name) {
      for (var i=0; i < this.length; i++) {
        qx.bom.element.Class.add(this[i], name);
      };
      return this;
    },


    addClasses : function(names) {
      for (var i=0; i < this.length; i++) {
        qx.bom.element.Class.addClasses(this[i], names);
      };
      return this;
    },


    removeClass : function(name) {
      for (var i=0; i < this.length; i++) {
        qx.bom.element.Class.remove(this[i], name);
      };
      return this;
    },


    removeClasses : function(names) {
      for (var i=0; i < this.length; i++) {
        qx.bom.element.Class.removeClasses(this[i], names);
      };
      return this;
    },


    hasClass : function(name) {
      if (!this[0]) {
        return false;
      }
      return qx.bom.element.Class.has(this[0], name);
    },


    toggleClass : function(name) {
      var bCls = qx.bom.element.Class;
      for (var i=0, l=this.length; i<l; i++) {
        bCls.has(this[i], name) ?
          bCls.remove(this[i], name) :
          bCls.add(this[i], name);
      }
      return this;
    },


    toggleClasses : function(names) {
      for (var i=0,l=names.length; i<l; i++) {
        this.toggleClass(names[i]);
      }
      return this;
    },


    replaceClass : function(oldName, newName) {
      for (var i=0, l=this.length; i<l; i++) {
        qx.bom.element.Class.replace(this[i], oldName, newName);
      }
    },


    getHeight : function() {
      var elem = this[0];

      if (elem) {
        if (qx.dom.Node.isElement(elem)) {
          return qx.bom.element.Dimension.getHeight(elem);
        } else if (qx.dom.Node.isDocument(elem)) {
          return qx.bom.Document.getHeight(qx.dom.Node.getWindow(elem));
        } else if (qx.dom.Node.isWindow(elem)) {
          return qx.bom.Viewport.getHeight(elem);
        }
      }

      return null;
    },


    getWidth : function() {
      var elem = this[0];

      if (elem) {
        if (qx.dom.Node.isElement(elem)) {
          return qx.bom.element.Dimension.getWidth(elem);
        } else if (qx.dom.Node.isDocument(elem)) {
          return qx.bom.Document.getWidth(qx.dom.Node.getWindow(elem));
        } else if (qx.dom.Node.isWindow(elem)) {
          return qx.bom.Viewport.getWidth(elem);
        }
      }

      return null;
    },


    getOffset : function() {
      var elem = this[0];

      if (elem) {
        return qx.bom.element.Location.get(elem);
      }

      return null;
    },


    getContentHeight : function()
    {
      var obj = this[0];
      if (qx.dom.Node.isElement(obj)) {
        return qx.bom.element.Dimension.getContentHeight(obj);
      }

      return null;
    },


    getContentWidth : function()
    {
      var obj = this[0];
      if (qx.dom.Node.isElement(obj)) {
        return qx.bom.element.Dimension.getContentWidth(obj);
      }

      return null;
    }
  },


  defer : function(statics) {
    q.attach({
      "setStyle" : statics.setStyle,
      "getStyle" : statics.getStyle,
      "setStyles" : statics.setStyles,
      "getStyles" : statics.getStyles,

      "addClass" : statics.addClass,
      "addClasses" : statics.addClasses,
      "removeClass" : statics.removeClass,
      "removeClasses" : statics.removeClasses,
      "hasClass" : statics.hasClass,
      "toggleClass" : statics.toggleClass,
      "toggleClasses" : statics.toggleClasses,
      "replaceClass" : statics.replaceClass,

      "getHeight" : statics.getHeight,
      "getWidth" : statics.getWidth,
      "getOffset" : statics.getOffset,
      "getContentHeight" : statics.getContentHeight,
      "getContentWidth" : statics.getContentWidth
    });
  }
});