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
#require(QxClient)
#require(QxDomCore)

************************************************************************ */

if (QxClient.isMshtml())
{
  QxDom.getWindowInnerWidth = function(w)
  {
    if (w.document.documentElement && w.document.documentElement.clientWidth)
    {
      return w.document.documentElement.clientWidth;
    }
    else if (w.document.body)
    {
      return w.document.body.clientWidth;
    };

    return 0;
  };

  QxDom.getWindowInnerHeight = function(w)
  {
    if (w.document.documentElement && w.document.documentElement.clientHeight)
    {
      return w.document.documentElement.clientHeight;
    }
    else if (w.document.body)
    {
      return w.document.body.clientHeight;
    };

    return 0;
  };

  QxDom.getClientScrollLeft = function(w)
  {
    if (w.document.documentElement && w.document.documentElement.scrollLeft)
    {
      return w.document.documentElement.scrollLeft;
    }
    else if (w.document.body)
    {
      return w.document.body.scrollTop;
    };

    return 0;
  };

  QxDom.getClientScrollTop = function(w)
  {
    if (w.document.documentElement && w.document.documentElement.scrollTop)
    {
      return w.document.documentElement.scrollTop;
    }
    else if (w.document.body)
    {
      return w.document.body.scrollTop;
    };

    return 0;
  };
}
else
{
  QxDom.getWindowInnerWidth = function(w) {
    return w.innerWidth;
  };

  QxDom.getWindowInnerHeight = function(w) {
    return w.innerHeight;
  };

  QxDom.getClientScrollLeft = function(w) {
    return w.document.body.scrollLeft;
  };

  QxDom.getClientScrollTop = function(w) {
    return w.document.body.scrollTop;
  };
};
