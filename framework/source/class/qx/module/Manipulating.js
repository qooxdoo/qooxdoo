qx.Bootstrap.define("qx.module.Manipulating", {
  statics :
  {
    create : function(html) {
      return q.init(qx.bom.Html.clean([html]));
    },


    wrap : function(el) {
      if (!qx.lang.Type.isArray(el)) {
        el = [el];
      }
      return q.init(el);
    },


    append : function(html) {
      var arr = qx.bom.Html.clean([html]);
      var children = qx.lang.Array.cast(arr, qx.Collection);

      for (var i=0, l=this.length; i < l; i++) {
        for (var j=0, m=children.length; j < m; j++) {
          if (i == 0) {
            // first parent: move the target node(s)
            qx.dom.Element.insertEnd(children[j], this[i]);
          }
          else {
            // further parents: clone the target node(s)
            /* TODO: Implement workaround for IE problem with listeners attached
             * to cloned nodes; see qx.bom.Element.clone()
             */
            qx.dom.Element.insertEnd(children[j].cloneNode(true), this[i]);
          }
        }
      }
      
      return this;
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
      
      return this;
    },


    remove : function() {
      for (var i=0; i < this.length; i++) {
        qx.dom.Element.remove(this[i]);
      };
      return this;
    },


    empty : function() {
      for (var i=0; i < this.length; i++) {
        this[i].innerHTML = "";
      };
      return this;
    },


    before : function(args) {
      if (!qx.lang.Type.isArray(args)) {
        args = [args];
      }
      var fragment = document.createDocumentFragment();
      qx.bom.Html.clean(args, document, fragment);
      this.forEach(function(item, index) {
        var kids = qx.lang.Array.cast(fragment.childNodes, Array);
        for (var i=0,l=kids.length; i<l; i++) {
          var child;
          if (index < this.length - 1) {
            child = kids[i].cloneNode(true)
          }
          else {
            child = kids[i];
          }
          item.parentNode.insertBefore(child, item);
        }
      }, this);
      
      return this;
    },


    after : function(args) {
      if (!qx.lang.Type.isArray(args)) {
        args = [args];
      }
      var fragment = document.createDocumentFragment();
      qx.bom.Html.clean(args, document, fragment);
      this.forEach(function(item, index) {
        var kids = qx.lang.Array.cast(fragment.childNodes, Array);
        for (var i=kids.length-1; i>=0; i--) {
          var child;
          if (index < this.length - 1) {
            child = kids[i].cloneNode(true)
          }
          else {
            child = kids[i];
          }
          item.parentNode.insertBefore(child, item.nextSibling);
        }
      }, this);
      
      return this;
    },


    /**
     * Returns the left scroll position of the first element in the collection.
     *
     * @return {Integer} Current left scroll position
     */
    getScrollLeft : function()
    {
      var obj = this[0];
      if (!obj) {
        return null;
      }

      var Node = qx.dom.Node;
      if (Node.isWindow(obj) || Node.isDocument(obj)) {
        return qx.bom.Viewport.getScrollLeft();
      }

      return obj.scrollLeft;
    },


    /**
     * Returns the top scroll position of the first element in the collection.
     *
     * @return {Integer} Current top scroll position
     */
    getScrollTop : function()
    {
      var obj = this[0];
      if (!obj) {
        return null;
      }

      var Node = qx.dom.Node;
      if (Node.isWindow(obj) || Node.isDocument(obj)) {
        return qx.bom.Viewport.getScrollTop();
      }

      return obj.scrollTop;
    },
    
    
    /**
     * Scrolls the elements of the collection to the given coordinate.
     *
     * @param value {Integer} Left scroll position
     * @return {Collection} This collection for chaining
     */
    setScrollLeft : function(value)
    {
      var Node = qx.dom.Node;

      for (var i=0, l=this.length, obj; i<l; i++)
      {
        obj = this[i];

        if (Node.isElement(obj)) {
          obj.scrollLeft = value;
        } else if (Node.isWindow(obj)) {
          obj.scrollTo(value, this.getScrollTop(obj));
        } else if (Node.isDocument(obj)) {
          Node.getWindow(obj).scrollTo(value, this.getScrollTop(obj));
        }
      }

      return this;
    },


    /**
     * Scrolls the elements of the collection to the given coordinate.
     *
     * @param value {Integer} Top scroll position
     * @return {Collection} This collection for chaining
     */
    setScrollTop : function(value)
    {
      var Node = qx.dom.Node;

      for (var i=0, l=this.length, obj; i<l; i++)
      {
        obj = this[i];

        if (Node.isElement(obj)) {
          obj.scrollTop = value;
        } else if (Node.isWindow(obj)) {
          obj.scrollTo(this.getScrollLeft(obj), value);
        } else if (Node.isDocument(obj)) {
          Node.getWindow(obj).scrollTo(this.getScrollLeft(obj), value);
        }
      }

      return this;
    }
  },


  defer : function(statics) {
    q.attachStatic({
      "create" : statics.create,
      "wrap" : statics.wrap
    });

    q.attach({
      "append" : statics.append,
      "appendTo" : statics.appendTo,
      "remove" : statics.remove,
      "empty" : statics.empty,
      
      "before" : statics.before,
      "after" : statics.after,
      
      "getScrollLeft" : statics.getScrollLeft,
      "setScrollLeft" : statics.setScrollLeft,
      "getScrollTop" : statics.getScrollTop,
      "setScrollTop" : statics.setScrollTop
    });
  }
});