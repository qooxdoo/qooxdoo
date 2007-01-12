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

************************************************************************ */

/* ************************************************************************


************************************************************************ */

qx.OO.defineClass("qx.net.HttpRequest");

/**
 * Return a new XMLHttpRequest object suitable for the client browser.
 *
 * TODO: extract singleton creation of request
 * 
 * @return {XMLHttpRequest}
 */
qx.Class.create = function() { return null };

if (window.XMLHttpRequest)
{
  qx.Class.create = function()
  {
    return new XMLHttpRequest;
  };
}
else if (window.ActiveXObject)
{
  qx.Class.create = function()  
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
