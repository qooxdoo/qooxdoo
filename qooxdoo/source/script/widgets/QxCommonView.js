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

#package(viewcommon)

************************************************************************ */

function QxCommonView(vBarClass, vPaneClass)
{
  QxBoxLayout.call(this);

  this._bar = new vBarClass;
  this._pane = new vPaneClass;

  this.add(this._bar, this._pane);
  this.setOrientation(QxConst.ORIENTATION_VERTICAL);
};

QxCommonView.extend(QxBoxLayout, "QxCommonView");





/*
---------------------------------------------------------------------------
  UTILITY
---------------------------------------------------------------------------
*/

proto.getPane = function() {
  return this._pane;
};

proto.getBar = function() {
  return this._bar;
};






/*
---------------------------------------------------------------------------
  DISPOSER
---------------------------------------------------------------------------
*/

proto.dispose = function()
{
  if (this.getDisposed()) {
    return true;
  };

  if (this._bar)
  {
    this._bar.dispose();
    this._bar = null;
  };

  if (this._pane)
  {
    this._pane.dispose();
    this._pane = null;
  };

  return QxBoxLayout.prototype.dispose.call(this);
};
