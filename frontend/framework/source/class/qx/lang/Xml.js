/* ************************************************************************

   qooxdoo - the new era of web development

   http://qooxdoo.org

   Copyright:
     2004-2006 by 1&1 Internet AG, Germany, http://www.1and1.org

   License:
     LGPL 2.1: http://www.gnu.org/licenses/lgpl.html

   Authors:
     * Sebastian Werner (wpbasti)
     * Andreas Ecker (ecker)

************************************************************************ */

/* ************************************************************************


************************************************************************ */

qx.OO.defineClass("qx.lang.Xml");

// Create a XML dom node
qx.lang.Xml.createXmlDom = function()
{
  // The Mozilla style
  if (document.implementation && document.implementation.createDocument) {
    return document.implementation.createDocument("", "", null);
  }

  // The Microsoft style
  if (window.ActiveXObject) {
    var vServers =
      [
        "MSXML2.DOMDocument.6.0",
        "MSXML2.DOMDocument.5.0",
        "MSXML2.DOMDocument.4.0",
        "MSXML2.DOMDocument.3.0",
        "MSXML2.DOMDocument.2.0",
        "MSXML2.DOMDocument",
        "Microsoft.DOMDocument"
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
    return vObject;
  }

  throw new Error("This browser does not support xml dom creation.");
};
