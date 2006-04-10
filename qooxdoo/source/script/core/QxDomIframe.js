/* ************************************************************************

   qooxdoo - the new era of web interface development

   Copyright:
     (C) 2004-2006 by Schlund + Partner AG, Germany
         All rights reserved

   License:
     LGPL 2.1: http://creativecommons.org/licenses/LGPL/2.1/

   Internet:
     * http://qooxdoo.oss.schlund.de

   Authors:
     * Sebastian Werner (wpbasti)
       <sebastian dot werner at 1und1 dot de>
     * Andreas Ecker (aecker)
       <andreas dot ecker at 1und1 dot de>

************************************************************************ */

/* ************************************************************************

#package(dom)
#require(QxDomCore)
#require(qx.sys.Client)

************************************************************************ */

if (qx.sys.Client.isMshtml())
{
  qx.dom.getIframeWindow = function(vIframe)
  {
    try
    {
      return vIframe.contentWindow;
    }
    catch(ex)
    {
      return null;
    };
  };

  qx.dom.getIframeDocument = function(vIframe)
  {
    try
    {
      var vWin = qx.dom.getIframeWindow(vIframe);
      return vWin ? vWin.document : null;
    }
    catch(ex)
    {
      return null;
    };
  };
}
else
{
  qx.dom.getIframeWindow = function(vIframe)
  {
    try
    {
      var vDoc = qx.dom.getIframeDocument(vIframe);
      return vDoc ? vDoc.defaultView : null;
    }
    catch(ex)
    {
      return null;
    };
  };

  qx.dom.getIframeDocument = function(vIframe)
  {
    try
    {
      return vIframe.contentDocument;
    }
    catch(ex)
    {
      return null;
    };
  };
};

qx.dom.getIframeBody = function(vIframe)
{
  var vDoc = qx.dom.getIframeDocument(vIframe);
  return vDoc ? vDoc.getElementsByTagName("body")[0] : null;
};
