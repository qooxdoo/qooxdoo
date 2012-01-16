qx.Bootstrap.define("qx.module.Template", {
  statics :
  {
    get : function(id, view, partials) {
      var el = qx.bom.Template.get(id, view, partials);
      return qx.lang.Array.cast([el], qx.Collection);
    },

    toHtml : function(template, view, partials, send_fun) {
      return qx.bom.Template.toHtml(template, view, partials, send_fun);
    }
  },


  defer : function(statics) {
    qx.q.attachStatic({
      "template" : {get: statics.get, toHtml: statics.toHtml}
    });
  }
});
