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


************************************************************************ */

qx.OO.defineClass("qx.ui.listview.ListViewContentCellImage", qx.ui.basic.Image,
function(vSource, vWidth, vHeight) {
  qx.ui.basic.Image.call(this, vSource, vWidth, vHeight);
});

qx.OO.changeProperty({ name : "appearance", type : qx.constant.Type.STRING, defaultValue : "list-view-content-cell-image" });

qx.ui.listview.ListViewContentCellImage.empty = {
  source : "static/image/blank.gif"
}



/*
---------------------------------------------------------------------------
  CUSTOM SETTER
---------------------------------------------------------------------------
*/

qx.Proto.setSource = function(vSource)
{
  if (this._initialLayoutDone)
  {
    return this._updateContent(qx.manager.object.AliasManager.resolvePath(vSource == qx.constant.Core.EMPTY ? "static/image/blank.gif" : vSource));
  }
  else
  {
    return qx.ui.basic.Image.prototype.setSource.call(this, vSource);
  }
}

// Omit dimension setup in list-view
qx.Proto._postApplyDimensions = qx.util.Return.returnTrue;
