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
#require(QxClient)

************************************************************************ */

if (QxClient.isMshtml())
{
  QxDom.getIframeWindow = function(vIframe)
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

  QxDom.getIframeDocument = function(vIframe)
  {
    try
    {
      var vWin = QxDom.getIframeWindow(vIframe);
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
  QxDom.getIframeWindow = function(vIframe)
  {
    try
    {
      var vDoc = QxDom.getIframeDocument(vIframe);
      return vDoc ? vDoc.defaultView : null;
    }
    catch(ex)
    {
      return null;
    };
  };

  QxDom.getIframeDocument = function(vIframe)
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

QxDom.getIframeBody = function(vIframe)
{
  var vDoc = QxDom.getIframeDocument(vIframe);
  return vDoc ? vDoc.getElementsByTagName("body")[0] : null;
};
