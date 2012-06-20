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
     * @attachStatic{q}
     * @param html {String|Element[]} HTML string or DOM element(s)
     * @return {q} Collection of elements
     */
    create : function(html) {
      return q.$init(qx.bom.Html.clean([html]));
    },


    /**
     * Clones the items in the current collection and returns them in a new set.
     * Event listeners can also be cloned.
     *
     * @attach{q}
     * @param events {Boolean} clone event listeners. Default: <pre>false</pre>
     * @return {q} New collection with clones
     */
    clone : function(events) {
      var clones = [];
      for (var i=0; i < this.length; i++) {
        clones[i] = this[i].cloneNode(true);
      };

      if (events === true && this.copyEventsTo) {
        this.copyEventsTo(clones);
      }

      return q(clones);
    },



    /**
     * Appends content to each element in the current set. Accepts an HTML string,
     * a single DOM element or an array of elements
     *
     * @attach{q}
     * @param html {String|Element[]} HTML string or DOM element(s) to append
     * @return {q} The collection for chaining
     */
    append : function(html) {
      var arr = qx.bom.Html.clean([html]);
      var children = q.$init(arr);

      for (var i=0, l=this.length; i < l; i++) {
        for (var j=0, m=children.length; j < m; j++) {
          if (i == 0) {
            // first parent: move the target node(s)
            qx.dom.Element.insertEnd(children[j], this[i]);
          }
          else {
            qx.dom.Element.insertEnd(children.eq(j).clone(true)[0], this[i]);
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
     * @attach{q}
     * @param parent {String|Element[]} Parent selector expression or list of
     * parent elements
     * @return {q} The collection for chaining
     */
    appendTo : function(parent) {
      parent = qx.module.Manipulating.__getElementArray(parent);
      for (var i=0, l=parent.length; i < l; i++) {
        for (var j=0, m=this.length; j < m; j++) {
          if (i == 0) {
            // first parent: move the target node(s)
            qx.dom.Element.insertEnd(this[j], parent[i]);
          }
          else {
            // further parents: clone the target node(s)
            qx.dom.Element.insertEnd(this.eq(j).clone(true)[0], parent[i]);
          }
        }
      }

      return this;
    },


    /**
     * Inserts the current collection before each target item. The collection
     * items are moved before the first target. For subsequent targets,
     * clones of the collection items are created and inserted.
     *
     * @attach{q}
     * @param target {String|Element} Selector expression or DOM element
     * @return {q} The collection for chaining
     */
    insertBefore : function(target)
    {
      target = qx.module.Manipulating.__getElementArray(target);
      for (var i=0, l=target.length; i < l; i++) {
        for (var j=0, m=this.length; j < m; j++) {
          if (i == 0) {
            // first target: move the target node(s)
            qx.dom.Element.insertBefore(this[j], target[i]);
          }
          else {
            // further targets: clone the target node(s)
            qx.dom.Element.insertBefore(this.eq(j).clone(true)[0], target[i]);
          }
        }
      }

      return this;
    },



    /**
     * Inserts the current collection after each target item. The collection
     * items are moved after the first target. For subsequent targets,
     * clones of the collection items are created and inserted.
     *
     * @attach{q}
     * @param target {String|Element} Selector expression or DOM element
     * @return {q} The collection for chaining
     */
    insertAfter : function(target)
    {
      target = qx.module.Manipulating.__getElementArray(target);
      for (var i=0, l=target.length; i < l; i++) {
        for (var j=this.length - 1; j >= 0; j--) {
          if (i == 0) {
            // first target: move the target node(s)
            qx.dom.Element.insertAfter(this[j], target[i]);
          }
          else {
            // further targets: clone the target node(s)
            qx.dom.Element.insertAfter(this.eq(j).clone(true)[0], target[i]);
          }
        }
      }

      return this;
    },


    /**
     * Returns an array from a selector expression or a single element
     *
     * @attach{q}
     * @param arg {String|Element} Selector expression or DOM element
     * @return {Element[]} Array of elements
     * @internal
     */
    __getElementArray : function(arg)
    {
      if (!qx.lang.Type.isArray(arg)) {
        var fromSelector = q(arg);
        arg = fromSelector.length > 0 ? fromSelector : [arg];
      }
      return arg;
    },


    /**
     * Wraps each element in the collection in a copy of an HTML structure.
     * Elements will be appended to the deepest nested element in the structure
     * as determined by a depth-first search.
     *
     * @attach{q}
     * @param wrapper {var} Selector expression, HTML string, DOM element or
     * list of DOM elements
     * @return {q} The collection for chaining
     */
    wrap : function(wrapper) {
      var wrapper = qx.module.Manipulating.__getCollectionFromArgument(wrapper);

      if (wrapper.length == 0 || !qx.dom.Node.isElement(wrapper[0])) {
        return this;
      }

      for (var i=0,l=this.length; i < l; i++) {
        var clonedwrapper = wrapper.eq(0).clone(true);
        qx.dom.Element.insertAfter(clonedwrapper[0], this[i]);
        var innermost = qx.module.Manipulating.__getInnermostElement(clonedwrapper[0]);
        qx.dom.Element.insertEnd(this[i], innermost);
      }

      return this;
    },


    /**
     * Creates a new collection from the given argument
     * @param arg {var} Selector expression, HTML string, DOM element or list of
     * DOM elements
     * @return {q} Collection
     * @internal
     */
    __getCollectionFromArgument : function(arg) {
      var coll;
      // Collection/array of DOM elements
      if (qx.lang.Type.isArray(arg)) {
        coll = q(arg);
      }
      // HTML string
      else {
        var arr = qx.bom.Html.clean([arg]);
        if (arr.length > 0 && qx.dom.Node.isElement(arr[0])) {
          coll = q(arr);
        }
        // Selector or single element
        else {
          coll = q(arg);
        }
      }

      return coll;
    },


    /**
     * Returns the innermost element of a DOM tree as determined by a simple
     * depth-first search.
     *
     * @param element {Element} Root element
     * @return {Element} innermost element
     * @internal
     */
    __getInnermostElement : function(element)
    {
      if (element.childNodes.length == 0) {
        return element;
      }
      for (var i=0,l=element.childNodes.length; i<l; i++) {
        if (element.childNodes[i].nodeType === 1) {
          return this.__getInnermostElement(element.childNodes[i]);
        }
      }
      return element;
    },


    /**
     * Removes each element in the current collection from the DOM
     *
     * @attach{q}
     * @return {q} The collection for chaining
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
     * @attach{q}
     * @return {q} The collection for chaining
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
     * @attach{q}
     * @param args {String[]|Element[]} HTML string(s) or DOM element(s)
     * @return {q} The collection for chaining
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
     * @attach{q}
     * @param args {String[]|Element[]} HTML string(s) or DOM element(s)
     * @return {q} The collection for chaining
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
     * @attach{q}
     * @return {Number} Current left scroll position
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
     * @attach{q}
     * @return {Number} Current top scroll position
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
     * @attach{q}
     * @param value {Number} Left scroll position
     * @return {q} The collection for chaining
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
     * @attach{q}
     * @param value {Number} Top scroll position
     * @return {q} The collection for chaining
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
     * @attach{q}
     * @return {q} The collection for chaining
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
     * @attach{q}
     * @return {q} The collection for chaining
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
    q.$attachStatic({
      "create" : statics.create
    });

    q.$attach({
      "append" : statics.append,
      "appendTo" : statics.appendTo,
      "remove" : statics.remove,
      "empty" : statics.empty,

      "before" : statics.before,
      "insertBefore" : statics.insertBefore,
      "after" : statics.after,
      "insertAfter" : statics.insertAfter,

      "wrap" : statics.wrap,

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