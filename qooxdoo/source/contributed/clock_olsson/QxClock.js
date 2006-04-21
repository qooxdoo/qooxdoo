/* ****************************************************************************

   qooxdoo - the new era of web interface development

   Copyright:
     (C) 2004-2006 by Schlund + Partner AG, Germany
         All rights reserved

   License:
     LGPL 2.1: http://creativecommons.org/licenses/LGPL/2.1/

   Internet:
     * http://qooxdoo.oss.schlund.de

   Authors:
     * Kent Olsson (kols)
       <kent dot olsson at chello dot se>

**************************************************************************** */

/* ****************************************************************************

#package(form)

**************************************************************************** */

function QxClock() 
{
  qx.ui.basic.Atom.call(this);

  this.setWidth(qx.Const.CORE_AUTO);

  // ***********************************************************************
  //   TIMER
  // ***********************************************************************
  this._timer = new qx.client.Timer(this.getInterval());

  // ***********************************************************************
  //   EVENTS
  // ***********************************************************************
  this._timer.addEventListener(qx.Const.EVENT_TYPE_INTERVAL, this._oninterval, this);

  this._timer.start();
};

QxClock.extend(qx.ui.basic.Atom, "QxClock");





/*
------------------------------------------------------------------------------------
  PROPERTIES
------------------------------------------------------------------------------------
*/

/*!
  The current value of the interval (this should be used internally only).
*/
QxClock.addProperty({ name : qx.Const.EVENT_TYPE_INTERVAL, type : qx.Const.TYPEOF_NUMBER, defaultValue : 1000 });

/*!
  The current zone. Offset value is 5 for CDT and 6 for CST
*/
QxClock.addProperty({ name : "zoneOffset", type : qx.Const.TYPEOF_NUMBER, defaultValue : -1 });






/*
------------------------------------------------------------------------------------
  INTERVAL HANDLING
------------------------------------------------------------------------------------
*/

proto._oninterval = function(e)
{
  this._timer.stop();

  var date = new Date();
  var hours   = date.getUTCHours();
  var minutes = date.getMinutes();
  var seconds = date.getSeconds();
  var offset  = this.getZoneOffset();
 
  if (hours < offset)
  {
    hours = hours + 24 - offset; // If hours < 0 add 24 for correct time
  }
  else
  {
    hours = hours - offset; // Else just subtract it.
  };

  this.display(hours, minutes, seconds);

  qx.ui.core.Widget.flushGlobalQueues();

  if (this.hasEventListeners(qx.Const.EVENT_TYPE_INTERVAL))
  {
    this.dispatchEvent(new qx.event.types.Event(qx.Const.EVENT_TYPE_INTERVAL));
  };

  this._timer.restartWith(this.getInterval());
};







/*
------------------------------------------------------------------------------------
  UTILITIES
------------------------------------------------------------------------------------
*/

// placeholder method
proto.display = function(hours, minutes, seconds) {};






/*
------------------------------------------------------------------------------------
  DISPOSER
------------------------------------------------------------------------------------
*/

proto.dispose = function()
{
  if (this.getDisposed()) {
    return true;
  };

  if (this._timer)
  {
    this._timer.stop();
    this._timer.removeEventListener(qx.Const.EVENT_TYPE_INTERVAL, this._oninterval, this);
    this._timer.dispose();
    this._timer = null;
  };

  return qx.ui.layout.CanvasLayout.prototype.dispose.call(this);
};
