/* ************************************************************************

   qooxdoo - the new era of web development

   http://qooxdoo.org

   Copyright:
     2004-2008 1&1 Internet AG, Germany, http://www.1und1.de

   License:
     LGPL: http://www.gnu.org/licenses/lgpl.html
     EPL: http://www.eclipse.org/org/documents/epl-v10.php
     See the LICENSE file in the project's top-level directory for details.

   Authors:
     * Sebastian Werner (wpbasti)

   ======================================================================

   This class contains code based on the following work:

   * Prototype JS
     http://www.prototypejs.org/
     Version 1.5

     Copyright:
       (c) 2006-2007, Prototype Core Team

     License:
       MIT: http://www.opensource.org/licenses/mit-license.php

     Authors:
       * Prototype Core Team

   ----------------------------------------------------------------------

     Copyright (c) 2005-2008 Sam Stephenson

     Permission is hereby granted, free of charge, to any person
     obtaining a copy of this software and associated documentation
     files (the "Software"), to deal in the Software without restriction,
     including without limitation the rights to use, copy, modify, merge,
     publish, distribute, sublicense, and/or sell copies of the Software,
     and to permit persons to whom the Software is furnished to do so,
     subject to the following conditions:

     THE SOFTWARE IS PROVIDED "AS IS", WITHOUT WARRANTY OF ANY KIND,
     EXPRESS OR IMPLIED, INCLUDING BUT NOT LIMITED TO THE WARRANTIES OF
     MERCHANTABILITY, FITNESS FOR A PARTICULAR PURPOSE AND
     NONINFRINGEMENT. IN NO EVENT SHALL THE AUTHORS OR COPYRIGHT
     HOLDERS BE LIABLE FOR ANY CLAIM, DAMAGES OR OTHER LIABILITY,
     WHETHER IN AN ACTION OF CONTRACT, TORT OR OTHERWISE, ARISING FROM,
     OUT OF OR IN CONNECTION WITH THE SOFTWARE OR THE USE OR OTHER
     DEALINGS IN THE SOFTWARE.

************************************************************************ */

/**
 * Methods to operate on nodes and elements on a DOM tree. This contains
 * special getters to query for child nodes, siblings, etc. This class also
 * supports to operate on one element and reorganize the content with
 * the insertion of new HTML or nodes.
 */
