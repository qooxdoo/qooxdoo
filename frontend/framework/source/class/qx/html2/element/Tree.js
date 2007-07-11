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
     * "nextSibling" is not good enough as it might return a text or comment el
     *
     * @type static
     * @param el {Element} Starting element node
     * @return {Element|null} Next element node
     */
    getNextElementSibling : function(el)
    {
      while (el && (el = el.nextSibling) && !this.isElement(el)) {
        continue;
      }

      return el || null;
    },


    /**
     * Return the previous element to the supplied element
     *
     * "previousSibling" is not good enough as it might return a text or comment el
     *
     * @type static
     * @param el {Element} Starting element node
     * @return {Element|null} Previous element node
     */
    getPreviousElementSibling : function(el)
    {
      while (el && (el = el.previousSibling) && !this.isElement(el)) {
        continue;
      }

      return el || null;
    },


    /**
     * Returns the owner document of the given node
     *
     * @type static
     * @param node {Node} the node which should be tested
     * @return {Document|null} The document of the given DOM node
     */
    getDocument : function(node) {
      return node.ownerDocument || node.document || null;
    },


    /**
     * Returns the DOM2 "defaultView" which represents the window
     * of a DOM node
     *
     * @type static
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
     * @param el {Element} Parent element
     * @param target {Node} Child node
     * @return {Boolean}
     */
    contains : qx.core.Variant.select("qx.client",
    {
      "mshtml|opera" : function(el, target)
      {
        return this.isDocument(el) ?
          el === this.getOwnerDocument(target) :
          el !== target && el.contains(target);
      },

      "default" : function(el, target)
      {
        while (target && (target = target.parentNode) && el != target) {
          continue;
        }

        return !!target;
      }
    }),


    /**
     * Checks if <code>element</code> is a descendant of <code>ancestor</code>.
     *
     * @param el {Element} first element
     * @param ancestor {Element} second element
     */
    descendantOf : function(el, ancestor) {
      return this.contains(ancestor, el);
    },


    /**
     * Get the common parent element of two given elements. Returns
     * <code>null</code> when no common element has been found.
     *
     * Uses native non-standard contains() in Opera and Internet Explorer
     *
     * @type static
     * @param el1 {Element} First element
     * @param el1 {Element} Second element
     * @return {Element|null} Common parent
     */
    getCommonParent : qx.core.Variant.select("qx.client",
    {
      "mshtml|opera" : function(el1, el2)
      {
        if (el1 === el2) {
          return el1;
        }

        while(el1)
        {
          if (el1.contains(el2)) {
            return el1;
          }

          el1 = el1.parentNode;
        }

        return null;
      },

      "default" : function(el1, el2)
      {
        if (el1 === el2) {
          return el1;
        }

        var known = {};
        var obj = qx.core.Object;
        var h1, h2;

        while(el1 || el2)
        {
          if (el1)
          {
            h1 = obj.toHashCode(el1);

            if (known[h1]) {
              return known[h1];
            }

            known[h1] = el1;
            el1 = el1.parentNode;
          }

          if (el2)
          {
            h2 = obj.toHashCode(el2);

            if (known[h2]) {
              return known[h2];
            }

            known[h2] = el2;
            el2 = el2.parentNode;
          }
        }

        return null;
      }
    }),


    /**
     * Completely removes element from the document and returns it.
     */
    remove: function(element)
    {
      element.parentNode.removeChild(element);
      return element;
    },


    /**
     * Collects all of element's ancestors and returns them as an array elements.
     */
    ancestors: function(element) {
      return element.recursivelyCollect("parentNode");
    },


    /**
     * Returns element's children.
     */
    childElements: function(element)
    {
      element = element.firstChild;

      if (!element) {
        return [];
      }

      while (element && element.nodeType != 1) {
        element = element.nextSibling;
      }

      if (element) {
        return [element].concat(element.nextSiblings());
      }

      return [];
    },


    /**
     * Collects all of element's descendants and returns them as an array elements.
     */
    descendants: function(element) {
      return qx.lang.Array.fromCollection(element.getElementsByTagName("*"));
    },


    /**
     * Returns the first child that is an element. This is opposed to firstChild DOM
     * property which will return any node (whitespace in most usual cases).
     */
    firstDescendant: function(element)
    {
      element = element.firstChild;

      while (element && element.nodeType != 1) {
        element = element.nextSibling;
      }

      return element;
    },


    /**
     * Collects all of element's previous siblings and returns them as an array elements.
     */
    previousSiblings: function(element) {
      return this.recursivelyCollect(element, "previousSibling");
    },


    /**
     * Collects all of element's next siblings and returns them as an array elements.
     */
    nextSiblings: function(element) {
      return this.recursivelyCollect(element, "nextSibling");
    },


    /**
     * Recursively collects elements whose relationship is specified by property.
     * <code>property</code> has to be a property (a method won't do!) of element
     * that points to a single DOM node. Returns an array elements.
     */
    recursivelyCollect: function(element, property)
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
     */
    siblings: function(element) {
      return this.previousSiblings(element).reverse().concat(this.nextSiblings(element));
    },









    /**
     * Replaces <code>el</code> by the content of the <code>html</code> argument
     * and returns the removed <code>el</code>.
     *
     * Mimics Prototype's <code>dom.replace()</code>
     *
     * @param el {Element} element to replace
     * @param html {String} HTML string
     */
    replaceWithHTML : function(el, html)
    {
      if (el.outerHTML)
      {
        el.outerHTML = html;
      }
      else
      {
        var range = el.ownerDocument.createRange();
        range.selectNode(el);
        el.parentNode.replaceChild(range.createContextualFragment(html), el);
      }

      return el;
    },


    /**
     * Whether the given element is empty
     *
     * Mimics Prototype's <code>dom.empty()</code>
     * Inspired by Base2 (Dean Edwards)
     *
     * @type static
     * @param el {Element} The element to check
     * @return {Boolean} true when the element is empty
     */
    isEmpty : function(el)
    {
      el = el.firstChild;

      while (el)
      {
        if (el.nodeType === qx.dom.Node.ELEMENT || el.nodeType === qx.dom.Node.TEXT) {
          return false;
        }

        el = el.nextSibling;
      }

      return true;
    },


    /**
     * Removes all of element's text nodes which contain only whitespace
     *
     * Mimics Prototype's <code>dom.cleanWhitespace</code>
     *
     * @type static
     * @param el {Element} Element to cleanup
     * @return {void}
     */
    cleanWhitespace : function(el)
    {
      var node = el.firstChild;

      while (node)
      {
        var nextNode = node.nextSibling;

        if (node.nodeType == 3 && !/\S/.test(node.nodeValue)) {
          el.removeChild(node);
        }

        node = nextNode;
      }
    },


    /**
     * Removes all content from the given element
     *
     * @type static
     * @param el {Element} element to clean
     * @return {String} empty string (new HTML content)
     */
    makeEmpty : function(el) {
      return el.innerHTML = "";
    }
  }
});
