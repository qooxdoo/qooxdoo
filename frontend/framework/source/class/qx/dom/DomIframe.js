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

#module(io_remote)
#require(qx.sys.Client)

************************************************************************ */

qx.OO.defineClass("qx.dom.DomIframe");

if (qx.sys.Client.isMshtml())
{
  qx.dom.DomIframe.getWindow = function(vIframe)
  {
    try
    {
      return vIframe.contentWindow;
    }
    catch(ex)
    {
      return null;
    }
  }

  qx.dom.DomIframe.getDocument = function(vIframe)
  {
    try
    {
      var vWin = qx.dom.DomIframe.getWindow(vIframe);
      return vWin ? vWin.document : null;
    }
    catch(ex)
    {
      return null;
    }
  }
}
else
{
  qx.dom.DomIframe.getWindow = function(vIframe)
  {
    try
    {
      var vDoc = qx.dom.DomIframe.getDocument(vIframe);
      return vDoc ? vDoc.defaultView : null;
    }
    catch(ex)
    {
      return null;
    }
  }

  qx.dom.DomIframe.getDocument = function(vIframe)
  {
    try
    {
      return vIframe.contentDocument;
    }
    catch(ex)
    {
      return null;
    }
  }
}

qx.dom.DomIframe.getBody = function(vIframe)
{
  var vDoc = qx.dom.DomIframe.getDocument(vIframe);
  return vDoc ? vDoc.getElementsByTagName("body")[0] : null;
}
