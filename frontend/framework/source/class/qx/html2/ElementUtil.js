qx.Class.define("qx.html2.ElementUtil",
{
  statics :
  {
    /**
     * TODOC
     *
     * @type static
     * @param node {Node} TODOC
     * @return {var} TODOC
     */
    isElement : function(node) {
      return Boolean(node && node.attributes);
    },
    

    // more native
    /**
     * TODOC
     *
     * @type static
     * @param node {Node} TODOC
     * @param target {var} TODOC
     * @return {var} TODOC
     */
    contains : function(node, target) 
    {
      if (node.contains) 
      {
        return this.isDocument(node) ? 
          node === this.getOwnerDocument(target) : 
          node !== target && node.contains(target);
      } 
      else
      {
        while (target && (target = target.parentNode) && node != target) {
          continue;
        }
        
        return !!target;        
      }      
    },


    /**
     * Adapted from Mochikit
     *
     * @type static
     * @param node {Node} TODOC
     * @param visitor {var} TODOC
     * @return {void} 
     */
    nodeWalk : function(node, visitor)
    {
      var nodes = [ node ];

      while (nodes.length)
      {
        var res = visitor(nodes.shift());

        if (res) {
          nodes.push.apply(nodes, res);
        }
      }
    },


    /**
     * Adapted from Mochikit
     *
     * @type static
     * @param name {var} TODOC
     * @param xhtml {var} TODOC
     * @return {Element} TODOC
     */
    createElement : function(name, xhtml)
    {
      if (xhtml) {
        return document.createElementNS("http://www.w3.org/1999/xhtml", name);
      } else {
        return document.createElement(name);
      }
    },
    
    
    
    
    
        
    
    
    
    
    
    // IE Attribute Name Fixes: READ
    __readAttributeTranslation :
    {
      colspan   : "colSpan",
      rowspan   : "rowSpan",
      valign    : "vAlign",
      datetime  : "dateTime",
      accesskey : "accessKey",
      tabindex  : "tabIndex",
      enctype   : "encType",
      maxlength : "maxLength",
      readonly  : "readOnly",
      longdesc  : "longDesc"
    },

    // IE Attribute Name Fixes: WRITE (ADDIIONAL TO ABOVE READ LIST)
    __writeAttributeTranslation :
    {
      'class'   : 'className',
      'for'     : 'htmlFor'      
    },


    /**
     * TODOC
     *
     * @type static
     * @param element {var} TODOC
     * @param name {var} TODOC
     * @return {null | var} TODOC
     */
    readAttribute : function(element, name) {
      return element.getAttribute(name);
    },


    /**
     * TODOC
     *
     * @type static
     * @param element {var} TODOC
     * @param name {var} TODOC
     * @param value {var} TODOC
     * @return {var} TODOC
     */
    writeAttribute : function(element, name, value)
    {
      if (value === false || value == null) {
        element.removeAttribute(name); 
      } else if (value === true) {
        element.setAttribute(name, name);
      } else {
        element.setAttribute(name, value);
      }

      return element;
    },
    
    
    
        
    
        
        
        
    
    /**
     * Adopted from Dean Edwards Base2
     *
     * @type static
     * @param element {var} TODOC
     * @param className {var} TODOC
     * @return {var} TODOC
     */
    addClass : function(element, className)
    {
      if (!this.hasClass(element, className))
      {
        element.className += (element.className ? " " : "") + className;
        return className;
      }
    },


    /**
     * Adopted from Dean Edwards Base2
     *
     * @type static
     * @param element {var} TODOC
     * @param className {var} TODOC
     * @return {var} TODOC
     */
    hasClass : function(element, className)
    {
      var regexp = new RegExp("(^|\\s)" + className + "(\\s|$)");
      return regexp.test(element.className);
    },


    /**
     * Adopted from Dean Edwards Base2
     *
     * @type static
     * @param element {var} TODOC
     * @param className {var} TODOC
     * @return {var} TODOC
     */
    removeClass : function(element, className)
    {
      var regexp = new RegExp("(^|\\s)" + className + "(\\s|$)");
      element.className = element.className.replace(regexp, "$2");
      return className;
    },
    
    
    
    
    
    
    
    
    /**
     * TODOC
     *
     * @type static
     * @param node {Node} TODOC
     * @return {var} TODOC
     */
    getTextContent : function(node)
    {
      if (IE) return node.innerText;
      else return node.textContent;
    },
    
        
    /**
     * TODOC
     *
     * @type static
     * @param node {Node} TODOC
     * @param text {var} TODOC
     * @return {void} 
     */
    setTextContent : function(node, text)
    {
      if (IE) node.innerText = text;
      else node.textContent = text;
    },
    

    /**
     * TODOC
     *
     * @type static
     * @param node {Node} TODOC
     * @return {boolean} TODOC
     */
    isEmpty : function(node)
    {
      node = node.firstChild;

      while (node)
      {
        if (node.nodeType == 3 || this.isElement(node)) return false;
        node = node.nextSibling;
      }

      return true;
    },
    
    
    
    
    
    


    /**
     * TODOC
     *
     * @type static
     * @param node {Node} TODOC
     * @return {var} TODOC
     */
    getOwnerDocument : function(node) {
      return node.ownerDocument || node.document || null;
    },
    
    
    /**
     * TODOC
     *
     * @type static
     * @param node {Node} TODOC
     * @return {var} TODOC
     */
    getDefaultView : function(node)
    {
      if (IE) return this.getDocument(node).parentWindow;
      else return this.getDocument(node).defaultView;
    },    
    

    /**
     * TODOC
     *
     * @type static
     * @param node {Node} TODOC
     * @return {var} TODOC
     */
    getDocument : function(node)
    {
      // return the document object
      return this.isDocument(node) ? node : this.getOwnerDocument(node);
    },


    /**
     * TODOC
     *
     * @type static
     * @param node {Node} TODOC
     * @return {var} TODOC
     */
    isDocument : function(node) {
      return Boolean(node && node.documentElement);
    },
    
    
    
        
    
    
    
    




    /**
     * TODOC
     *
     * @type static
     * @param node {Node} TODOC
     * @return {var} TODOC
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
     * TODOC
     *
     * @type static
     * @param node {Node} TODOC
     * @return {Node} TODOC
     */
    getNextElementSibling : function(node)
    {
      // return the next element to the supplied element
      //  nextSibling is not good enough as it might return a text or comment node
      while (node && (node = node.nextSibling) && !this.isElement(node)) {
        continue;
      }
      
      return node;
    },


    /**
     * TODOC
     *
     * @type static
     * @param node {Node} TODOC
     * @return {Node} TODOC
     */
    getPreviousElementSibling : function(node)
    {
      // return the previous element to the supplied element
      while (node && (node = node.previousSibling) && !this.isElement(node)) {
        continue;
      }
      
      return node;
    },                
  }
});
