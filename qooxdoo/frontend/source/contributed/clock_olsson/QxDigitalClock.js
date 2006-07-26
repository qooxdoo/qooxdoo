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

function QxDigitalClock() 
{
  QxClock.call(this);

  var label = this._label = new qx.ui.basic.Label();
  this.setLabel(label);
  this.add(label);
});





/*
------------------------------------------------------------------------------------
  PROPERTIES
------------------------------------------------------------------------------------
*/

QxDigitalClock.SHOW_TWELVE     = "12";
QxDigitalClock.SHOW_TWENTYFOUR = "24";

/*!
  Show a 12 or 24 hour clock.
*/
qx.OO.addProperty({ name : "showHours", type : qx.constant.Type.NUMBER, possibleValues : [QxDigitalClock.SHOW_TWELVE, QxDigitalClock.SHOW_TWENTYFOUR], defaultValue : QxDigitalClock.SHOW_TWELVE });

/*!
  The current value of the interval (this should be used internally only).
*/
qx.OO.addProperty({ name : "label", type : qx.constant.Type.OBJECT });








/*
------------------------------------------------------------------------------------
  UTILITIES
------------------------------------------------------------------------------------
*/

qx.Proto.display = function(hours, minutes, seconds)
{
  var am_pm = "";

  if(this.getShowHours() == "12")
  {
    if (hours > 11)
    {
      am_pm = "PM";
    }
    else
    {
      am_pm = "AM";
    }

    if (hours > 12)
    {
      hours = hours - 12;
    }

    if (hours == 0)
    {
      hours = 12;
    }
  }

  if (minutes <= 9)
  {
    minutes = "0" + minutes;
  }

  if (seconds <= 9)
  {
    seconds = "0" + seconds;
  }

  var time = hours + ':' + minutes + ':' + seconds + " " + am_pm;

  this.getLabel().setHtml(time);
}







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

  if (this._label)
  {
    this._label.dispose();
    this._label = null;
  }

  return QxClock.prototype.dispose.call(this);
}
