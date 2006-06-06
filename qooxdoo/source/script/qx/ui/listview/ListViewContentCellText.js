/* ************************************************************************

   qooxdoo - the new era of web development

   Copyright:
     2004-2006 by Schlund + Partner AG, Germany
     All rights reserved

   License:
     LGPL 2.1: http://creativecommons.org/licenses/LGPL/2.1/

   Internet:
     * http://qooxdoo.org

   Authors:
     * Sebastian Werner (wpbasti)
       <sw at schlund dot de>
     * Andreas Ecker (ecker)
       <ae at schlund dot de>

************************************************************************ */

/* ************************************************************************

#package(listview)

************************************************************************ */

qx.OO.defineClass("qx.ui.listview.ListViewContentCellText", qx.ui.embed.TextEmbed, 
function(vText)
{
  qx.ui.embed.TextEmbed.call(this, vText);

  this.setSelectable(false);
});

qx.OO.changeProperty({ name : "appearance", type : qx.constant.Type.STRING, defaultValue : "list-view-content-cell-text" });

qx.ui.listview.ListViewContentCellText.empty = {
  text : qx.constant.Core.EMPTY
};
