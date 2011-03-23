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
     * Andreas Ecker (ecker)
     * Fabian Jakobs (fjakobs)

************************************************************************ */

/**
 * Cross browser XML Element API
 *
 * API to select, query and serialize XML elements.
 *
 * Further information:
 *
 * * <a href="http://developer.mozilla.org/en/docs/Parsing_and_serializing_XML">MDN Parsing and Serializing XML</a>
 *
 * Please note that nodes selected using the <code>selectSingleNode()</code> and
 * <code>selectNodes()</code> methods remain in their document context so
 * <code>qx.xml.Element.selectNodes(foo, "//bar");</code>
 * will search the entire document for any nodes named "bar", not just the
 * <code>foo</code> node.
 */
qx.Class.define("qx.xml.Element",
{
  statics :
  {
    /**
     * {Boolean} <code>true</code> if the native XMLSerializer should be used,
     * <code>false</code> otherwise.
     */
    XML_SERIALIZER : false,

    /**
     * The subtree rooted by the specified element or document is serialized to a string.
     *
     * @param element {Element | Document} The root of the subtree to be serialized. This could be any node, including a Document.
     * @return {String} Serialized subtree
     */
    serialize : function(element)
    {
      if (qx.dom.Node.isDocument(element)) {
        element = element.documentElement;
      }

      if (this.XML_SERIALIZER) {
        return (new XMLSerializer()).serializeToString(element);
      } else {
        return element.xml || element.outerHTML;
      }
    },


    /**
     * Selects the first XmlNode that matches the XPath expression.
     *
     * <p>Note: XPath queries containing namespace prefixes won't work in
     * Chromium-based browsers until Chromium bug #671
     * [<a href="http://code.google.com/p/chromium/issues/detail?id=671">1</a>]
     * is fixed. Opera versions < 9.52 do not seem to support namespaces in
     * XPath queries at all.</p>
     *
     * @param element {Element | Document} root element for the search
     * @param query {String} XPath query
     * @param namespaces {Map} optional map of prefixes and their namespace URIs
     * @return {Element} first matching element
     * @signature function(element, query, namespaces)
     */
    selectSingleNode : qx.core.Environment.select("engine.name",
    {
      "mshtml": function(element, query, namespaces) {
        if (namespaces) {
          var namespaceString = "";
          for (var prefix in namespaces) {
            namespaceString += "xmlns:" + prefix + "='" + namespaces[prefix] + "' ";
          }

          // If the element is a node, set the selection namespace on its parent document.
          if (element.ownerDocument) {
            element.ownerDocument.setProperty("SelectionNamespaces", namespaceString);
          }
          // element is a document
          else {
            element.setProperty("SelectionNamespaces", namespaceString);
          }

        }

        return element.selectSingleNode(query);
      },

      "default": function(element, query, namespaces)
      {
        if(!this.__xpe) {
          this.__xpe = new XPathEvaluator();
        }

        var xpe = this.__xpe;

        var resolver;

        if(namespaces) {
          resolver = function(prefix){
            return namespaces[prefix] || null;
          };
        }
        else {
          resolver = xpe.createNSResolver(element);
        }

        try {
          return xpe.evaluate(query, element, resolver, XPathResult.FIRST_ORDERED_NODE_TYPE, null).singleNodeValue;
        } catch(err) {
          throw new Error("selectSingleNode: query: " + query + ", element: " + element + ", error: " + err);
        }
      }
    }),


    /**
     * Selects a list of nodes matching the XPath expression.
     *
     * <p>Note: XPath queries containing namespace prefixes won't work in
     * Chromium-based browsers until Chromium bug #671
     * [<a href="http://code.google.com/p/chromium/issues/detail?id=671">1</a>]
     * is fixed. Opera versions < 9.52 do not seem to support namespaces in
     * XPath queries at all.</p>
     *
     * @param element {Element | Document} root element for the search
     * @param query {String} XPath query
     * @param namespaces {Map} optional map of prefixes and their namespace URIs
     * @return {Element[]} List of matching elements
     * @signature function(element, query, namespaces)
     */
    selectNodes : qx.core.Environment.select("engine.name",
    {
      "mshtml": function(element, query, namespaces) {
        if (namespaces) {
          var namespaceString = "";
          for (var prefix in namespaces) {
            namespaceString += "xmlns:" + prefix + "='" + namespaces[prefix] + "' ";
          }

          // If the element is a node, set the selection namespace on its parent document.
          if (element.ownerDocument) {
            element.ownerDocument.setProperty("SelectionNamespaces", namespaceString);
          }
          // element is a document
          else {
            element.setProperty("SelectionNamespaces", namespaceString);
          }

        }

        return element.selectNodes(query);
      },

      "default": function(element, query, namespaces)
      {
        var xpe = this.__xpe;

        if(!xpe) {
          this.__xpe = xpe = new XPathEvaluator();
        }

        var resolver;

        if(namespaces) {
          resolver = function(prefix){
            return namespaces[prefix] || null;
          };
        }
        else {
          resolver = xpe.createNSResolver(element);
        }

        try {
          var result = xpe.evaluate(query, element, resolver, XPathResult.ORDERED_NODE_SNAPSHOT_TYPE, null);
        } catch(err) {
          throw new Error("selectNodes: query: " + query + ", element: " + element + ", error: " + err);
        }

        var nodes = [];
        for (var i=0; i<result.snapshotLength; i++) {
          nodes[i] = result.snapshotItem(i);
        }

        return nodes;
      }
    }),


    /**
     * Returns a list of elements with the given tag name belonging to the given namespace
     *
     * (See
     * <a href="http://developer.mozilla.org/en/DOM/element.getElementsByTagNameNS">MDN
     * Reference</a>).
     *
     * @param element {Element | Document} the element from where the search should start.
     *       Note that only the descendants of this element are included in the search, not the node itself.
     * @param namespaceURI {var} is the namespace URI of elements to look for . For example, if you need to look
     *       for XHTML elements, use the XHTML namespace URI, <tt>http://www.w3.org/1999/xhtml</tt>.
     * @param tagname {String} the tagname to look for
     * @return {Element[]} a list of found elements in the order they appear in the tree.
     * @signature function(element, namespaceURI, tagname)
     */
    getElementsByTagNameNS : qx.core.Environment.select("engine.name",
    {
      "mshtml": function(element, namespaceURI, tagname)
      {
        var doc = element.ownerDocument || element;

        doc.setProperty("SelectionLanguage", "XPath");
        doc.setProperty("SelectionNamespaces", "xmlns:ns='" + namespaceURI + "'");

        return qx.xml.Element.selectNodes(element, 'descendant-or-self::ns:' + tagname);
      },

      "default": function(element, namespaceURI, tagname) {
        return element.getElementsByTagNameNS(namespaceURI, tagname);
      }
    }),


    /**
     * Selects the first XmlNode that matches the XPath expression and returns the text content of the element
     *
     * @param element {Element|Document} root element for the search
     * @param query {String}  XPath query
     * @return {String} the joined text content of the found element or null if not appropriate.
     * @signature function(element, query)
     */
    getSingleNodeText : function(element, query)
    {
      var node = this.selectSingleNode(element, query);
      return qx.dom.Node.getText(node);
    },


    /**
     * Adds or sets an attribute with the given namespace on a node
     *
     * @param document {Document} The node's parent document, created e.g. by
     * {@link qx.xml.Document#create}
     * @param element {Element} XML/DOM element to modify
     * @param namespaceUri {String} Namespace URI
     * @param name {String} Attribute name
     * @param value {String} Attribute value
     * @signature function(document, element, namespaceUri, name, value)
     */
    setAttributeNS : qx.core.Environment.select("engine.name",
    {
      "mshtml": function(document, element, namespaceUri, name, value) {
        var attr = document.createNode(2, name, namespaceUri);
        attr.nodeValue = value;
        element.setAttributeNode(attr);
      },

      "default" : function(document, element, namespaceUri, name, value) {
        element.setAttributeNS(namespaceUri, name, value);
      }
    }),

    /**
     * Get the value of the attribute with the given namespace and name
     *
     * @param element {Element} XML/DOM element to modify
     * @param namespaceUri {String} Namespace URI
     * @param name {String} Attribute name
     * @return {String} the value of the attribute, empty string if not found
     * @signature function(element, namespaceUri, name)
     */
    getAttributeNS : qx.core.Environment.select("engine.name",
    {
      "mshtml": function(element, namespaceUri, name) {
        var attributes = element.attributes;
        var value = null;
        if(attributes)
        {
          var attribute = attributes.getQualifiedItem(name,namespaceUri);
          if(attribute)
          {
            value = attribute.nodeValue;
          }
        }
        return value === null ? '' : value;
      },

      "default" : function(element, namespaceUri, name) {
        var value = element.getAttributeNS(namespaceUri, name);
        return value === null ? '' : value;
      }
    }),


    /**
     * Creates an element with the given namespace and appends it to an existing
     * element
     *
     * @param document {Document} The node's parent document, created e.g. by
     * {@link qx.xml.Document#create}
     * @param parent {Element} The parent element for the new sub-element
     * @param name {String} The new element's name
     * @param namespaceUri {String} Namespace URI for the new element
     * @signature function(document, parent, name, namespaceUri)
     *
     * @return {Element} The newly created sub-element
     */
    createSubElementNS: qx.core.Environment.select("engine.name",
    {
      "mshtml" : function(document, parent, name, namespaceUri) {
        var node = document.createNode(1, name, namespaceUri);
        parent.appendChild(node);
        return node;
      },

      "default" : function(document, parent, name, namespaceUri) {
        // the "x" prefix has no importance. when there's a conflict,
        // mozilla engine assigns an alternative prefix automatically.
        // not putting a prefix means to assign default namespace prefix
        // to the given namespace uri.
        var node = document.createElementNS(namespaceUri, "x:" + name);
        parent.appendChild(node);
        return node;
      }
    })
  },


  /*
  *****************************************************************************
     DEFER
  *****************************************************************************
  */

  defer : function(statics)
  {
    statics.XML_SERIALIZER = (window.XMLSerializer &&
     !( qx.core.Environment.get("engine.name") == "mshtml" &&
     qx.core.Environment.get("engine.version") >= 9));
  }
});
