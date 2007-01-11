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
 * Core XML functionality
 * 
 * Tested with IE6, Firefox 2.0, WebKit and Opera 9 
 * 
 * http://msdn.microsoft.com/library/default.asp?url=/library/en-us/xmlsdk/html/81f3de54-3b79-46dc-8e01-73ca2d94cdb5.asp
 * http://developer.mozilla.org/en/docs/Parsing_and_serializing_XML
 */
qx.OO.defineClass("qx.xml.Core");

/**
 * Create an XML document
 * http://www.w3.org/TR/DOM-Level-2-Core/core.html#i-Document
 *
 * @return {Document} empty XML document
 */
qx.xml.Core.createXmlDom = function() {};

if (document.implementation && document.implementation.createDocument) // The Mozilla style
{
  qx.xml.Core.createXmlDom = function()
  {
    return document.implementation.createDocument("", "", null);
  }
}
else if (qx.sys.Client.getInstance().isMshtml())   // The Microsoft style
{
  qx.xml.Core.createXmlDom = function()
  {
    /*
     According to information on the Microsoft XML Team's WebLog
     it is recommended to check for availability of MSXML versions 6.0 and 3.0.
     Other versions are included for completeness, 5.0 is excluded as it is
     "off-by-default" in IE7 (which could trigger a goldbar).

     http://blogs.msdn.com/xmlteam/archive/2006/10/23/using-the-right-version-of-msxml-in-internet-explorer.aspx
     http://msdn.microsoft.com/library/default.asp?url=/library/en-us/xmlsdk/html/aabe29a2-bad2-4cea-8387-314174252a74.asp

     See similar code in qx.lang.XmlEmu, qx.io.remote.XmlHttpTransport
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
 * Return a new XMLHttpRequest object suitable for the client browser.
 *
 * @return {XMLHttpRequest}
 */
qx.Class.createXmlHttpRequest = function() { return null };

if (window.XMLHttpRequest)
{
  qx.Class.createXmlHttpRequest = function()
  {
    return new XMLHttpRequest;
  }
}
else if (window.ActiveXObject)
{
  qx.Class.createXmlHttpRequest = function()  
  {
    /*
     According to information on the Microsoft XML Team's WebLog
     it is recommended to check for availability of MSXML versions 6.0 and 3.0.
     Other versions are included for completeness, 5.0 is excluded as it is
     "off-by-default" in IE7 (which could trigger a goldbar).

     http://blogs.msdn.com/xmlteam/archive/2006/10/23/using-the-right-version-of-msxml-in-internet-explorer.aspx
     http://msdn.microsoft.com/library/default.asp?url=/library/en-us/xmlsdk/html/aabe29a2-bad2-4cea-8387-314174252a74.asp

     See similar code in qx.xml.Core, qx.lang.XmlEmu

     msxml3 is preferred over msxml6 because the IE7 native XMLHttpRequest returns a msxml3 document
     and does not work with other xml documents.
    */
    var vServers =
    [
      "MSXML2.XMLHTTP.3.0",
      "MSXML2.XMLHTTP.6.0",
      "MSXML2.XMLHTTP.4.0",
      "MSXML2.XMLHTTP",    // v3.0
      "Microsoft.XMLHTTP"  // v2.x
    ];

    var vObject;
    var vServer;

    for (var i=0, l=vServers.length; i<l; i++)
    {
      vServer = vServers[i];

      try
      {
        vObject = new ActiveXObject(vServer);
        break;
      }
      catch(ex)
      {
        vObject = null;
      }
    }
    return vObject   
  };
}


/**
 * Returns the text content of a DOM element
 * http://developer.mozilla.org/en/docs/DOM:element.textContent
 *
 * @param element {Element} DOM Element
 * @return {String}
 */
 qx.xml.Core.getTextContent = function(element) {
  var text = "";
  var childNodes = element.childNodes;
  for (var i=0; i<childNodes.length; i++) {
    var node = childNodes[i];
    if (node.nodeType == qx.dom.Node.TEXT || node.nodeType == qx.dom.Node.CDATA_SECTION) {
      text += node.nodeValue;
    }
  }
  return text;
};


/**
 * Check whether an object is a Document instance
 * 
 * @param obj {Object} object to check
 * @return {Boolean} whether the object is a Document instance
 */
qx.xml.Core.isDocument = function(obj) {
  // TODO: better check needed here
  return (typeof(obj.createElement) != "undefined");
};


/**
 * The subtree rooted by the specified element or document is serialized to a string.
 * 
 * @param element {Element|Document} The root of the subtree to be serialized. This could be any node, including a Document. 
 * @return {String}
 */
qx.xml.Core.serialize = function(element) {}

if (window.XMLSerializer) {
  qx.xml.Core.serialize = function(element) {
    var element = qx.xml.Core.isDocument(element) ? element.documentElement : element; 
    return (new XMLSerializer()).serializeToString(element);
  }
}
else
{
  qx.xml.Core.serialize = function(element) {
    var element = qx.xml.Core.isDocument(element) ? element.documentElement : element; 
    return element.xml || element.outerHTML;
  }  
}


/**
 * The string passed in is parsed into a DOM document.
 * 
 * @param str {String} the string to be parsed
 * @return {Document}
 */
qx.xml.Core.parse = function(str) {};

if (window.DOMParser)
{
  qx.xml.Core.parse = function(str) {
    var dom = (new DOMParser()).parseFromString(str, "text/xml");
    return dom;
  };  
}
else if (qx.sys.Client.getInstance().isMshtml())   // The Microsoft style
{
  qx.xml.Core.parse = function(str) {
    var dom = qx.xml.Core.createXmlDom();
    dom.loadXML(str);
    return dom;
  }; 
}


/**
 * Selects the first XmlNode that matches the XPath expression.
 * 
 * @param element {Element|Document} root element for the search
 * @param query {String}  XPath query
 * @return {Element} first matching element
 */
 qx.xml.Core.selectSingleNode = function(element, query) {};
 
if (window.XPathEvaluator) 
{
  qx.xml.Core.selectSingleNode = function(element, query) {
    var xpe = new XPathEvaluator();
    return xpe.evaluate(query, element, xpe.createNSResolver(element), XPathResult.FIRST_ORDERED_NODE_TYPE, null).singleNodeValue;
  };
}
else if(qx.sys.Client.getInstance().isMshtml() || document.selectSingleNode) // IE and Opera
{
  qx.xml.Core.selectSingleNode = function(element, query) {
    return element.selectSingleNode(query);
  };
}


/**
 * Selects a list of nodes matching the XPath expression.
 * 
 * @param element {Element|Document} root element for the search
 * @param query {String}  XPath query
 * @return {Element[]} List of matching elements
 */
 qx.xml.Core.selectNodes = function(element, query) {};
 
if (window.XPathEvaluator) 
{
  qx.xml.Core.selectNodes = function(element, query) {
    var xpe = new XPathEvaluator();
    var result = xpe.evaluate(query, element, qx.lang.XmlEmu._xpe.createNSResolver(element), XPathResult.ORDERED_NODE_SNAPSHOT_TYPE, null);
    var nodes = [];
  
    for (var i=0; i<result.snapshotLength; i++) {
      nodes[i] = result.snapshotItem(i);
    }
  
    return nodes;
  };
}
else if(qx.sys.Client.getInstance().isMshtml() || document.selectNodes) // IE and Opera
{
  qx.xml.Core.selectNodes = function(element, query) {
    return element.selectNodes(query);
  };
}