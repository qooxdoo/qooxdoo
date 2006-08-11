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
