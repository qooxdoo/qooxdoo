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
 * http://msdn.microsoft.com/library/default.asp?url=/library/en-us/xmlsdk/html/81f3de54-3b79-46dc-8e01-73ca2d94cdb5.asp
 * http://developer.mozilla.org/en/docs/Parsing_and_serializing_XML
 */
qx.Class.define("qx.xml.Element",
{
  statics :
  {
    /**
     * The subtree rooted by the specified element or document is serialized to a string.
     *
     * @param element {Element | Document} The root of the subtree to be serialized. This could be any node, including a Document.
     * @return {String} TODOC
     */
    serialize : function(element)
    {
      if (qx.dom.Node.isDocument(element)) {
        element = element.documentElement;
      }

      if (window.XMLSerializer) {
        return (new XMLSerializer()).serializeToString(element);
      } else {
        return element.xml || element.outerHTML;
      }
    },


    /**
     * Selects the first XmlNode that matches the XPath expression.
     *
     * @param element {Element | Document} root element for the search
     * @param query {String} XPath query
     * @return {Element} first matching element
     * @signature function(element, query)
     */
    selectSingleNode : qx.core.Variant.select("qx.client",
    {
      "mshtml|opera": function(element, query) {
        return element.selectSingleNode(query);
      },

      "default": function(element, query)
      {
        if(!this.__xpe) {
          this.__xpe = new XPathEvaluator();
        }

        var xpe = this.__xpe;

        try {
          return xpe.evaluate(query, element, xpe.createNSResolver(element), XPathResult.FIRST_ORDERED_NODE_TYPE, null).singleNodeValue;
        } catch(err) {
          throw new Error("selectSingleNode: query: " + query + ", element: " + element + ", error: " + err);
        }
      }
    }),


    /**
     * Selects a list of nodes matching the XPath expression.
     *
     * @param element {Element | Document} root element for the search
     * @param query {String} XPath query
     * @return {Element[]} List of matching elements
     * @signature function(element, query)
     */
    selectNodes : qx.core.Variant.select("qx.client",
    {
      "mshtml|opera": function(element, query) {
        return element.selectNodes(query);
      },

      "default": function(element, query)
      {
        var xpe = this.__xpe;

        if(!xpe) {
          this.__xpe = xpe = new XPathEvaluator();
        }

        try {
          var result = xpe.evaluate(query, element, xpe.createNSResolver(element), XPathResult.ORDERED_NODE_SNAPSHOT_TYPE, null);
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
     * Returns a list of elements with the given tag name belonging to the given namespace (http://developer.mozilla.org/en/docs/DOM:element.getElementsByTagNameNS).
     *
     * @param element {Element | Document} the element from where the search should start.
     *       Note that only the descendants of this element are included in the search, not the node itself.
     * @param namespaceURI {var} is the namespace URI of elements to look for . For example, if you need to look
     *       for XHTML elements, use the XHTML namespace URI, <tt>http://www.w3.org/1999/xhtml</tt>.
     * @param tagname {String} the tagname to look for
     * @return {Element[]} a list of found elements in the order they appear in the tree.
     * @signature function(element, namespaceURI, tagname)
     */
    getElementsByTagNameNS : qx.core.Variant.select("qx.client",
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
    }
  }
});
