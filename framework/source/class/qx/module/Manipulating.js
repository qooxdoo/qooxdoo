qx.Bootstrap.define("qx.module.Manipulating", {
  statics :
  {
    create : function(html) {
      var arr = qx.bom.Html.clean([html]);
      return qx.lang.Array.cast(arr, qx.Collection);
    },


    wrap : function(el) {
      if (!qx.lang.Type.isArray(el)) {
        el = [el];
      }
      return qx.lang.Array.cast(el, qx.Collection);
    },


    appendTo : function(parent) {
      for (var i=0; i < this.length; i++) {
        qx.dom.Element.insertEnd(this[i], parent);
      };
    },


    remove : function() {
      for (var i=0; i < this.length; i++) {
        qx.dom.Element.remove(this[i]);
      };
    },


    empty : function() {
      for (var i=0; i < this.length; i++) {
        this[i].innerHTML = "";
      };
    }
  },
  
  
  defer : function(statics) {
    qx.q.attachStatic({
      "create" : statics.create,
      "warp" : statics.wrap
    });


    qx.q.attach({
      "appendTo" : statics.appendTo,
      "remove" : statics.remove,
      "empty" : statics.empty
    });
  }
});
