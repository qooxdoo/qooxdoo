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

#package(listview)

************************************************************************ */

qx.ui.listview.ListViewContentCellLink = function(vHtml)
{
  qx.ui.embed.HtmlLinkEmbed.call(this, vHtml);

  // selectable = false will break links in gecko based browsers
  this.setSelectable(true);
};

qx.ui.listview.ListViewContentCellLink.extend(qx.ui.embed.HtmlLinkEmbed, "qx.ui.listview.ListViewContentCellLink");

qx.ui.listview.ListViewContentCellLink.changeProperty({ name : "appearance", type : qx.Const.TYPEOF_STRING, defaultValue : "list-view-content-cell-link" });

qx.ui.listview.ListViewContentCellLink.empty =
{
  html : qx.Const.CORE_EMPTY,
  uri : qx.Const.CORE_HASH
};
