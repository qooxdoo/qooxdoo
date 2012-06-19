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

/* ************************************************************************
#require(qx.dom.Hierarchy#getSiblings)
#require(qx.dom.Hierarchy#getNextSiblings)
#require(qx.dom.Hierarchy#getPreviousSiblings)
************************************************************************ */

/**
 * DOM traversal module
 */
qx.Bootstrap.define("qx.module.Traversing", {
  statics :
  {
    /**
     * Adds an element to the collection
     *
     * @attach {q}
     * @param el {Element} DOM element to add to the collection
     * @return {q} The collection for chaining
     */
    add : function(el) {
      this.push(el);
      return this;
    },


    /**
     * Gets a set of elements containing all of the unique immediate children of
     * each of the matched set of elements.
     * This set can be filtered with an optional expression that will cause only
     * elements matching the selector to be collected.
     *
     * @attach {q}
     * @param selector {String?null} Optional selector to match
     * @return {q} Collection containing the child elements
     */
    getChildren : function(selector) {
      var children = [];
      for (var i=0; i < this.length; i++) {
        var found = qx.dom.Hierarchy.getChildElements(this[i]);
        if (selector) {
          found = qx.bom.Selector.matches(selector, found);
        }
        children = children.concat(found);
      };
      return q.$init(children);
    },


    /**
     * Executes the provided callback function once for each item in the
     * collection. @see qx.type.BaseArray#forEach
     *
     * @attach {q}
     * @param fn {Function} Callback function
     * @param ctx {Obj} Context object
     * @return {q} The collection for chaining
     */
    forEach : function(fn, ctx) {
      for (var i=0; i < this.length; i++) {
        fn.call(ctx, this[i], i, this);
      };
      return this;
    },


    /**
     * Returns a copy of the collection within the given range.
     *
     * @attach {q}
     * @param begin {Number} The index to begin.
     * @param end {Number?} The index to end.
     * @return {q} A new collection containing a slice of the original collection.
     */
    slice : function(begin, end) {
      // Old IEs return an empty array if the second argument is undefined
      if (end) {
        return q.$init(Array.prototype.slice.call(this, begin, end));
      }
      else {
        return q.$init(Array.prototype.slice.call(this, begin));
      }
    },


    /**
     * Gets a set of elements containing the parent of each element in the
     * collection.
     * This set can be filtered with an optional expression that will cause only
     * elements matching the selector to be collected.
     *
     * @attach {q}
     * @param selector {String?null} Optional selector to match
     * @return {q} Collection containing the parent elements
     */
    getParents : function(selector) {
      var parents = [];
      for (var i=0; i < this.length; i++) {
        var found = qx.dom.Element.getParentElement(this[i]);
        if (selector) {
          found = qx.bom.Selector.matches(selector, [found]);
        }
        parents = parents.concat(found);
      };
      return q.$init(parents);
    },


    /**
     * Gets a set of elements containing all ancestors of each element in the
     * collection.
     * This set can be filtered with an optional expression that will cause only
     * elements matching the selector to be collected.
     *
     * @attach {q}
     * @param filter {String?null} Optional selector to match
     * @return {q} Collection containing the ancestor elements
     */
    getAncestors : function(filter) {
      return this.__getAncestors(null, filter);
    },


    /**
     * Gets a set of elements containing all ancestors of each element in the
     * collection, up to (but not including) the element matched by the provided
     * selector.
     * This set can be filtered with an optional expression that will cause only
     * elements matching the selector to be collected.
     *
     * @attach {q}
     * @param selector {String} Selector that indicates where to stop including
     * ancestor elements
     * @param filter {String?null} Optional selector to match
     * @return {q} Collection containing the ancestor elements
     */
    getAncestorsUntil : function(selector, filter) {
      return this.__getAncestors(selector, filter);
    },


    /**
     * Internal helper for getAncestors and getAncestorsUntil
     *
     * @attach {q}
     * @param selector {String} Selector that indicates where to stop including
     * ancestor elements
     * @param filter {String?null} Optional selector to match
     * @return {q} Collection containing the ancestor elements
     * @internal
     */
    __getAncestors : function(selector, filter) {
      var ancestors = [];
      for (var i=0; i < this.length; i++) {
        var parent = qx.dom.Element.getParentElement(this[i]);
        while (parent) {
          var found = [parent];
          if (selector && qx.bom.Selector.matches(selector, found).length > 0) {
            break;
          }
          if (filter) {
            found = qx.bom.Selector.matches(filter, found);
          }
          ancestors = ancestors.concat(found);
          parent = qx.dom.Element.getParentElement(parent);
        }
      }
      return q.$init(ancestors);
    },


    /**
     * Gets a set containing the closest matching ancestor for each item in
     * the collection.
     * If the item itself matches, it is added to the new set. Otherwise, the
     * item's parent chain will be traversed until a match is found.
     *
     * @attach {q}
     * @param selector {String} Selector expression to match
     * @return {q} New collection containing the closest matching ancestors
     */
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
        findClosest(q(this[i]));
      };

      return q.$init(closest);
    },


    /**
     * Searches the child elements of each item in the collection and returns
     * a new collection containing the children that match the provided selector
     *
     * @attach {q}
     * @param selector {String} Selector expression to match the child elements
     * against
     * @return {q} New collection containing the matching child elements
     */
    find : function(selector) {
      var found = [];
      for (var i=0; i < this.length; i++) {
        found = found.concat(qx.bom.Selector.query(selector, this[i]));
      };
      return q.$init(found);
    },


    /**
     * Gets a new collection containing only those elements that passed the
     * given filter. This can be either a selector expression or a filter
     * function.
     *
     * @attach {q}
     * @param selector {String|Function} Selector expression or filter function
     * @return {q} New collection containing the elements that passed the filter
     */
    filter : function(selector) {
      if (qx.lang.Type.isFunction(selector)) {
        return qx.type.BaseArray.prototype.filter.call(this, selector);
      }
      /*
       * This works but isn't currently needed:
      if (qx.dom.Node.isElement(selector)) {
        for (var i=0; i < this.length; i++) {
          if (this[i] == selector) {
            return q.$init([this[i]]);
          }
        }
      }
      */
      return q.$init(qx.bom.Selector.matches(selector, this));
    },


    /**
     * Gets a new set of elements containing the child nodes of each item in the
     * current set.
     *
     * @attach {q}
     * @return {q} New collection containing the child nodes
     */
    getContents : function() {
      var found = [];
      for (var i=0; i < this.length; i++) {
        found = found.concat(qx.lang.Array.fromCollection(this[i].childNodes));
      }
      return q.$init(found);
    },


    /**
     * Checks if at least one element in the collection passes the provided
     * filter. This can be either a selector expression or a filter
     * function @see qx.type.BaseArray#filter
     *
     * @attach {q}
     * @param selector {String|Function} Selector expression or filter function
     * @return {Boolean} <code>true</code> if at least one element matches
     */
    is : function(selector) {
      if (qx.lang.Type.isFunction(selector)) {
        return this.filter(selector).length > 0;
      }
      return !!selector && qx.bom.Selector.matches(selector, this).length > 0;
    },


    /**
     * Reduce the set of matched elements to a single element.
     *
     * @attach {q}
     * @param index {Number} The position of the element in the collection
     * @return {q} A new collection containing one element
     */
    eq : function(index) {
      return this.slice(index, +index + 1);
    },


    /**
     * Reduces the collection to the first element.
     *
     * @attach {q}
     * @return {q} A new collection containing one element
     */
    getFirst : function() {
      return this.slice(0, 1);
    },


    /**
     * Reduces the collection to the last element.
     *
     * @attach {q}
     * @return {q} A new collection containing one element
     */
    getLast : function() {
      return this.slice(this.length - 1);
    },


    /**
     * Gets a collection containing only the elements that have descendants
     * matching the given selector
     *
     * @attach {q}
     * @param selector {String} Selector expression
     * @return {q} a new collection containing only elements with matching descendants
     */
    has : function(selector) {
      var found = [];
      for (var i=0; i < this.length; i++) {
        var descendants = qx.bom.Selector.matches(selector, this.eq(i).getContents())
        if (descendants.length > 0) {
          found.push(this[i]);
        }
      }
      return q.$init(found);
    },


    /**
     * Gets a collection containing the next sibling element of each item in
     * the current set (ignoring text and comment nodes).
     * This set can be filtered with an optional expression that will cause only
     * elements matching the selector to be collected.
     *
     * @attach {q}
     * @param selector {String?} Optional selector expression
     * @return {q} New set containing next siblings
     */
    getNext : function(selector) {
      var found = this.map(qx.dom.Hierarchy.getNextElementSibling, qx.dom.Hierarchy);
      if (selector) {
        found = qx.bom.Selector.matches(selector, found);
      }
      return found;
    },


    /**
     * Gets a collection containing all following sibling elements of each
     * item in the current set (ignoring text and comment nodes).
     * This set can be filtered with an optional expression that will cause only
     * elements matching the selector to be collected.
     *
     * @attach {q}
     * @param selector {String?} Optional selector expression
     * @return {q} New set containing following siblings
     */
    getNextAll : function(selector) {
      var ret = qx.module.Traversing.__hierarchyHelper(this, "getNextSiblings", selector);
      return q.$init(ret);
    },


    /**
     * Gets a collection containing the following sibling elements of each
     * item in the current set (ignoring text and comment nodes) up to but not
     * including any element that matches the given selector.
     *
     * @attach {q}
     * @param selector {String?} Optional selector expression
     * @return {q} New set containing following siblings
     */
    getNextUntil : function(selector) {
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

      return q.$init(found);
    },


    /**
     * Gets a collection containing the previous sibling element of each item in
     * the current set (ignoring text and comment nodes).
     * This set can be filtered with an optional expression that will cause only
     * elements matching the selector to be collected.
     *
     * @attach {q}
     * @param selector {String?} Optional selector expression
     * @return {q} New set containing previous siblings
     */
    getPrev : function(selector) {
      var found = this.map(qx.dom.Hierarchy.getPreviousElementSibling, qx.dom.Hierarchy);
      if (selector) {
        found = qx.bom.Selector.matches(selector, found);
      }
      return found;
    },


    /**
     * Gets a collection containing all preceding sibling elements of each
     * item in the current set (ignoring text and comment nodes).
     * This set can be filtered with an optional expression that will cause only
     * elements matching the selector to be collected.
     *
     * @attach {q}
     * @param selector {String?} Optional selector expression
     * @return {q} New set containing preceding siblings
     */
    getPrevAll : function(selector) {
      var ret = qx.module.Traversing.__hierarchyHelper(this, "getPreviousSiblings", selector);
      return q.$init(ret);
    },


    /**
     * Gets a collection containing the preceding sibling elements of each
     * item in the current set (ignoring text and comment nodes) up to but not
     * including any element that matches the given selector.
     *
     * @attach {q}
     * @param selector {String?} Optional selector expression
     * @return {q} New set containing preceding siblings
     */
    getPrevUntil : function(selector) {
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

      return q.$init(found);
    },


    /**
     * Gets a collection containing all sibling elements of the items in the
     * current set.
     * This set can be filtered with an optional expression that will cause only
     * elements matching the selector to be collected.
     *
     * @attach {q}
     * @param selector {String?} Optional selector expression
     * @return {q} New set containing sibling elements
     */
    getSiblings : function(selector) {
      var ret = qx.module.Traversing.__hierarchyHelper(this, "getSiblings", selector);
      return q.$init(ret);
    },


    /**
     * Remove elements from the collection that do not pass the given filter.
     * This can be either a selector expression or a filter function
     * @see qx.type.BaseArray#filter
     *
     * @attach {q}
     * @param selector {String|Function} Selector or filter function
     * @return {q} Reduced collection
     */
    not : function(selector) {
      if (qx.lang.Type.isFunction(selector)) {
        return this.filter(function(item, index, obj) {
          return !selector(item, index, obj);
        });
      }

      var res = qx.bom.Selector.matches(selector, this);
      return this.filter(function(value) {
        return res.indexOf(value) === -1;
      });
    },


    /**
     * Gets a new collection containing the offset parent of each item in the
     * current set.
     *
     * @attach {q}
     * @return {q} New collection containing offset parents
     */
    getOffsetParent : function() {
      return this.map(qx.bom.element.Location.getOffsetParent);
    },


    /**
     * Checks if the given object is a DOM element
     *
     * @attachStatic{q}
     * @param element {Object} Object to check
     * @return {Boolean} <code>true</code> if the object is a DOM element
     */
    isElement : function(element) {
      return qx.dom.Node.isElement(element);
    },


    /**
     * Checks if the given object is a DOM node
     *
     * @attachStatic{q}
     * @param node {Object} Object to check
     * @return {Boolean} <code>true</code> if the object is a DOM node
     */
    isNode : function(node) {
      return qx.dom.Node.isNode(node);
    },


    /**
     * Checks if the given object is a DOM document object
     *
     * @attachStatic{q}
     * @param node {Object} Object to check
     * @return {Boolean} <code>true</code> if the object is a DOM document
     */
    isDocument : function(node) {
      return qx.dom.Node.isDocument(node);
    },


    /**
     * Returns the DOM2 <code>defaultView</code> (window) for the given node.
     *
     * @attachStatic{q}
     * @param node {Node|Document|Window} Node to inspect
     * @return {Window} the <code>defaultView</code> for the given node
     */
    getWindow : function(node) {
      return qx.dom.Node.getWindow(node);
    },


    /**
     * Returns the owner document of the given node
     *
     * @attachStatic{q}
     * @param node {Node } Node to get the document for
     * @return {Document|null} The document of the given DOM node
     */
    getDocument : function(node) {
      return qx.dom.Node.getDocument(node);
    },


    /**
     * Helper function that iterates over a set of items and applies the given
     * qx.dom.Hierarchy method to each entry, storing the results in a new Array.
     * Duplicates are removed and the items are filtered if a selector is
     * provided.
     *
     * @attach{q}
     * @param collection {Array} Collection to iterate over (any Array-like object)
     * @param method {String} Name of the qx.dom.Hierarchy method to apply
     * @param selector {String?} Optional selector that elements to be included
     * must match
     * @return {Array} Result array
     * @internal
     */
    __hierarchyHelper : function(collection, method, selector)
    {
      // Iterate ourself, as we want to directly combine the result
      var all = [];
      var Hierarchy = qx.dom.Hierarchy;
      for (var i=0, l=collection.length; i<l; i++) {
        all.push.apply(all, Hierarchy[method](collection[i]));
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
    q.$attach({
      "add" : statics.add,
      "getChildren" : statics.getChildren,
      "forEach" : statics.forEach,
      "slice" : statics.slice,
      "getParents" : statics.getParents,
      "getAncestors" : statics.getAncestors,
      "getAncestorsUntil" : statics.getAncestorsUntil,
      "__getAncestors" : statics.__getAncestors,
      "getClosest" : statics.getClosest,
      "find" : statics.find,
      "filter" : statics.filter,
      "getContents" : statics.getContents,
      "is" : statics.is,
      "eq" : statics.eq,
      "getFirst" : statics.getFirst,
      "getLast" : statics.getLast,
      "has" : statics.has,
      "getNext" : statics.getNext,
      "getNextAll" : statics.getNextAll,
      "getNextUntil" : statics.getNextUntil,
      "getPrev" : statics.getPrev,
      "getPrevAll" : statics.getPrevAll,
      "getPrevUntil" : statics.getPrevUntil,
      "getSiblings" : statics.getSiblings,
      "not" : statics.not,
      "getOffsetParent" : statics.getOffsetParent
    });

    q.$attachStatic({
      "isElement" : statics.isElement,
      "isNode" : statics.isNode,
      "isDocument" : statics.isDocument,
      "getDocument" : statics.getDocument,
      "getWindow" : statics.getWindow
    });
  }
});