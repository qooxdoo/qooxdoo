/* ************************************************************************

   qooxdoo - the new era of web development

   http://qooxdoo.org

   Copyright:
     2011-2012 1&1 Internet AG, Germany, http://www.1und1.de

   License:
     MIT: https://opensource.org/licenses/MIT
     See the LICENSE file in the project's top-level directory for details.

   Authors:
     * Martin Wittemann (wittemann)
     * Daniel Wagner (danielwagner)

************************************************************************ */

/**
 * DOM traversal module
 *
 * @require(qx.dom.Hierarchy#getSiblings)
 * @require(qx.dom.Hierarchy#getNextSiblings)
 * @require(qx.dom.Hierarchy#getPreviousSiblings)
 * @require(qx.dom.Hierarchy#contains)
 *
 * @group (Core)
 */
qx.Bootstrap.define("qx.module.Traversing", {
  statics :
  {
    /**
     * String attributes used to determine if two DOM nodes are equal
     * as defined in <a href="http://www.w3.org/TR/DOM-Level-3-Core/core.html#Node3-isEqualNode">
     * DOM Level 3</a>
     */
    EQUALITY_ATTRIBUTES : [
      "nodeType",
      "nodeName",
      "localName",
      "namespaceURI",
      "prefix",
      "nodeValue"
    ],


    /**
     * Internal helper for getAncestors and getAncestorsUntil
     *
     * @attach {qxWeb}
     * @param selector {String} Selector that indicates where to stop including
     * ancestor elements
     * @param filter {String?null} Optional selector to match
     * @return {qxWeb} Collection containing the ancestor elements
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
      return qxWeb.$init(ancestors, qxWeb);
    },



    /**
     * Helper which returns the element from the given argument. If it's a collection,
     * it returns it's first child. If it's a string, it tries to use the string
     * as selector and returns the first child of the new collection.
     * @param arg {Node|String|qxWeb} The element.
     * @return {Node|var} If a node can be extracted, the node element will be return.
     *   If not, at given argument will be returned.
     */
    __getElementFromArgument : function(arg) {
      if (arg instanceof qxWeb) {
        return arg[0];
      } else if (qx.Bootstrap.isString(arg)) {
        return qxWeb(arg)[0];
      }
      return arg;
    },



    /**
     * Helper that attempts to convert the given argument into a DOM node
     * @param arg {var} object to convert
     * @return {Node|null} DOM node or null if the conversion failed
     */
    __getNodeFromArgument : function(arg) {
      if (typeof arg == "string") {
        arg = qxWeb(arg);
      }

      if (arg instanceof Array || arg instanceof qxWeb) {
        arg = arg[0];
      }

      return qxWeb.isNode(arg) ? arg : null;
    },


    /**
     * Returns a map containing the given DOM node's attribute names
     * and values
     *
     * @param node {Node} DOM node
     * @return {Map} Map of attribute names/values
     */
    __getAttributes : function(node) {
      var attributes = {};

      for (var attr in node.attributes) {
        if (attr == "length") {
          continue;
        }
        var name = node.attributes[attr].name;
        var value = node.attributes[attr].value;
        attributes[name] = value;
      }

      return attributes;
    },


    /**
     * Helper function that iterates over a set of items and applies the given
     * qx.dom.Hierarchy method to each entry, storing the results in a new Array.
     * Duplicates are removed and the items are filtered if a selector is
     * provided.
     *
     * @attach{qxWeb}
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
    },


    /**
     * Checks if the given object is a DOM element
     *
     * @attachStatic{qxWeb}
     * @param selector {Object|String|qxWeb} Object to check
     * @return {Boolean} <code>true</code> if the object is a DOM element
     */
    isElement : function(selector) {
      return qx.dom.Node.isElement(qx.module.Traversing.__getElementFromArgument(selector));
    },


    /**
     * Checks if the given object is a DOM node
     *
     * @attachStatic{qxWeb}
     * @param selector {Node|String|qxWeb} Object to check
     * @return {Boolean} <code>true</code> if the object is a DOM node
     */
    isNode : function(selector) {
      return qx.dom.Node.isNode(qx.module.Traversing.__getElementFromArgument(selector));
    },


    /**
     * Whether the node has the given node name
     *
     * @attachStatic{qxWeb}
     * @param selector {Node|String|qxWeb} the node to check
     * @param  nodeName {String} the node name to check for
     * @return {Boolean} <code>true</code> if the node has the given name
     */
    isNodeName : function(selector, nodeName) {
      return qx.dom.Node.isNodeName(qx.module.Traversing.__getElementFromArgument(selector), nodeName);
    },


    /**
     * Checks if the given object is a DOM document object
     *
     * @attachStatic{qxWeb}
     * @param node {Object|qxWeb} Object to check. If the value is a qxWeb
     * collection, isDocument will check the first item.
     * @return {Boolean} <code>true</code> if the object is a DOM document
     */
    isDocument : function(node) {
      if (node instanceof qxWeb) {
        node = node[0];
      }
      return qx.dom.Node.isDocument(node);
    },


    /**
     * Checks if the given object is a DOM document fragment object
     *
     * @attachStatic{qxWeb}
     * @param node {Object|qxWeb} Object to check. If the value is a qxWeb
     * collection, isDocumentFragment will check the first item.
     * @return {Boolean} <code>true</code> if the object is a DOM document fragment
     */
    isDocumentFragment : function(node) {
      if (node instanceof qxWeb) {
        node = node[0];
      }
      return qx.dom.Node.isDocumentFragment(node);
    },


    /**
     * Returns the DOM2 <code>defaultView</code> (window) for the given node.
     *
     * @attachStatic{qxWeb}
     * @param selector {Node|Document|Window|String|qxWeb} Node to inspect
     * @return {Window} the <code>defaultView</code> for the given node
     */
    getWindow : function(selector) {
      return qx.dom.Node.getWindow(qx.module.Traversing.__getElementFromArgument(selector));
    },

    /**
     * Checks whether the given object is a DOM text node
     *
     * @attachStatic{qxWeb}
     * @param obj {Object} the object to be tested
     * @return {Boolean} <code>true</code> if the object is a textNode
     */
    isTextNode : function(obj) {
      return qx.dom.Node.isText(obj);
    },


    /**
     * Check whether the given object is a browser window object.
     *
     * @attachStatic{qxWeb}
     * @param obj {Object|qxWeb} the object to be tested. If the value
     * is a qxWeb collection, isDocument will check the first item.
     * @return {Boolean} <code>true</code> if the object is a window object
     */
    isWindow : function(obj) {
      if (obj instanceof qxWeb) {
        obj = obj[0];
      }
      return qx.dom.Node.isWindow(obj);
    },


    /**
     * Returns the owner document of the given node
     *
     * @attachStatic{qxWeb}
     * @param selector {Node|String|qxWeb} Node to get the document for
     * @return {Document|null} The document of the given DOM node
     */
    getDocument : function(selector) {
      return qx.dom.Node.getDocument(qx.module.Traversing.__getElementFromArgument(selector));
    },

    /**
     * Get the DOM node's name as a lowercase string
     *
     * @attachStatic{qxWeb}
     * @param selector {Node|String|qxWeb} DOM Node
     * @return {String} node name
     */
    getNodeName : function(selector) {
      return qx.dom.Node.getName(qx.module.Traversing.__getElementFromArgument(selector));
    },

    /**
     * Returns the text content of a node where the node type may be one of
     * NODE_ELEMENT, NODE_ATTRIBUTE, NODE_TEXT, NODE_CDATA
     *
     * @attachStatic{qxWeb}
     * @param selector {Node|String|qxWeb} the node from where the search should start. If the
     * node has subnodes the text contents are recursively retrieved and joined
     * @return {String} the joined text content of the given node or null if not
     * appropriate.
     */
    getNodeText : function(selector) {
      return qx.dom.Node.getText(qx.module.Traversing.__getElementFromArgument(selector));
    },

    /**
     * Checks if the given node is a block node
     *
     * @attachStatic{qxWeb}
     * @param selector {Node|String|qxWeb} the node to check
     * @return {Boolean} <code>true</code> if the node is a block node
     */
    isBlockNode : function(selector) {
      return qx.dom.Node.isBlockNode(qx.module.Traversing.__getElementFromArgument(selector));
    },


    /**
     * Determines if two DOM nodes are equal as defined in the
     * <a href="http://www.w3.org/TR/DOM-Level-3-Core/core.html#Node3-isEqualNode">DOM Level 3 isEqualNode spec</a>.
     * Also works in legacy browsers without native <em>isEqualNode</em> support.
     *
     * @attachStatic{qxWeb}
     * @param node1 {String|Element|Element[]|qxWeb} first object to compare
     * @param node2 {String|Element|Element[]|qxWeb} second object to compare
     * @return {Boolean} <code>true</code> if the nodes are equal
     */
    equalNodes : function(node1, node2) {
      node1 = qx.module.Traversing.__getNodeFromArgument(node1);
      node2 = qx.module.Traversing.__getNodeFromArgument(node2);

      if (!node1 || !node2) {
        return false;
      }

      if (qx.core.Environment.get("html.node.isequalnode")) {
        return node1.isEqualNode(node2);
      } else {
        if (node1 === node2) {
          return true;
        }

        // quick attributes length check
        var hasAttributes = node1.attributes && node2.attributes;
        if (hasAttributes &&
            node1.attributes.length !== node2.attributes.length) {
          return false;
        }

        var hasChildNodes = node1.childNodes && node2.childNodes;
        // quick childNodes length check
        if (hasChildNodes &&
            node1.childNodes.length !== node2.childNodes.length) {
          return false;
        }

        // string attribute check
        var domAttributes = qx.module.Traversing.EQUALITY_ATTRIBUTES;
        for (var i=0, l=domAttributes.length; i<l; i++) {
          var domAttrib = domAttributes[i];
          if (node1[domAttrib] !== node2[domAttrib]) {
            return false;
          }
        }

        // attribute values
        if (hasAttributes) {
          var node1Attributes = qx.module.Traversing.__getAttributes(node1);
          var node2Attributes = qx.module.Traversing.__getAttributes(node2);
          for (var attr in node1Attributes) {
            if (node1Attributes[attr] !== node2Attributes[attr]) {
              return false;
            }
          }
        }

        // child nodes
        if (hasChildNodes) {
          for (var j=0, m=node1.childNodes.length; j<m; j++) {
            var child1 = node1.childNodes[j];
            var child2 = node2.childNodes[j];
            if (!qx.module.Traversing.equalNodes(child1, child2)) {
              return false;
            }
          }
        }

        return true;
      }
    }
  },


  members :
  {

    __getAncestors : null,

    /**
     * Adds an element to the collection
     *
     * @attach {qxWeb}
     * @param el {Element|qxWeb} DOM element to add to the collection.
     * If a collection is given, only the first element will be added
     * @return {qxWeb} The collection for chaining
     */
    add : function(el) {
      if (el instanceof qxWeb) {
        el = el[0];
      }
      if (qx.module.Traversing.isElement(el) ||
          qx.module.Traversing.isDocument(el) ||
          qx.module.Traversing.isWindow(el) ||
          qx.module.Traversing.isDocumentFragment(el))
      {
        this.push(el);
      }
      return this;
    },


    /**
     * Gets a set of elements containing all of the unique immediate children of
     * each of the matched set of elements.
     * This set can be filtered with an optional expression that will cause only
     * elements matching the selector to be collected.
     *
     * @attach {qxWeb}
     * @param selector {String?null} Optional selector to match
     * @return {qxWeb} Collection containing the child elements
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
      return qxWeb.$init(children, qxWeb);
    },


    /**
     * Executes the provided callback function once for each item in the
     * collection.
     *
     * @attach {qxWeb}
     * @param fn {Function} Callback function which is called with two parameters
     * <ul>
     *  <li>current item - DOM node</li>
     *  <li>current index - Number</li>
     * </ul>
     * @param ctx {Object} Context object
     * @return {qxWeb} The collection for chaining
     */
    forEach : function(fn, ctx) {
      for (var i=0; i < this.length; i++) {
        fn.call(ctx, this[i], i, this);
      };
      return this;
    },


    /**
     * Gets a set of elements containing the parent of each element in the
     * collection.
     * This set can be filtered with an optional expression that will cause only
     * elements matching the selector to be collected.
     *
     * @attach {qxWeb}
     * @param selector {String?null} Optional selector to match
     * @return {qxWeb} Collection containing the parent elements
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
      return qxWeb.$init(parents, qxWeb);
    },


    /**
    * Checks if any element of the current collection is child of any element of a given
    * parent collection.
    *
    * @attach{qxWeb}
    * @param parent {qxWeb | String} Collection or selector of the parent collection to check.
    * @return {Boolean} Returns true if at least one element of the current collection is child of the parent collection
    *
    */
    isChildOf : function(parent){
      if(this.length == 0){
        return false;
      }
      var ancestors = null, parentCollection = qxWeb(parent), isChildOf = false;
      for(var i = 0, l = this.length; i < l && !isChildOf; i++){
        ancestors = qxWeb(this[i]).getAncestors();
        for(var j = 0, len = parentCollection.length; j < len; j++){
          if(ancestors.indexOf(parentCollection[j]) != -1){
            isChildOf = true;
            break;
          }
        };
      }
      return isChildOf;
    },


    /**
     * Gets a set of elements containing all ancestors of each element in the
     * collection.
     * This set can be filtered with an optional expression that will cause only
     * elements matching the selector to be collected.
     *
     * @attach {qxWeb}
     * @param filter {String?null} Optional selector to match
     * @return {qxWeb} Collection containing the ancestor elements
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
     * @attach {qxWeb}
     * @param selector {String} Selector that indicates where to stop including
     * ancestor elements
     * @param filter {String?null} Optional selector to match
     * @return {qxWeb} Collection containing the ancestor elements
     */
    getAncestorsUntil : function(selector, filter) {
      return this.__getAncestors(selector, filter);
    },


    /**
     * Gets a set containing the closest matching ancestor for each item in
     * the collection.
     * If the item itself matches, it is added to the new set. Otherwise, the
     * item's parent chain will be traversed until a match is found.
     *
     * @attach {qxWeb}
     * @param selector {String} Selector expression to match
     * @return {qxWeb} New collection containing the closest matching ancestors
     */
    getClosest : function(selector) {
      var closest = [];

      var findClosest = function(current) {
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
        findClosest(qxWeb(this[i]));
      };

      return qxWeb.$init(closest, qxWeb);
    },


    /**
     * Searches the child elements of each item in the collection and returns
     * a new collection containing the children that match the provided selector
     *
     * @attach {qxWeb}
     * @param selector {String} Selector expression to match the child elements
     * against
     * @return {qxWeb} New collection containing the matching child elements
     */
    find : function(selector) {
      var found = [];
      for (var i=0; i < this.length; i++) {
        found = found.concat(qx.bom.Selector.query(selector, this[i]));
      };
      return qxWeb.$init(found, qxWeb);
    },


    /**
     * Gets a new set of elements containing the child nodes of each item in the
     * current set.
     *
     * @attach {qxWeb}
     * @return {qxWeb} New collection containing the child nodes
     */
    getContents : function() {
      var found = [];
      this._forEachElement(function(item) {
        found = found.concat(qx.lang.Array.fromCollection(item.childNodes));
      });
      return qxWeb.$init(found, qxWeb);
    },


    /**
     * Checks if at least one element in the collection passes the provided
     * filter. This can be either a selector expression or a filter
     * function
     *
     * @attach {qxWeb}
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
     * @attach {qxWeb}
     * @param index {Number} The position of the element in the collection
     * @return {qxWeb} A new collection containing one element
     */
    eq : function(index) {
      return this.slice(index, +index + 1);
    },


    /**
     * Reduces the collection to the first element.
     *
     * @attach {qxWeb}
     * @return {qxWeb} A new collection containing one element
     */
    getFirst : function() {
      return this.slice(0, 1);
    },


    /**
     * Reduces the collection to the last element.
     *
     * @attach {qxWeb}
     * @return {qxWeb} A new collection containing one element
     */
    getLast : function() {
      return this.slice(this.length - 1);
    },


    /**
     * Gets a collection containing only the elements that have descendants
     * matching the given selector
     *
     * @attach {qxWeb}
     * @param selector {String} Selector expression
     * @return {qxWeb} a new collection containing only elements with matching descendants
     */
    has : function(selector) {
      var found = [];
      this._forEachElement(function(item, index) {
        var descendants = qx.bom.Selector.matches(selector, this.eq(index).getContents());
        if (descendants.length > 0) {
          found.push(item);
        }
      });

      return qxWeb.$init(found, this.constructor);
    },


    /**
     * Returns a new collection containing only those nodes that
     * contain the given element. Also accepts a qxWeb
     * collection or an Array of elements. In those cases, the first element
     * in the list is used.
     *
     * @attach {qxWeb}
     * @param element {Element|Window|Element[]|qxWeb} element to check for.
     * @return {qxWeb} Collection with matching items
     */
    contains : function(element) {
      // qxWeb does not inherit from Array in IE
      if (element instanceof Array || element instanceof qxWeb) {
        element = element[0];
      }

      if (!element) {
        return qxWeb();
      }

      if (qx.dom.Node.isWindow(element)) {
        element = element.document;
      }

      return this.filter(function(el) {
        if (qx.dom.Node.isWindow(el)) {
          el = el.document;
        }
        return qx.dom.Hierarchy.contains(el, element);
      });
    },


    /**
     * Gets a collection containing the next sibling element of each item in
     * the current set.
     * This set can be filtered with an optional expression that will cause only
     * elements matching the selector to be collected.
     *
     * @attach {qxWeb}
     * @param selector {String?} Optional selector expression
     * @return {qxWeb} New set containing next siblings
     */
    getNext : function(selector) {
      var found = this.map(qx.dom.Hierarchy.getNextElementSibling, qx.dom.Hierarchy);
      if (selector) {
        found = qxWeb.$init(qx.bom.Selector.matches(selector, found), qxWeb);
      }
      return found;
    },


    /**
     * Gets a collection containing all following sibling elements of each
     * item in the current set.
     * This set can be filtered with an optional expression that will cause only
     * elements matching the selector to be collected.
     *
     * @attach {qxWeb}
     * @param selector {String?} Optional selector expression
     * @return {qxWeb} New set containing following siblings
     */
    getNextAll : function(selector) {
      var ret = qx.module.Traversing.__hierarchyHelper(this, "getNextSiblings", selector);
      return qxWeb.$init(ret, qxWeb);
    },


    /**
     * Gets a collection containing the following sibling elements of each
     * item in the current set up to but not including any element that matches
     * the given selector.
     *
     * @attach {qxWeb}
     * @param selector {String?} Optional selector expression
     * @return {qxWeb} New set containing following siblings
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

      return qxWeb.$init(found, qxWeb);
    },


    /**
     * Gets a collection containing the previous sibling element of each item in
     * the current set.
     * This set can be filtered with an optional expression that will cause only
     * elements matching the selector to be collected.
     *
     * @attach {qxWeb}
     * @param selector {String?} Optional selector expression
     * @return {qxWeb} New set containing previous siblings
     */
    getPrev : function(selector) {
      var found = this.map(qx.dom.Hierarchy.getPreviousElementSibling, qx.dom.Hierarchy);
      if (selector) {
        found = qxWeb.$init(qx.bom.Selector.matches(selector, found), qxWeb);
      }
      return found;
    },


    /**
     * Gets a collection containing all preceding sibling elements of each
     * item in the current set.
     * This set can be filtered with an optional expression that will cause only
     * elements matching the selector to be collected.
     *
     * @attach {qxWeb}
     * @param selector {String?} Optional selector expression
     * @return {qxWeb} New set containing preceding siblings
     */
    getPrevAll : function(selector) {
      var ret = qx.module.Traversing.__hierarchyHelper(this, "getPreviousSiblings", selector);
      return qxWeb.$init(ret, qxWeb);
    },


    /**
     * Gets a collection containing the preceding sibling elements of each
     * item in the current set up to but not including any element that matches
     * the given selector.
     *
     * @attach {qxWeb}
     * @param selector {String?} Optional selector expression
     * @return {qxWeb} New set containing preceding siblings
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

      return qxWeb.$init(found, qxWeb);
    },


    /**
     * Gets a collection containing all sibling elements of the items in the
     * current set.
     * This set can be filtered with an optional expression that will cause only
     * elements matching the selector to be collected.
     *
     * @attach {qxWeb}
     * @param selector {String?} Optional selector expression
     * @return {qxWeb} New set containing sibling elements
     */
    getSiblings : function(selector) {
      var ret = qx.module.Traversing.__hierarchyHelper(this, "getSiblings", selector);
      return qxWeb.$init(ret, qxWeb);
    },


    /**
     * Remove elements from the collection that do not pass the given filter.
     * This can be either a selector expression or a filter function
     *
     * @attach {qxWeb}
     * @param selector {String|Function} Selector or filter function
     * @return {qxWeb} Reduced collection
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
     * @attach {qxWeb}
     * @return {qxWeb} New collection containing offset parents
     */
    getOffsetParent : function() {
      return this.map(qx.bom.element.Location.getOffsetParent);
    },


    /**
     * Whether the first element in the collection is inserted into
     * the document for which it was created.
     *
     * @attach {qxWeb}
     * @return {Boolean} <code>true</code> when the element is inserted
     *    into the document.
     */
    isRendered : function() {
      if (!this[0]) {
        return false;
      }
      return qx.dom.Hierarchy.isRendered(this[0]);
    }
  },


  defer : function(statics) {
    qxWeb.$attachAll(this);
    // manually attach private method which is ignored by attachAll
    qxWeb.$attach({
      "__getAncestors" : statics.__getAncestors
    });
  }
});
