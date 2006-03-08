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

************************************************************************ */

QxDom.getIframeContentWindow = function(vIframe) {
	return vIframe.contentWindow /* IE */ || QxDom.getIframeContentDocument(vIframe).defaultView /* Gecko & Opera */ || QxDom.getIframeContentDocument(vIframe).__parent__ || (vIframe.name && document.frames[vIframe.name]) || null;
};

QxDom.getIframeContentDocument = function(vIframe) {
  return vIframe.contentDocument /* W3C */ || ((vIframe.contentWindow) && (vIframe.contentWindow.document)) /* IE */ || ((vIframe.name) && (document.frames[vIframe.name]) && (document.frames[vIframe.name].document)) || null;
};
