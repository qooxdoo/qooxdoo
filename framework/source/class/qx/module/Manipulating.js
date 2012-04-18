/* ************************************************************************

   qooxdoo - the new era of web development

   http://qooxdoo.org

   Copyright:
     2011-2012 1&1 Internet AG, Germany, http://www.1und1.de

   License:
     LGPL: http://www.gnu.org/licenses/lgpl.html
     EPL: http://www.eclipse.org/org/documents/epl-v10.php
     See the LICENSE file in the project's top-level directory for details.

   Authors:
     * Martin Wittemann (wittemann)
     * Daniel Wagner (danielwagner)

************************************************************************ */

/**
 * DOM manipulation module
 */
qx.Bootstrap.define("qx.module.Manipulating", {
  statics :
  {
    /**
     * Creates a new collection from the given argument. This can either be an
     * HTML string, a single DOM element or an array of elements
     * 
     * @param html {String|Element[]} HTML string or DOM element(s)
     * @return {qx.Collection} Collection of elements
     */
    create : function(html) {
      return q.init(qx.bom.Html.clean([html]));
    },


    /**
     * Creates a new collection from a DOM element.
     * 
     * @param el {Element} DOM element
     * @return {qx.Collection} Collection of elements
     */
    wrap : function(el) {
      if (!qx.lang.Type.isArray(el)) {
        el = [el];
      }
      return q.init(el);
    },


    /**
     * Clones the items in the current collection and returns them in a new set.
     * Event listeners can also be cloned.
     * 
     * @param events {Boolean} clone event listeners
     * @return {qx.Collection} New collection with clones
     */
    clone : function(events) {
      var clones = [];
      for (var i=0; i < this.length; i++) {
        clones.push(this[i].cloneNode(true));
      };

      if (events === true) {
        this.copyEventsTo(clones);
      }

      return q.wrap(clones);
    },



    /**
     * Appends content to each element in the current set. Accepts an HTML string,
     * a single DOM element or an array of elements
     * 
     * @param html {String|Element[]} HTML string or DOM element(s) to append
     * @return {qx.Collection} The collection for chaining
     */
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


    /**
     * Appends all items in the collection to the specified parents. If multiple
     * parents are given, the items will be moved to the first parent, while 
     * clones of the items will be appended to subsequent parents.
     * 
     * @param parent {String|Element[]} Parent selector expression or list of 
     * parent elements
     * @return {qx.Collection} The collection for chaining
     */
    appendTo : function(parent) {
      if (!qx.lang.Type.isArray(parent)) {
        var fromSelector = q(parent);
        parent = fromSelector.length > 0 ? fromSelector : [parent];
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


    /**
     * Removes each element in the current collection from the DOM
     * 
     * @return {qx.Collection} The collection for chaining
     */
    remove : function() {
      for (var i=0; i < this.length; i++) {
        qx.dom.Element.remove(this[i]);
      };
      return this;
    },


    /**
     * Removes all content from the elements in the collection
     * 
     * @return {qx.Collection} The collection for chaining
     */
    empty : function() {
      for (var i=0; i < this.length; i++) {
        this[i].innerHTML = "";
      };
      return this;
    },


    /**
     * Inserts content before each element in the collection. This can either 
     * be an HTML string, an array of HTML strings, a single DOM element or an 
     * array of elements.
     * 
     * @param args {String[]|Element[]} HTML string(s) or DOM element(s)
     * @return {qx.Collection} The collection for chaining
     */
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


    /**
     * Inserts content after each element in the collection. This can either 
     * be an HTML string, an array of HTML strings, a single DOM element or an 
     * array of elements.
     * 
     * @param args {String[]|Element[]} HTML string(s) or DOM element(s)
     * @return {qx.Collection} The collection for chaining
     */
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
    },


    /**
     * Focuses the first element in the collection
     * 
     * @return {qx.Collection} The collection for chaining
     */
    focus : function()
    {
      try {
        this[0].focus();
      }
      catch(ex) {}
      
      return this;
    },


    /**
     * Blurs each element in the collection
     * 
     * @return {qx.Collection} The collection for chaining
     */
    blur : function()
    {
      this.forEach(function(item, index) {
        try {
          item.blur();
        }
        catch(ex) {}
      });
      
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

      "clone" : statics.clone,

      "getScrollLeft" : statics.getScrollLeft,
      "setScrollLeft" : statics.setScrollLeft,
      "getScrollTop" : statics.getScrollTop,
      "setScrollTop" : statics.setScrollTop,
      
      "focus" : statics.focus,
      "blur" : statics.blur
    });
  }
});