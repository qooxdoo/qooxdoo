qx.Bootstrap.define("qx.module.Css", {
  statics: {
    // documnentatin here!
    setStyle : function(name, value) {
      for (var i=0; i < this.length; i++) {
        qx.bom.element.Style.set(this[i], name, value);
      };
      return this;
    },

    getStyle : function(name) {
      if (this[0]) {
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


    removeClass : function(name) {
      for (var i=0; i < this.length; i++) {
        qx.bom.element.Class.remove(this[i], name);
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
      this.hasClass(name) ? this.removeClass(name) : this.addClass(name);
      return this;
    }
  },


  defer : function(statics) {
    q.attach({
      "setStyle" : statics.setStyle,
      "getStyle" : statics.getStyle,
      "setStyles" : statics.setStyles,
      "getStyles" : statics.getStyles,

      "addClass" : statics.addClass,
      "removeClass" : statics.removeClass,
      "hasClass" : statics.hasClass,
      "toggleClass" : statics.toggleClass
    });
  }
});