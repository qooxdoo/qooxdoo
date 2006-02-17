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

#package(eventcore)
#require(QxMouseEvent)

************************************************************************ */

QxMouseEvent._screenX = QxMouseEvent._screenY = QxMouseEvent._clientX = QxMouseEvent._clientY = QxMouseEvent._pageX = QxMouseEvent._pageY = 0;
QxMouseEvent._button = null;

QxMouseEvent._storeEventState = function(e)
{
  QxMouseEvent._screenX = e.getScreenX();
  QxMouseEvent._screenY = e.getScreenY();
  QxMouseEvent._clientX = e.getClientX();
  QxMouseEvent._clientY = e.getClientY();
  QxMouseEvent._pageX   = e.getPageX();
  QxMouseEvent._pageY   = e.getPageY();
  QxMouseEvent._button  = e.getButton();
};

QxMouseEvent.getScreenX = function() { return QxMouseEvent._screenX; };
QxMouseEvent.getScreenY = function() { return QxMouseEvent._screenY; };
QxMouseEvent.getClientX = function() { return QxMouseEvent._clientX; };
QxMouseEvent.getClientY = function() { return QxMouseEvent._clientY; };
QxMouseEvent.getPageX   = function() { return QxMouseEvent._pageX;   };
QxMouseEvent.getPageY   = function() { return QxMouseEvent._pageY;   };
QxMouseEvent.getButton  = function() { return QxMouseEvent._button;  };

if (QxClient.isMshtml())
{
  QxMouseEvent.buttons = { left : 1, right : 2, middle : 4 };
}
else
{
  QxMouseEvent.buttons = { left : 0, right : 2, middle : 1 };
};
