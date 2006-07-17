/* ************************************************************************

   qooxdoo - the new era of web development

   Copyright:
     2004-2006 by 1&1 Internet AG, Germany
     http://www.1und1.de | http://www.1and1.com
     All rights reserved

   License:
     LGPL 2.1: http://creativecommons.org/licenses/LGPL/2.1/

   Internet:
     * http://qooxdoo.org

   Authors:
     * Sebastian Werner (wpbasti)
       <sebastian dot werner at 1und1 dot de>
     * Andreas Ecker (ecker)
       <andreas dot ecker at 1und1 dot de>

************************************************************************ */

/* ************************************************************************

#module(simpleterminators)

************************************************************************ */

qx.OO.defineClass("qx.ui.embed.LinkEmbed", qx.ui.embed.HtmlEmbed, 
function(vHtml, vUri, vTarget)
{
  qx.ui.embed.HtmlEmbed.call(this, vHtml);

  if (typeof vUri != qx.constant.Type.UNDEFINED) {
    this.setUri(vUri);
  }

  if (typeof vTarget != qx.constant.Type.UNDEFINED) {
    this.setTarget(vTarget);
  }
});






/*
---------------------------------------------------------------------------
  PROPERTIES
---------------------------------------------------------------------------
*/

/*!
  Any valid html URI
*/
qx.OO.addProperty({ name : "uri", type : qx.constant.Type.STRING, defaultValue : "#", impl : "html" });

/*!
  Any valid html target
*/
qx.OO.addProperty({ name : "target", type : qx.constant.Type.STRING, defaultValue : "_blank", impl : "html" });






/*
---------------------------------------------------------------------------
  UTILITIES
---------------------------------------------------------------------------
*/

qx.ui.embed.LinkEmbed.LINK_START = "<a target='";
qx.ui.embed.LinkEmbed.HREF_START = "' href='";
qx.ui.embed.LinkEmbed.HREF_STOP = "'>";
qx.ui.embed.LinkEmbed.LINK_STOP = "</a>";

qx.Proto._syncHtml = function()
{
  var vHtml = [];

  vHtml.push(qx.ui.embed.LinkEmbed.LINK_START);
  vHtml.push(this.getTarget());
  vHtml.push(qx.ui.embed.LinkEmbed.HREF_START);
  vHtml.push(this.getUri());
  vHtml.push(qx.ui.embed.LinkEmbed.HREF_STOP);
  vHtml.push(this.getHtml());
  vHtml.push(qx.ui.embed.LinkEmbed.LINK_STOP);

  this.getElement().innerHTML = vHtml.join(qx.constant.Core.EMPTY);
}
