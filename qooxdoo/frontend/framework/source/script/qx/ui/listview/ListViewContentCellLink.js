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

qx.OO.defineClass("qx.ui.listview.ListViewContentCellLink", qx.ui.embed.LinkEmbed, 
function(vHtml)
{
  qx.ui.embed.LinkEmbed.call(this, vHtml);

  // selectable = false will break links in gecko based browsers
  this.setSelectable(true);
});

qx.OO.changeProperty({ name : "appearance", type : qx.constant.Type.STRING, defaultValue : "list-view-content-cell-link" });

qx.ui.listview.ListViewContentCellLink.empty =
{
  html : qx.constant.Core.EMPTY,
  uri : qx.constant.Core.HASH
}
