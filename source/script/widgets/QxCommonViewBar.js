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

#post(QxRadioManager)

#package(viewcommon)

************************************************************************ */

function QxCommonViewBar()
{
  QxBoxLayout.call(this);

  this._manager = new QxRadioManager;

  this.addEventListener(QxConst.EVENT_TYPE_MOUSEWHEEL, this._onmousewheel);
};

QxCommonViewBar.extend(QxBoxLayout, "QxCommonViewBar");




/*
---------------------------------------------------------------------------
  UTILITY
---------------------------------------------------------------------------
*/

proto.getManager = function() {
  return this._manager;
};





/*
---------------------------------------------------------------------------
  EVENTS
---------------------------------------------------------------------------
*/

proto._lastDate = (new Date(0)).valueOf();

proto._onmousewheel = function(e)
{
  // Make it a bit lazier than it could be
  // Hopefully this is a better behaviour for fast scrolling users
  var vDate = (new Date).valueOf();

  if ((vDate - 50) < this._lastDate) {
    return;
  };

  this._lastDate = vDate;

  var vManager = this.getManager();
  var vItems = vManager.getItems();
  var vPos = vItems.indexOf(vManager.getSelected());

  if (this.getWheelDelta(e) > 0)
  {
    var vNext = vItems[vPos+1];

    if (!vNext) {
      vNext = vItems[0];
    };
  }
  else if (vPos > 0)
  {
    var vNext = vItems[vPos-1];

    if (!vNext) {
      vNext = vItems[0];
    };
  }
  else
  {
    vNext = vItems[vItems.length-1];
  };

  vManager.setSelected(vNext);
};

proto.getWheelDelta = function(e) {
  return e.getWheelDelta();
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

  if (this._manager)
  {
    this._manager.dispose();
    this._manager = null;
  };

  this.removeEventListener(QxConst.EVENT_TYPE_MOUSEWHEEL, this._onmousewheel);

  return QxBoxLayout.prototype.dispose.call(this);
};
