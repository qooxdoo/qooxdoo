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
 * XML Document
 *
 * Tested with IE6, Firefox 2.0, WebKit/Safari 3.0 and Opera 9
 *
 * http://msdn2.microsoft.com/en-us/library/ms535918.aspx
 * http://developer.mozilla.org/en/docs/Parsing_and_serializing_XML
 */
qx.Class.define("qx.xml.Document",
{
  statics :
  {
    /**
     * Create an XML document.
     * http://www.w3.org/TR/DOM-Level-2-Core/core.html#i-Document
     *
     * @type static
     * @param namespaceUri {String | null ? null} The namespace URI of the document element to create or null.
     * @param qualifiedName {String | null ? null} The qualified name of the document element to be created or null.
     * @return {Document} empty XML document
     * @signature function(namespaceUri, qualifiedName)
     */
    create : qx.core.Variant.select("qx.client",
    {
      "default": qx.lang.Object.select((document.implementation && document.implementation.createDocument) ? "hasDom2" : "noDom2",
      {
        "hasDom2": function(namespaceUri, qualifiedName)
        {
          return document.implementation.createDocument(namespaceUri || "", qualifiedName || "", null);
        },

        "noDom2": function(namespaceUri, qualifiedName)
        {
          throw new Error("This browser does not support xml dom creation.");
        }
      }),

      "mshtml": function(namespaceUri, qualifiedName)
       {
        /*
         According to information on the Microsoft XML Team's WebLog
         it is recommended to check for availability of MSXML versions 6.0 and 3.0.
         Other versions are included for completeness, 5.0 is excluded as it is
         "off-by-default" in IE7 (which could trigger a goldbar).
          http://blogs.msdn.com/xmlteam/archive/2006/10/23/using-the-right-version-of-msxml-in-internet-explorer.aspx
         http://msdn.microsoft.com/library/default.asp?url=/library/en-us/xmlsdk/html/aabe29a2-bad2-4cea-8387-314174252a74.asp
         */

        var vServers = [ "MSXML2.DOMDocument.3.0", "MSXML2.DOMDocument.6.0", "MSXML2.DOMDocument.4.0", "MSXML2.DOMDocument", // v3.0
        "MSXML.DOMDocument", // v2.x
        "Microsoft.XMLDOM" // v2.x
        ];

        var vObject;

        for (var i=0, l=vServers.length; i<l; i++)
        {
          try
          {
            vObject = new ActiveXObject(vServers[i]);
            break;
          }
          catch(ex)
          {
            vObject = null;
          }
        }

        if (qualifiedName && vObject)
        {
          var xmlStr = new qx.util.StringBuilder();
          xmlStr.add("<?xml version='1.0' encoding='UTF-8'?>\n<");
          xmlStr.add(qualifiedName);

          if (namespaceUri)
          {
            xmlStr.add(" xmlns='");
            xmlStr.add(namespaceUri);
            xmlStr.add("'");
          }

          xmlStr.add(" />");
          vObject.loadXML(xmlStr.toString());
        }

        return vObject;
      }
    }),


    /**
     * The string passed in is parsed into a DOM document.
     *
     * @type static
     * @param str {String} the string to be parsed
     * @return {Document} TODO: move to create()
     * @signature function(str)
     */
    fromString : qx.core.Variant.select("qx.client",
    {
      "default": qx.lang.Object.select(window.DOMParser ? "hasDomParser" : "noDomParser",
      {
        "hasDomParser":  function(str)
        {
          var dom = (new DOMParser()).parseFromString(str, "text/xml");
          return dom;
        },

        "noDomParser": function(str) {
          throw new Error("This browser does not support xml dom creation from string.");
        }
      }),

      "mshtml": function(str)
      {
        var dom = qx.xml.Document.create();
        dom.loadXML(str);
        return dom;
      }
    }),


    /**
     * Check whether an object is a Document instance
     *
     * @type static
     * @param obj {Object} object to check
     * @return {Boolean} whether the object is a Document instance
     */
    isDocument : function(obj) {
      return (obj.nodeType == qx.dom.Node.DOCUMENT);
    }
  }
});
