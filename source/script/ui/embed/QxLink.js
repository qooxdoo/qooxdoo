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

qx.ui.embed.HtmlLinkEmbed = function(vHtml, vUri, vTarget)
{
  qx.ui.embed.HtmlEmbed.call(this, vHtml);

  if (typeof vUri != QxConst.TYPEOF_UNDEFINED) {
    this.setUri(vUri);
  };

  if (typeof vTarget != QxConst.TYPEOF_UNDEFINED) {
    this.setTarget(vTarget);
  };
};

qx.ui.embed.HtmlLinkEmbed.extend(qx.ui.embed.HtmlEmbed, "qx.ui.embed.HtmlLinkEmbed");






/*
---------------------------------------------------------------------------
  PROPERTIES
---------------------------------------------------------------------------
*/

/*!
  Any valid html URI
*/
qx.ui.embed.HtmlLinkEmbed.addProperty({ name : "uri", type : QxConst.TYPEOF_STRING, defaultValue : "#", impl : "html" });

/*!
  Any valid html target
*/
qx.ui.embed.HtmlLinkEmbed.addProperty({ name : "target", type : QxConst.TYPEOF_STRING, defaultValue : "_blank", impl : "html" });






/*
---------------------------------------------------------------------------
  UTILITIES
---------------------------------------------------------------------------
*/

qx.ui.embed.HtmlLinkEmbed.LINK_START = "<a target='";
qx.ui.embed.HtmlLinkEmbed.HREF_START = "' href='";
qx.ui.embed.HtmlLinkEmbed.HREF_STOP = "'>";
qx.ui.embed.HtmlLinkEmbed.LINK_STOP = "</a>";

proto._syncHtml = function()
{
  var vHtml = [];

  vHtml.push(qx.ui.embed.HtmlLinkEmbed.LINK_START);
  vHtml.push(this.getTarget());
  vHtml.push(qx.ui.embed.HtmlLinkEmbed.HREF_START);
  vHtml.push(this.getUri());
  vHtml.push(qx.ui.embed.HtmlLinkEmbed.HREF_STOP);
  vHtml.push(this.getHtml());
  vHtml.push(qx.ui.embed.HtmlLinkEmbed.LINK_STOP);

  this.getElement().innerHTML = vHtml.join(QxConst.CORE_EMPTY);
};
