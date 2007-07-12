/* ************************************************************************

   qooxdoo - the new era of web development

   http://qooxdoo.org

   Copyright:
     2004-2007 1&1 Internet AG, Germany, http://www.1and1.org

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


************************************************************************ */

/* ************************************************************************

#module(html2)

************************************************************************ */

/**
 * Methods to operate on nodes and elements on a DOM tree. This contains
 * special getters to query for child nodes, siblings, etc. This class also
 * supports to operate on one element and reorganize the content with 
 * the insertion of new HTML or nodes.
 */
qx.Class.define("qx.html2.element.Tree",
{
  statics :
  {
    /**
     * Returns the DOM index of the given node
     *
     * @type static
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
     * Return the next element to the supplied element
     *
     * "nextSibling" is not good enough as it might return a text or comment element
     *
     * @type static
     * @param element {Element} Starting element node
     * @return {Element | null} Next element node
     */
    getNextElementSibling : function(element)
    {
      while (element && (element = element.nextSibling) && !this.isElement(element)) {
        continue;
      }

      return element || null;
    },


    /**
     * Return the previous element to the supplied element
     *
     * "previousSibling" is not good enough as it might return a text or comment element
     *
     * @type static
     * @param element {Element} Starting element node
     * @return {Element | null} Previous element node
     */
    getPreviousElementSibling : function(element)
    {
      while (element && (element = element.previousSibling) && !this.isElement(element)) {
        continue;
      }

      return element || null;
    },


    /**
     * Returns the owner document of the given node
     *
     * @type static
     * @param node {Node} the node which should be tested
     * @return {Document | null} The document of the given DOM node
     */
    getDocument : function(node) {
      return node.ownerDocument || node.document || null;
    },


    /**
     * Returns the DOM2 "defaultView" which represents the window
     * of a DOM node
     *
     * @type static
     * @signature function(node)
     * @param node {Node} TODOC
     * @return {var} TODOC
     */
    getDefaultView : qx.core.Variant.select("qx.client",
    {
      "mshtml" : function(node) {
        return this.getDocument(node).parentWindow;
      },

      "default" : function(node) {
        return this.getDocument(node).defaultView;
      }
    }),


    /**
     * Whether the first element contains the second one
     *
     * Uses native non-standard contains() in Opera and Internet Explorer
     *
     * @type static
     * @signature function(element, target)
     * @param element {Element} Parent element
     * @param target {Node} Child node
     * @return {Boolean}
     */
    contains : qx.core.Variant.select("qx.client",
    {
      "mshtml|opera" : function(element, target) {
        return this.isDocument(element) ? element === this.getOwnerDocument(target) : element !== target && element.contains(target);
      },

      "default" : function(element, target)
      {
        while (target && (target = target.parentNode) && element != target) {
          continue;
        }

        return !!target;
      }
    }),


    /**
     * Checks if <code>element</code> is a descendant of <code>ancestor</code>.
     *
     * @type static
     * @param element {Element} first element
     * @param ancestor {Element} second element
     * @return {var} TODOC
     */
    descendantOf : function(element, ancestor) {
      return this.contains(ancestor, element);
    },


    /**
     * Get the common parent element of two given elements. Returns
     * <code>null</code> when no common element has been found.
     *
     * Uses native non-standard contains() in Opera and Internet Explorer
     *
     * @type static
     * @signature function(element1, element2)
     * @param element1 {Element} First element
     * @param element1 {Element} Second element
     * @return {Element|null} Common parent
     */
    getCommonParent : qx.core.Variant.select("qx.client",
    {
      "mshtml|opera" : function(element1, element2)
      {
        if (element1 === element2) {
          return element1;
        }

        while (element1)
        {
          if (element1.contains(element2)) {
            return element1;
          }

          element1 = element1.parentNode;
        }

        return null;
      },

      "default" : function(element1, element2)
      {
        if (element1 === element2) {
          return element1;
        }

        var known = {};
        var obj = qx.core.Object;
        var h1, h2;

        while (element1 || element2)
        {
          if (element1)
          {
            h1 = obj.toHashCode(element1);

            if (known[h1]) {
              return known[h1];
            }

            known[h1] = element1;
            element1 = element1.parentNode;
          }

          if (element2)
          {
            h2 = obj.toHashCode(element2);

            if (known[h2]) {
              return known[h2];
            }

            known[h2] = element2;
            element2 = element2.parentNode;
          }
        }

        return null;
      }
    }),


    /**
     * Collects all of element's ancestors and returns them as an array elements.
     *
     * @type static
     * @param element {Element} DOM element to query for ancestors
     * @return {Array} list of all parents
     */
    ancestors : function(element) {
      return element.recursivelyCollect("parentNode");
    },


    /**
     * Returns element's children.
     *
     * @type static
     * @param element {Element} DOM element to query for child elements
     * @return {Array} list of all child elements
     */
    childElements : function(element)
    {
      element = element.firstChild;

      if (!element) {
        return [];
      }

      while (element && element.nodeType != 1) {
        element = element.nextSibling;
      }

      if (element) {
        return [ element ].concat(element.nextSiblings());
      }

      return [];
    },


    /**
     * Collects all of element's descendants and returns them as an array elements.
     *
     * @type static
     * @param element {Element} DOM element to query for child elements
     * @return {Array} list of all found elements
     */
    descendants : function(element) {
      return qx.lang.Array.fromCollection(element.getElementsByTagName("*"));
    },


    /**
     * Returns the first child that is an element. This is opposed to firstChild DOM
     * property which will return any node (whitespace in most usual cases).
     *
     * @type static
     * @param element {Element} DOM element to query for first descendant
     * @return {Element} the first descendant
     */
    firstDescendant : function(element)
    {
      element = element.firstChild;

      while (element && element.nodeType != 1) {
        element = element.nextSibling;
      }

      return element;
    },


    /**
     * Collects all of element's previous siblings and returns them as an array elements.
     *
     * @type static
     * @param element {Element} DOM element to query for previous siblings
     * @return {Array} list of found DOM elements
     */
    previousSiblings : function(element) {
      return this.recursivelyCollect(element, "previousSibling");
    },


    /**
     * Collects all of element's next siblings and returns them as an array elements.
     *
     * @type static
     * @param element {Element} DOM element to query for next siblings
     * @return {Array} list of found DOM elements
     */
    nextSiblings : function(element) {
      return this.recursivelyCollect(element, "nextSibling");
    },


    /**
     * Recursively collects elements whose relationship is specified by property.
     * <code>property</code> has to be a property (a method won't do!) of element
     * that points to a single DOM node. Returns an array elements.
     *
     * @type static
     * @param element {Element} DOM element to start with
     * @param property {String} property to look for
     * @return {Array} result list
     */
    recursivelyCollect : function(element, property)
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
     * @type static
     * @param element {var} DOM element to start with
     * @return {Array} list of all found siblings
     */
    siblings : function(element) {
      return this.previousSiblings(element).reverse().concat(this.nextSiblings(element));
    },


    /**
     * Whether the given element is empty
     * Inspired by Base2 (Dean Edwards)
     *
     * @type static
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
     * @type static
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
    },


    /**
     * Removes all content from the given element
     *
     * @type static
     * @param element {Element} element to clean
     * @return {String} empty string (new HTML content)
     */
    makeEmpty : function(element) {
      return element.innerHTML = "";
    }
  }
});
