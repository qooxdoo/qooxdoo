qx.Bootstrap.define("qx.module.Style", 
{
  statics: {
    // documnentatin here!
    setStyle : function(name, value) {
      for (var i=0; i < this.length; i++) {
        qx.bom.element.Style.set(this[i], name, value);
      };
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
    },


    getStyles : function(names) {
      var styles = {};
      for (var i=0; i < names.length; i++) {
        styles[names[i]] = this.getStyle(names[i]);
      };
      return styles;
    }
  },


  defer : function(statics) {
    qx.q.attach({
      "setStyle" : statics.setStyle,
      "getStyle" : statics.getStyle,
      "setStyles" : statics.setStyles,
      "getStyles" : statics.getStyles
    });
  }
});