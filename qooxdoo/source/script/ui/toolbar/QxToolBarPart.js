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

#package(toolbar)

************************************************************************ */

qx.ui.toolbar.ToolBarPart = function()
{
  qx.ui.layout.HorizontalBoxLayout.call(this);

  this._handle = new qx.ui.toolbar.ToolBarPartHandle;
  this.add(this._handle);
};

qx.ui.toolbar.ToolBarPart.extend(qx.ui.layout.HorizontalBoxLayout, "qx.ui.toolbar.ToolBarPart");

qx.ui.toolbar.ToolBarPart.changeProperty({ name : "appearance", type : QxConst.TYPEOF_STRING, defaultValue : "toolbar-part" });





/*
---------------------------------------------------------------------------
  CLONE
---------------------------------------------------------------------------
*/

// Omit recursive cloning of qx.ui.toolbar.ToolBarPartHandle
proto._cloneRecursive = function(cloneInstance)
{
  var vChildren = this.getChildren();
  var vLength = vChildren.length;

  for (var i=0; i<vLength; i++) {
    if (!(vChildren[i] instanceof qx.ui.toolbar.ToolBarPartHandle)) {
      cloneInstance.add(vChildren[i].clone(true));
    };
  };
};





/*
---------------------------------------------------------------------------
  DISPOSER
---------------------------------------------------------------------------
*/

proto.dispose = function()
{
  if (this.getDisposed()) {
    return;
  };

  if (this._handle)
  {
    this._handle.dispose();
    this._handle = null;
  };

  return qx.ui.layout.HorizontalBoxLayout.prototype.dispose.call(this);
};
