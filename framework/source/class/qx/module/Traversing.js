qx.Bootstrap.define("qx.module.Traversing", {
  statics :
  {
    add : function(el) {
      this.push(el);
      return this;
    },


    getChildren : function() {
      var children = [];
      for (var i=0; i < this.length; i++) {
        children = children.concat(qx.dom.Hierarchy.getChildElements(this[i]));
      };
      return qx.lang.Array.cast(children, qx.Collection)
    },


    forEach : function(fn, ctx) {
      for (var i=0; i < this.length; i++) {
        fn.call(ctx, this[i], i, this);
      };
      return this;
    },


    getParents : function() {
      var parents = [];
      for (var i=0; i < this.length; i++) {
        parents = parents.concat(qx.dom.Element.getParentElement(this[i]));
      };
      return qx.lang.Array.cast(parents, qx.Collection)
    }
  },


  defer : function(statics) {
    qx.q.attach({
      "add" : statics.add,
      "getChildren" : statics.getChildren,
      "forEach" : statics.forEach,
      "getParents" : statics.getParents
    });
  }
});
