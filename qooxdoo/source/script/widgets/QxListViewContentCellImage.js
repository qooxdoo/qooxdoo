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

qx.ui.listview.ListViewContentCellImage = function(vSource, vWidth, vHeight) {
  qx.ui.basic.Image.call(this, vSource, vWidth, vHeight);
};

qx.ui.listview.ListViewContentCellImage.extend(qx.ui.basic.Image, "qx.ui.listview.ListViewContentCellImage");

qx.ui.listview.ListViewContentCellImage.changeProperty({ name : "appearance", type : QxConst.TYPEOF_STRING, defaultValue : "list-view-content-cell-image" });

qx.ui.listview.ListViewContentCellImage.empty = {
  source : QxConst.IMAGE_BLANK
};



/*
---------------------------------------------------------------------------
  CUSTOM SETTER
---------------------------------------------------------------------------
*/

proto.setSource = function(vSource)
{
  if (this._initialLayoutDone)
  {
    return this._updateContent(qx.manager.object.ImageManager.buildUri(vSource == QxConst.CORE_EMPTY ? QxConst.IMAGE_BLANK : vSource));
  }
  else
  {
    return qx.ui.basic.Image.prototype.setSource.call(this, vSource);
  };
};

// Omit dimension setup in list-view
proto._postApplyDimensions = qx.util.returns.returnTrue;
