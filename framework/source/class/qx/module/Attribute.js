qx.Bootstrap.define("qx.module.Attribute", {
  statics :
  {
    getHtml : function() {
      if (this[0]) {
        return qx.bom.element.Attribute.get(this[0], "html");
      }
      return null;
    },

    setHtml : function(html) {
      for (var i=0; i < this.length; i++) {
        qx.bom.element.Attribute.set(this[i], "html", html);
      };
    }
  },


  defer : function(statics) {
    qx.q.attach({
      "getHtml" : statics.getHtml,
      "setHtml" : statics.setHtml
    });
  }
});
