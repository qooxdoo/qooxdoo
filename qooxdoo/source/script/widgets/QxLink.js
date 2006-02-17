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

#package(simpleterminators)

************************************************************************ */

function QxLink(vHtml, vUri, vTarget) 
{
  QxHtml.call(this, vHtml);
  
  if (typeof vUri != QxConst.TYPEOF_UNDEFINED) {
    this.setUri(vUri);
  };

  if (typeof vTarget != QxConst.TYPEOF_UNDEFINED) {
    this.setTarget(vTarget);
  };
};

QxLink.extend(QxHtml, "QxLink");






/*
---------------------------------------------------------------------------
  PROPERTIES
---------------------------------------------------------------------------
*/

/*!
  Any valid html URI
*/
QxLink.addProperty({ name : "uri", type : QxConst.TYPEOF_STRING, defaultValue : "#", impl : "html" });

/*!
  Any valid html target
*/
QxLink.addProperty({ name : "target", type : QxConst.TYPEOF_STRING, defaultValue : "_blank", impl : "html" });






/*
---------------------------------------------------------------------------
  UTILITIES
---------------------------------------------------------------------------
*/

QxLink.LINK_START = "<a target='";
QxLink.HREF_START = "' href='";
QxLink.HREF_STOP = "'>";
QxLink.LINK_STOP = "</a>";

proto._syncHtml = function() 
{
  var vHtml = [];
  
  vHtml.push(QxLink.LINK_START);
  vHtml.push(this.getTarget());
  vHtml.push(QxLink.HREF_START);
  vHtml.push(this.getUri());
  vHtml.push(QxLink.HREF_STOP);
  vHtml.push(this.getHtml());
  vHtml.push(QxLink.LINK_STOP);
   
  this.getElement().innerHTML = vHtml.join(QxConst.CORE_EMPTY);
};
