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
      if (!qx.lang.Type.isArray(parent)) {
        parent = [parent];
      }
      for (var i=0, l=parent.length; i < l; i++) {
        for (var j=0, m=this.length; j < m; j++) {
          if (i == 0) {
            // first parent: move the target node(s)
            qx.dom.Element.insertEnd(this[j], parent[i]);
          }
          else {
            // further parents: clone the target node(s)
            /* TODO: Implement workaround for IE problem with listeners attached
             * to cloned nodes; see qx.bom.Element.clone()
             */
            qx.dom.Element.insertEnd(this[j].cloneNode(true), parent[i]);
          }
        }
      }
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
    q.attachStatic({
      "create" : statics.create,
      "wrap" : statics.wrap
    });

    q.attach({
      "appendTo" : statics.appendTo,
      "remove" : statics.remove,
      "empty" : statics.empty
    });
  }
});