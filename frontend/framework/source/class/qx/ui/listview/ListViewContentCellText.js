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

#module(ui_listview)

************************************************************************ */

qx.OO.defineClass("qx.ui.listview.ListViewContentCellText", qx.ui.embed.TextEmbed,
function(vText)
{
  qx.ui.embed.TextEmbed.call(this, vText);

  this.setStyleProperty(qx.constant.Style.PROPERTY_WHITESPACE, "nowrap");
  this.setStyleProperty(qx.constant.Style.PROPERTY_OVERFLOW_TEXT, qx.constant.Style.OVERFLOW_ELLIPSIS);

  this.setSelectable(false);
});

qx.OO.changeProperty({ name : "appearance", type : qx.constant.Type.STRING, defaultValue : "list-view-content-cell-text" });

qx.ui.listview.ListViewContentCellText.empty = {
  text : qx.constant.Core.EMPTY
}
