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


************************************************************************ */

/**
 * Basic node creation and type detection
 */
qx.Class.define("qx.dom.Node",
{
  /*
  *****************************************************************************
     STATICS
  *****************************************************************************
  */

  statics :
  {
    /*
    ---------------------------------------------------------------------------
      NODE TYPES
    ---------------------------------------------------------------------------
    */

    /**
     * {Map} Node type:
     *
     * * ELEMENT
     * * ATTRIBUTE
     * * TEXT
     * * CDATA_SECTION
     * * ENTITY_REFERENCE
     * * ENTITY
     * * PROCESSING_INSTRUCTION
     * * COMMENT
     * * DOCUMENT
     * * DOCUMENT_TYPE
     * * DOCUMENT_FRAGMENT
     * * NOTATION
     */
    ELEMENT                : 1,
    ATTRIBUTE              : 2,
    TEXT                   : 3,
    CDATA_SECTION          : 4,
    ENTITY_REFERENCE       : 5,
    ENTITY                 : 6,
    PROCESSING_INSTRUCTION : 7,
    COMMENT                : 8,
    DOCUMENT               : 9,
    DOCUMENT_TYPE          : 10,
    DOCUMENT_FRAGMENT      : 11,
    NOTATION               : 12,






    /*
    ---------------------------------------------------------------------------
      DOCUMENT ACCESS
    ---------------------------------------------------------------------------
    */

    /**
     * Returns the owner document of the given node
     *
     * @param node {Node|Document} the node which should be tested
     * @return {Document | null} The document of the given DOM node
     */
    getDocument : function(node)
    {
      if (this.isDocument(node)) {
        return node;
      }

      return node.ownerDocument || node.document || null;
    },


    /**
     * Returns the DOM2 <code>defaultView</code> (window).
     *
     * @signature function(node)
     * @param node {Node|Document} node to inspect
     * @return {Window} the <code>defaultView</code> of the given node
     */
    getWindow : qx.core.Variant.select("qx.client",
    {
      "mshtml" : function(node) {
        return this.getDocument(node).parentWindow;
      },

      "default" : function(node) {
        return this.getDocument(node).defaultView;
      }
    }),


    /**
     * Returns the document element. (Logical root node)
     *
     * This is a convenience attribute that allows direct access to the child
     * node that is the root element of the document. For HTML documents,
     * this is the element with the tagName "HTML".
     *
     * @param node {Node|Document} node to inspect
     * @return {Element} document element of the given node
     */
    getDocumentElement : function(node) {
      return this.getDocument(node).documentElement;
    },


    /**
     * Returns the body element. (Visual root node)
     *
     * This normally only makes sense for HTML documents. It returns
     * the content area of the HTML document.
     *
     * @param node {Node|Document} node to inspect
     * @return {Element} document body of the given node
     */
    getBodyElement : function(node) {
      return this.getDocument(node).body;
    },






    /*
    ---------------------------------------------------------------------------
      TYPE TESTS
    ---------------------------------------------------------------------------
    */

    /**
     * Whether the given node is a DOM element node
     *
     * @param node {Node} the node which should be tested
     * @return {Boolean} true if the node is a DOM element
     */
    isElement : function(node) {
      return !!(node && node.nodeType === qx.dom.Node.ELEMENT);
    },


    /**
     * Whether the given node is a DOM document node
     *
     * @param node {Node} the node which should be tested
     * @return {Boolean} true when the node is a document
     */
    isDocument : function(node) {
      return !!(node && node.nodeType === qx.dom.Node.DOCUMENT);
    },


    /**
     * Whether the given node is a DOM text node
     *
     * @param node {Node} the node which should be tested
     * @return {Boolean} true if the node is a DOM element
     */
    isText : function(node) {
      return !!(node && node.nodeType === qx.dom.Node.TEXT);
    },


    /**
     * Check whether the given object is a browser window object.
     *
     * @param obj {Object} the object which should be tested
     * @return {Boolean} true if the object is a window object.
     */
    isWindow : function(obj) {
      return !!(typeof obj === "object" && obj && obj.Array);
    },






    /*
    ---------------------------------------------------------------------------
      UTILITIES
    ---------------------------------------------------------------------------
    */

    /**
     * Returns the text content of an node where the node may be of node type NODE_ELEMENT, NODE_ATTRIBUTE or NODE_TEXT
     *
     * @param node {Node} the node from where the search should start.
     *     If the node has subnodes the text contents are recursively retreived and joined.
     * @return {String} the joined text content of the given node or null if not appropriate.
     * @signature function(node)
     */
    getText : function(node)
    {
      if(!node || !node.nodeType) {
        return null;
      }

      switch(node.nodeType)
      {
        case 1: // NODE_ELEMENT
          var i, a=[], nodes = node.childNodes, length = nodes.length;
          for (i=0; i<length; i++) {
            a[i] = this.getText(nodes[i]);
          };

          return a.join("");

        case 2: // NODE_ATTRIBUTE
          return node.nodeValue;
          break;

        case 3: // NODE_TEXT
          return node.nodeValue;
          break;
      }

      return null;
    }
  }
});
