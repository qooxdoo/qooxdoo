/* ************************************************************************

   qooxdoo - the new era of web development

   http://qooxdoo.org

   Copyright:
     2004-2007 by 1&1 Internet AG, Germany, http://www.1and1.org

   License:
     LGPL 2.1: http://www.gnu.org/licenses/lgpl.html

   Authors:
     * Sebastian Werner (wpbasti)
     * Andreas Ecker (ecker)
     * Fabian Jakobs (fjakobs)

************************************************************************ */

/* ************************************************************************


************************************************************************ */

/**
 * XML Document
 *
 * Tested with IE6, Firefox 2.0, WebKit/Safari 3.0 and Opera 9
 *
 * http://msdn.microsoft.com/library/default.asp?url=/library/en-us/xmlsdk/html/81f3de54-3b79-46dc-8e01-73ca2d94cdb5.asp
 * http://developer.mozilla.org/en/docs/Parsing_and_serializing_XML
 */
qx.OO.defineClass("qx.xml.Document");

/**
 * Create an XML document
 * http://www.w3.org/TR/DOM-Level-2-Core/core.html#i-Document
 *
 * TODO: add implementation that suuports the given arguments.
 *       Drop fromString() afterwards.
 *
 * @param content {String|null?null}
 * @param namespace {String|null?null}
 * @param root {String|null?null}
 *
 * @return {Document} empty XML document
 */
qx.Class.create = function(content, namespace, root) {};

if (document.implementation && document.implementation.createDocument) // The Mozilla style
{
  qx.Class.create = function(content, namespace, root)
  {
    return document.implementation.createDocument("", "", null);
  }
}
else if (qx.core.Client.getInstance().isMshtml())   // The Microsoft style
{
  qx.Class.create = function(content, namespace, root)
  {
    /*
     According to information on the Microsoft XML Team's WebLog
     it is recommended to check for availability of MSXML versions 6.0 and 3.0.
     Other versions are included for completeness, 5.0 is excluded as it is
     "off-by-default" in IE7 (which could trigger a goldbar).

     http://blogs.msdn.com/xmlteam/archive/2006/10/23/using-the-right-version-of-msxml-in-internet-explorer.aspx
     http://msdn.microsoft.com/library/default.asp?url=/library/en-us/xmlsdk/html/aabe29a2-bad2-4cea-8387-314174252a74.asp

    */
    var vServers =
    [
      "MSXML2.DOMDocument.3.0",
      "MSXML2.DOMDocument.6.0",
      "MSXML2.DOMDocument.4.0",
      "MSXML2.DOMDocument",  // v3.0
      "MSXML.DOMDocument",   // v2.x
      "Microsoft.XMLDOM"     // v2.x
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
    return vObject;
  };
}
else
{
  throw new Error("This browser does not support xml dom creation.");
}


/**
 * The string passed in is parsed into a DOM document.
 *
 * @param str {String} the string to be parsed
 * @return {Document}
 *
 * TODO: move to create()
 */
qx.Class.fromString = function(str) {};

if (window.DOMParser)
{
  qx.Class.fromString = function(str) {
    var dom = (new DOMParser()).parseFromString(str, "text/xml");
    return dom;
  };
}
else if (qx.core.Client.getInstance().isMshtml())   // The Microsoft style
{
  qx.Class.fromString = function(str) {
    var dom = qx.xml.Document.create();
    dom.loadXML(str);
    return dom;
  };
}
else
{
  throw new Error("This browser does not support xml dom creation from string.");
}


/**
 * Check whether an object is a Document instance
 *
 * @param obj {Object} object to check
 * @return {Boolean} whether the object is a Document instance
 */
qx.Class.isDocument = function(obj) {
  return (obj.nodeType == qx.dom.Node.DOCUMENT);
};