qx.Bootstrap.define("qx.dom.Hierarchy",
{
  statics :
  {
    /**
     * Returns the DOM index of the given node
     *
     * @param node {Node} Node to look for
     * @return {Integer} The DOM index
     */
    getNodeIndex : function(node)
    {
      var index = 0;

      while (node && (node = node.previousSibling)) {
        index++;
      }

      return index;
    },


    /**
     * Returns the DOM index of the given element (ignoring non-elements)
     *
     * @param element {Element} Element to look for
     * @return {Integer} The DOM index
     */
    getElementIndex : function(element)
    {
      var index = 0;
      var type = qx.dom.Node.ELEMENT;

      while (element && (element = element.previousSibling))
      {
        if (element.nodeType == type) {
          index++;
        }
      }

      return index;
    },


    /**
     * Return the next element to the supplied element
     *
     * "nextSibling" is not good enough as it might return a text or comment element
     *
     * @param element {Element} Starting element node
     * @return {Element | null} Next element node
     */
    getNextElementSibling : function(element)
    {
      while (element && (element = element.nextSibling) && !qx.dom.Node.isElement(element)) {
        continue;
      }

      return element || null;
    },


    /**
     * Return the previous element to the supplied element
     *
     * "previousSibling" is not good enough as it might return a text or comment element
     *
     * @param element {Element} Starting element node
     * @return {Element | null} Previous element node
     */
    getPreviousElementSibling : function(element)
    {
      while (element && (element = element.previousSibling) && !qx.dom.Node.isElement(element)) {
        continue;
      }

      return element || null;
    },


    /**
     * Whether the first element contains the second one
     *
     * Uses native non-standard contains() in Internet Explorer,
     * Opera and Webkit (supported since Safari 3.0 beta)
     *
     * @param element {Element} Parent element
     * @param target {Node} Child node
     * @return {Boolean}
     */
    contains : function(element, target)
    {
      if (qx.core.Environment.get("html.element.contains")) {
        if (qx.dom.Node.isDocument(element))
        {
          var doc = qx.dom.Node.getDocument(target);
          return element && doc == element;
        }
        else if (qx.dom.Node.isDocument(target))
        {
          return false;
        }
        else
        {
          return element.contains(target);
        }
      }
      else if (qx.core.Environment.get("html.element.compareDocumentPosition")) {
        // http://developer.mozilla.org/en/docs/DOM:Node.compareDocumentPosition
        return !!(element.compareDocumentPosition(target) & 16);
      }
      else {
        while(target)
        {
          if (element == target) {
            return true;
          }

          target = target.parentNode;
        }

        return false;
      }
    },

    /**
     * Whether the element is inserted into the document
     * for which it was created.
     *
     * @param element {Element} DOM element to check
     * @return {Boolean} <code>true</code> when the element is inserted
     *    into the document.
     */
    isRendered : function(element)
    {
      var doc = element.ownerDocument || element.document;

      if (qx.core.Environment.get("html.element.contains")) {
        // Fast check for all elements which are not in the DOM
        if (!element.parentNode || !element.offsetParent) {
          return false;
        }

        return doc.body.contains(element);
      }
      else if (qx.core.Environment.get("html.element.compareDocumentPosition")) {
        // Gecko way, DOM3 method
        return !!(doc.compareDocumentPosition(element) & 16);
      }
      else {
        while(element)
        {
          if (element == doc.body) {
            return true;
          }

          element = element.parentNode;
        }

        return false;
      }
    },


    /**
     * Checks if <code>element</code> is a descendant of <code>ancestor</code>.
     *
     * @param element {Element} first element
     * @param ancestor {Element} second element
     * @return {Boolean} Element is a descendant of ancestor
     */
    isDescendantOf : function(element, ancestor) {
      return this.contains(ancestor, element);
    },


    /**
     * Get the common parent element of two given elements. Returns
     * <code>null</code> when no common element has been found.
     *
     * Uses native non-standard contains() in Opera and Internet Explorer
     *
     * @param element1 {Element} First element
     * @param element2 {Element} Second element
     * @return {Element} the found parent, if none was found <code>null</code>
     */
    getCommonParent : function(element1, element2)
    {
      if (element1 === element2) {
        return element1;
      }

      if (qx.core.Environment.get("html.element.contains")) {
        while (element1 && qx.dom.Node.isElement(element1))
        {
          if (element1.contains(element2)) {
            return element1;
          }

          element1 = element1.parentNode;
        }

        return null;
      }
      else {
        var known = [];

        while (element1 || element2)
        {
          if (element1)
          {
            if (qx.lang.Array.contains(known, element1)) {
              return element1;
            }

            known.push(element1);
            element1 = element1.parentNode;
          }

          if (element2)
          {
            if (qx.lang.Array.contains(known, element2)) {
              return element2;
            }

            known.push(element2);
            element2 = element2.parentNode;
          }
        }

        return null;
      }
    },


    /**
     * Collects all of element's ancestors and returns them as an array of
     * elements.
     *
     * @param element {Element} DOM element to query for ancestors
     * @return {Array} list of all parents
     */
    getAncestors : function(element) {
      return this._recursivelyCollect(element, "parentNode");
    },


    /**
     * Returns element's children.
     *
     * @param element {Element} DOM element to query for child elements
     * @return {Array} list of all child elements
     */
    getChildElements : function(element)
    {
      element = element.firstChild;

      if (!element) {
        return [];
      }

      var arr = this.getNextSiblings(element);

      if (element.nodeType === 1) {
        arr.unshift(element);
      }

      return arr;
    },


    /**
     * Collects all of element's descendants (deep) and returns them as an array
     * of elements.
     *
     * @param element {Element} DOM element to query for child elements
     * @return {Array} list of all found elements
     */
    getDescendants : function(element) {
      return qx.lang.Array.fromCollection(element.getElementsByTagName("*"));
    },


    /**
     * Returns the first child that is an element. This is opposed to firstChild DOM
     * property which will return any node (whitespace in most usual cases).
     *
     * @param element {Element} DOM element to query for first descendant
     * @return {Element} the first descendant
     */
    getFirstDescendant : function(element)
    {
      element = element.firstChild;

      while (element && element.nodeType != 1) {
        element = element.nextSibling;
      }

      return element;
    },


    /**
     * Returns the last child that is an element. This is opposed to lastChild DOM
     * property which will return any node (whitespace in most usual cases).
     *
     * @param element {Element} DOM element to query for last descendant
     * @return {Element} the last descendant
     */
    getLastDescendant : function(element)
    {
      element = element.lastChild;

      while (element && element.nodeType != 1) {
        element = element.previousSibling;
      }

      return element;
    },


    /**
     * Collects all of element's previous siblings and returns them as an array of elements.
     *
     * @param element {Element} DOM element to query for previous siblings
     * @return {Array} list of found DOM elements
     */
    getPreviousSiblings : function(element) {
      return this._recursivelyCollect(element, "previousSibling");
    },


    /**
     * Collects all of element's next siblings and returns them as an array of
     * elements.
     *
     * @param element {Element} DOM element to query for next siblings
     * @return {Array} list of found DOM elements
     */
    getNextSiblings : function(element) {
      return this._recursivelyCollect(element, "nextSibling");
    },


    /**
     * Recursively collects elements whose relationship is specified by
     * property.  <code>property</code> has to be a property (a method won't
     * do!) of element that points to a single DOM node. Returns an array of
     * elements.
     *
     * @param element {Element} DOM element to start with
     * @param property {String} property to look for
     * @return {Array} result list
     */
    _recursivelyCollect : function(element, property)
    {
      var list = [];

      while (element = element[property])
      {
        if (element.nodeType == 1) {
          list.push(element);
        }
      }

      return list;
    },


    /**
     * Collects all of element's siblings and returns them as an array of elements.
     *
     * @param element {var} DOM element to start with
     * @return {Array} list of all found siblings
     */
    getSiblings : function(element) {
      return this.getPreviousSiblings(element).reverse().concat(this.getNextSiblings(element));
    },


    /**
     * Whether the given element is empty.
     * Inspired by Base2 (Dean Edwards)
     *
     * @param element {Element} The element to check
     * @return {Boolean} true when the element is empty
     */
    isEmpty : function(element)
    {
      element = element.firstChild;

      while (element)
      {
        if (element.nodeType === qx.dom.Node.ELEMENT || element.nodeType === qx.dom.Node.TEXT) {
          return false;
        }

        element = element.nextSibling;
      }

      return true;
    },


    /**
     * Removes all of element's text nodes which contain only whitespace
     *
     * @param element {Element} Element to cleanup
     * @return {void}
     */
    cleanWhitespace : function(element)
    {
      var node = element.firstChild;

      while (node)
      {
        var nextNode = node.nextSibling;

        if (node.nodeType == 3 && !/\S/.test(node.nodeValue)) {
          element.removeChild(node);
        }

        node = nextNode;
      }
    }
  }
});
