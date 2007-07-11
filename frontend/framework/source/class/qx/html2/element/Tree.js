qx.Class.define("qx.html2.element.Tree",
{
  statics :
  {
    /**
     * Creates an DOM element
     *
     * @type static
     * @param name {String} Tag name of the element
     * @param xhtml {Boolean?false} Enable XHTML
     * @return {Element} the created element node
     */
    createElement : function(name, xhtml)
    {
      if (xhtml) {
        return document.createElementNS("http://www.w3.org/1999/xhtml", name);
      } else {
        return document.createElement(name);
      }
    },


    /**
     * Whether the given node is a DOM element
     *
     * @type static
     * @param node {Node} the node which should be tested
     * @return {Boolean} true if the node is a DOM element
     */
    isElement : function(node) {
      return !!(node && node.nodeType === qx.dom.Node.ELEMENT);
    },


    /**
     * Whether the given node is a document
     *
     * @type static
     * @param node {Node} the node which should be tested
     * @return {Boolean} true when the node is a document
     */
    isDocument : function(node) {
      return !!(node && node.nodeType === qx.dom.Node.DOCUMENT);
    },
    
        
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
    getCommonParent : qx.core.Variant.select(
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
     * Whether the given element is empty
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
     * Removes whitespace-only text node children
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
    empty : function(el) {
      return el.innerHTML = "";
    }    
  }  
});
