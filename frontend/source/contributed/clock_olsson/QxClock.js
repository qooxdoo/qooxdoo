/* ****************************************************************************

   qooxdoo - the new era of web development

   Copyright:
     2004-2006 by 1&1 Internet AG, Germany
     http://www.1und1.de | http://www.1and1.com
     All rights reserved

   License:
     LGPL 2.1: http://creativecommons.org/licenses/LGPL/2.1/

   Internet:
     * http://qooxdoo.org

   Authors:
     * Kent Olsson (kols)
       <kent dot olsson at chello dot se>

**************************************************************************** */

/* ****************************************************************************

#module(form)

**************************************************************************** */

function QxClock() 
{
  qx.ui.basic.Atom.call(this);

  this.setWidth(qx.constant.Core.AUTO);

  // ***********************************************************************
  //   TIMER
  // ***********************************************************************
  this._timer = new qx.client.Timer(this.getInterval());

  // ***********************************************************************
  //   EVENTS
  // ***********************************************************************
  this._timer.addEventListener(qx.constant.Event.INTERVAL, this._oninterval, this);

  this._timer.start();
});





/*
------------------------------------------------------------------------------------
  PROPERTIES
------------------------------------------------------------------------------------
*/

/*!
  The current value of the interval (this should be used internally only).
*/
qx.OO.addProperty({ name : qx.constant.Event.INTERVAL, type : qx.constant.Type.NUMBER, defaultValue : 1000 });

/*!
  The current zone. Offset value is 5 for CDT and 6 for CST
*/
qx.OO.addProperty({ name : "zoneOffset", type : qx.constant.Type.NUMBER, defaultValue : -1 });






/*
------------------------------------------------------------------------------------
  INTERVAL HANDLING
------------------------------------------------------------------------------------
*/

qx.Proto._oninterval = function(e)
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
  }

  this.display(hours, minutes, seconds);

  qx.ui.core.Widget.flushGlobalQueues();

  if (this.hasEventListeners(qx.constant.Event.INTERVAL))
  {
    this.dispatchEvent(new qx.event.type.Event(qx.constant.Event.INTERVAL));
  }

  this._timer.restartWith(this.getInterval());
}







/*
------------------------------------------------------------------------------------
  UTILITIES
------------------------------------------------------------------------------------
*/

// placeholder method
qx.Proto.display = function(hours, minutes, seconds) {}






/*
------------------------------------------------------------------------------------
  DISPOSER
------------------------------------------------------------------------------------
*/

qx.Proto.dispose = function()
{
  if (this.getDisposed()) {
    return true;
  }

  if (this._timer)
  {
    this._timer.stop();
    this._timer.removeEventListener(qx.constant.Event.INTERVAL, this._oninterval, this);
    this._timer.dispose();
    this._timer = null;
  }

  return qx.ui.layout.CanvasLayout.prototype.dispose.call(this);
}
