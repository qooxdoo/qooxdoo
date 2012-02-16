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
      /*
       * This works but isn't currently needed:
      if (qx.dom.Node.isElement(selector)) {
        for (var i=0; i < this.length; i++) {
          if (this[i] == selector) {
            return qx.lang.Array.cast([this[i]], qx.Collection);
          }
        }
      }
      */
      return qx.lang.Array.cast(qx.bom.Selector.matches(selector, this), qx.Collection);
    },


    getContents : function() {
      var found = [];
      for (var i=0; i < this.length; i++) {
        found = found.concat(qx.lang.Array.fromCollection(this[i].childNodes));
      }
      return qx.lang.Array.cast(found, qx.Collection);
    },


    is : function(selector) {
      if (qx.lang.Type.isFunction(selector)) {
        return this.filter(selector).length > 0;
      }
      return !!selector && qx.bom.Selector.matches(selector, this).length > 0;
    },


    eq : function(index) {
      return this.slice(index, +index + 1);
    },


    first : function() {
      return this.slice(0, 1);
    },


    last : function() {
      return this.slice(this.length - 1);
    },


    has : function(selector) {
      var found = [];
      for (var i=0; i < this.length; i++) {
        var descendants = qx.bom.Selector.matches(selector, this.eq(i).getContents())
        if (descendants.length > 0) {
          found.push(this[i]);
        }
      }
      return qx.lang.Array.cast(found, qx.Collection);
    },


    next : function(selector) {
      var Hierarchy = qx.dom.Hierarchy;
      var found = this.map(Hierarchy.getNextElementSibling, Hierarchy);
      if (selector) {
        found = qx.bom.Selector.matches(selector, found);
      }
      return found;
    },


    nextAll : function(selector) {
      var ret = this.__hierarchyHelper("getNextSiblings", selector);
      return qx.lang.Array.cast(ret, qx.Collection);
    },


    nextUntil : function(selector) {
      var found = [];
      this.forEach(function(item, index) {
        var nextSiblings = qx.dom.Hierarchy.getNextSiblings(item);
        for (var i=0, l=nextSiblings.length; i<l; i++) {
          if (qx.bom.Selector.matches(selector, [nextSiblings[i]]).length > 0) {
            break;
          }
          found.push(nextSiblings[i]);
        }
      });
      
      return qx.lang.Array.cast(found, qx.Collection);
    },


    prev : function(selector) {
      var Hierarchy = qx.dom.Hierarchy;
      var found = this.map(Hierarchy.getPreviousElementSibling, Hierarchy);
      if (selector) {
        found = qx.bom.Selector.matches(selector, found);
      }
      return found;
    },


    prevAll : function(selector) {
      var ret = this.__hierarchyHelper("getPreviousSiblings", selector);
      return qx.lang.Array.cast(ret, qx.Collection);
    },


    prevUntil : function(selector) {
      var found = [];
      this.forEach(function(item, index) {
        var previousSiblings = qx.dom.Hierarchy.getPreviousSiblings(item);
        for (var i=0, l=previousSiblings.length; i<l; i++) {
          if (qx.bom.Selector.matches(selector, [previousSiblings[i]]).length > 0) {
            break;
          }
          found.push(previousSiblings[i]);
        }
      });
      
      return qx.lang.Array.cast(found, qx.Collection);
    },


    __hierarchyHelper : function(method, selector)
    {
      // Iterate ourself, as we want to directly combine the result
      var all = [];
      var Hierarchy = qx.dom.Hierarchy;
      for (var i=0, l=this.length; i<l; i++) {
        all.push.apply(all, Hierarchy[method](this[i]));
      }

      // Remove duplicates
      var ret = qx.lang.Array.unique(all);

      // Post reduce result by selector
      if (selector) {
        ret = qx.bom.Selector.matches(selector, ret);
      }

      return ret;
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
      "getContents" : statics.getContents,
      "is" : statics.is,
      "eq" : statics.eq,
      "first" : statics.first,
      "last" : statics.last,
      "has" : statics.has,
      "next" : statics.next,
      "nextAll" : statics.nextAll,
      "nextUntil" : statics.nextUntil,
      "prev" : statics.prev,
      "prevAll" : statics.prevAll,
      "prevUntil" : statics.prevUntil,
      "__hierarchyHelper" : statics.__hierarchyHelper
    });
  }
});
