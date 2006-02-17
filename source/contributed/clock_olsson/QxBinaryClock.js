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

function QxBinaryClock() 
{
  QxClock.call(this);

  this._hour1I = new QxImage();
  this._hour2I = new QxImage();
  this._divisor1I = new QxImage();
  this._minute1I = new QxImage();
  this._minute2I = new QxImage();
  this._divisor2I = new QxImage();
  this._second1I = new QxImage();
  this._second2I = new QxImage();

  this.add(this._hour1I, this._hour2I, this._divisor1I, this._minute1I, this._minute2I, this._divisor2I, this._second1I, this._second2I);
};

QxBinaryClock.extend(QxClock, "QxBinaryClock");






/*
------------------------------------------------------------------------------------
  PROPERTIES
------------------------------------------------------------------------------------
*/

QxBinaryClock.SHOW_TWELVE     = "12";
QxBinaryClock.SHOW_TWENTYFOUR = "24";

/*!
  Show a 12 or 24 hour clock.
*/
QxBinaryClock.addProperty({ name : "showHours", type : QxConst.TYPEOF_NUMBER, possibleValues : [QxBinaryClock.SHOW_TWELVE, QxBinaryClock.SHOW_TWENTYFOUR], defaultValue : QxBinaryClock.SHOW_TWELVE });

/*!
  The image path.
*/
QxBinaryClock.addProperty({ name : "imagePath", type : QxConst.TYPEOF_STRING, defaultValue : "./" });

/*!
  The colour of the clock. It must be a subdirectory to imagePath.
*/
QxBinaryClock.addProperty({ name : "color", type : QxConst.TYPEOF_STRING, defaultValue : "green" });





/*
------------------------------------------------------------------------------------
  UTILITIES
------------------------------------------------------------------------------------
*/

proto.display = function(hours, minutes, seconds)
{
  if(this.getShowHours() == 12)
  {
    if (hours > 12)
    {
      hours = hours - 12;
    };

    if (hours == 0)
    {
      hours = 12;
    };
  };

  var time = ((hours < 10) ? "0"+hours : hours) + '' + ((minutes < 10) ? "0"+minutes : minutes) + '' + ((seconds < 10) ? "0"+seconds : seconds);

  var imagePath = this.getImagePath() + this.getColor() +  "/";

  if(this.getShowHours() == 12)
  {
    this._hour1I.setSource(imagePath + time.charAt(0) + ".png");
  }
  else
  {
    this._hour1I.setSource(imagePath + "blank.png");
  };

  this._hour2I.setSource(imagePath + time.charAt(1) + ".png");
  this._divisor1I.setSource(imagePath + "divisor.png");
  this._minute1I.setSource(imagePath + time.charAt(2) + ".png");
  this._minute2I.setSource(imagePath + time.charAt(3) + ".png");
  this._divisor2I.setSource(imagePath + "divisor.png");
  this._second1I.setSource(imagePath + time.charAt(4) + ".png");
  this._second2I.setSource(imagePath + time.charAt(5) + ".png");
};






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

  if(this._hour1I)
  {
    this._hour1I.dispose();
    this._hour1I = null;
  };

  if(this._hour2I)
  {
    this._hour2I.dispose();
    this._hour2I = null;
  };

  if(this._divisor1I)
  {
    this._divisor1I.dispose();
    this._divisor1I = null;
  };

  if(this._minute1I)
  {
    this._minute1I.dispose();
    this._minute1I = null;
  };

  if(this._minute2I)
  {
    this._minute2I.dispose();
    this._minute2I = null;
  };

  if(this._divisor2I)
  {
    this._divisor2I.dispose();
    this._divisor2I = null;
  };

  if(this._second1I)
  {
    this._second1I.dispose();
    this._second1I = null;
  };

  if(this._second2I)
  {
    this._second2I.dispose();
    this._second2I = null;
  };

  return QxClock.prototype.dispose.call(this);
};
