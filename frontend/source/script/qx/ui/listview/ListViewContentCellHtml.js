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

#module(listview)

************************************************************************ */

qx.OO.defineClass("qx.ui.listview.ListViewContentCellHtml", qx.ui.embed.HtmlEmbed, 
function(vHtml)
{
  qx.ui.embed.HtmlEmbed.call(this, vHtml);

  this.setSelectable(false);
});

qx.OO.changeProperty({ name : "appearance", type : qx.constant.Type.STRING, defaultValue : "list-view-content-cell-html" });

qx.ui.listview.ListViewContentCellHtml.empty = {
  html : qx.constant.Core.EMPTY
}
