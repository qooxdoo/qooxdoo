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
 * Cross browser XML Document API
 *
 * * http://msdn2.microsoft.com/en-us/library/ms535918.aspx
 * * http://msdn2.microsoft.com/en-us/library/ms764622.aspx
 * * http://developer.mozilla.org/en/docs/Parsing_and_serializing_XML
 */
qx.Bootstrap.define("qx.xml.Document",
{
  statics :
  {
    /** {String} ActiveX class name of DOMDocument (IE specific) */
    DOMDOC : null,

    /** {String} ActiveX class name of XMLHttpRequest (IE specific) */
    XMLHTTP : null,


    /**
     * Create an XML document.
     * http://www.w3.org/TR/DOM-Level-2-Core/core.html#i-Document
     *
     * @signature function(namespaceUri, qualifiedName)
     * @param namespaceUri {String ? null} The namespace URI of the document element to create or null.
     * @param qualifiedName {String ? null} The qualified name of the document element to be created or null.
     * @return {Document} empty XML document
     */
    create : qx.core.Variant.select("qx.client",
    {
      "mshtml": function(namespaceUri, qualifiedName)
      {
        var obj = new ActiveXObject(this.DOMDOC);
        obj.setProperty("SelectionLanguage", "XPath");

        if (qualifiedName)
        {
          var str = '<?xml version="1.0" encoding="utf-8"?>\n<';

          str += qualifiedName;

          if (namespaceUri) {
            str += " xmlns='" + namespaceUri + "'";
          }

          str += " />";
          obj.loadXML(str);
        }

        return obj;
      },

      "default": function(namespaceUri, qualifiedName) {
        return document.implementation.createDocument(namespaceUri || "", qualifiedName || "", null);
      }
    }),


    /**
     * The string passed in is parsed into a DOM document.
     *
     * @param str {String} the string to be parsed
     * @return {Document} TODO: move to create()
     * @signature function(str)
     */
    fromString : qx.core.Variant.select("qx.client",
    {
      "mshtml": function(str)
      {
        var dom = qx.xml.Document.create();
        dom.loadXML(str);

        return dom;
      },

      "default": function(str)
      {
        var parser = new DOMParser();
        return parser.parseFromString(str, "text/xml");
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
    // Detecting available ActiveX implementations.
    if (qx.core.Variant.isSet("qx.client", "mshtml"))
    {
      // According to information on the Microsoft XML Team's WebLog
      // it is recommended to check for availability of MSXML versions 6.0 and 3.0.
      // http://blogs.msdn.com/xmlteam/archive/2006/10/23/using-the-right-version-of-msxml-in-internet-explorer.aspx
      var domDoc = [ "MSXML2.DOMDocument.6.0", "MSXML2.DOMDocument.3.0" ];
      var httpReq = [ "MSXML2.XMLHTTP.6.0", "MSXML2.XMLHTTP.3.0" ];

      for (var i=0, l=domDoc.length; i<l; i++)
      {
        try
        {
          // Keep both objects in sync with the same version.
          // This is important as there were compabilitiy issues detected.
          new ActiveXObject(domDoc[i]);
          new ActiveXObject(httpReq[i]);
        }
        catch(ex) {
          continue;
        }

        // Update static constants
        statics.DOMDOC = domDoc[i];
        statics.XMLHTTP = httpReq[i];

        // Stop loop here
        break;
      }
    }
  }
});
