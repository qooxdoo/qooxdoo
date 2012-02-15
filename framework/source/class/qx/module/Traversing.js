qx.Bootstrap.define("qx.module.Traversing", {
  statics :
  {
    add : function(el) {
      this.push(el);
      return this;
    },


    getChildren : function(selector) {
      var children = [];
      for (var i=0; i < this.length; i++) {
        var found = qx.dom.Hierarchy.getChildElements(this[i]);
        if (selector) {
          found = qx.bom.Selector.matches(selector, found);
        }
        children = children.concat(found);
      };
      return qx.lang.Array.cast(children, qx.Collection);
    },


    forEach : function(fn, ctx) {
      for (var i=0; i < this.length; i++) {
        fn.call(ctx, this[i], i, this);
      };
      return this;
    },


    getParents : function(selector) {
      var parents = [];
      for (var i=0; i < this.length; i++) {
        var found = qx.dom.Element.getParentElement(this[i]);
        if (selector) {
          found = qx.bom.Selector.matches(selector, [found]);
        }
        parents = parents.concat(found);
      };
      return qx.lang.Array.cast(parents, qx.Collection);
    },


    getAncestors : function(selector) {
      var ancestors = [];
      for (var i=0; i < this.length; i++) {
        var parent = qx.dom.Element.getParentElement(this[i]);
        while (parent) {
          var found;
          if (selector) {
            found = qx.bom.Selector.matches(selector, [parent]);
          }
          else {
            found = [parent];
          }
          ancestors = ancestors.concat(found);
          parent = qx.dom.Element.getParentElement(parent);
        }
      }
      return qx.lang.Array.cast(ancestors, qx.Collection);
    },


    getClosest : function(selector) {
      var closest = [];

      var findClosest = function findClosest(current) {
        var found = qx.bom.Selector.matches(selector, current);
        if (found.length) {
          closest.push(found[0]);
        } else {
          current = current.getParents(); // One up
          if(current[0] && current[0].parentNode) {
            findClosest(current);
          }
        }
      };

      for (var i=0; i < this.length; i++) {
        findClosest(q.wrap(this[i]));
      };

      return qx.lang.Array.cast(closest, qx.Collection);
    },


    find : function(selector) {
      var found = [];
      for (var i=0; i < this.length; i++) {
        found = found.concat(qx.bom.Selector.query(selector, this[i]));
      };
      return qx.lang.Array.cast(found, qx.Collection);
    },


    // TODO: Move to other class (Set, ...)
    filter : function(selector) {
      if (qx.lang.Type.isFunction(selector)) {
        return qx.type.BaseArray.prototype.filter.call(this, selector);
      }
      return qx.lang.Array.cast(qx.bom.Selector.matches(selector, this), qx.Collection);
    },


    getContents : function() {
      var found = [];
      for (var i=0; i < this.length; i++) {
        found = found.concat(qx.lang.Array.fromCollection(this[i].childNodes));
      }
      return qx.lang.Array.cast(found, qx.Collection);
    }
  },


  defer : function(statics) {
    q.attach({
      "add" : statics.add,
      "getChildren" : statics.getChildren,
      "forEach" : statics.forEach,
      "getParents" : statics.getParents,
      "getAncestors" : statics.getAncestors,
      "getClosest" : statics.getClosest,
      "find" : statics.find,
      "filter" : statics.filter,
      "getContents" : statics.getContents
    });
  }
});
