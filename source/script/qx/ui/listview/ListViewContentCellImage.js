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

qx.OO.defineClass("qx.ui.listview.ListViewContentCellImage", qx.ui.basic.Image, 
function(vSource, vWidth, vHeight) {
  qx.ui.basic.Image.call(this, vSource, vWidth, vHeight);
});

qx.OO.changeProperty({ name : "appearance", type : qx.Const.TYPEOF_STRING, defaultValue : "list-view-content-cell-image" });

qx.ui.listview.ListViewContentCellImage.empty = {
  source : qx.Const.IMAGE_BLANK
};



/*
---------------------------------------------------------------------------
  CUSTOM SETTER
---------------------------------------------------------------------------
*/

qx.Proto.setSource = function(vSource)
{
  if (this._initialLayoutDone)
  {
    return this._updateContent(qx.manager.object.ImageManager.buildUri(vSource == qx.constant.Core.EMPTY ? qx.Const.IMAGE_BLANK : vSource));
  }
  else
  {
    return qx.ui.basic.Image.prototype.setSource.call(this, vSource);
  };
};

// Omit dimension setup in list-view
qx.Proto._postApplyDimensions = qx.util.Return.returnTrue;
