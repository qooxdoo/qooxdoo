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
#require(qx.event.types.MouseEvent)

************************************************************************ */

qx.event.types.MouseEvent._screenX = qx.event.types.MouseEvent._screenY = qx.event.types.MouseEvent._clientX = qx.event.types.MouseEvent._clientY = qx.event.types.MouseEvent._pageX = qx.event.types.MouseEvent._pageY = 0;
qx.event.types.MouseEvent._button = null;

qx.event.types.MouseEvent._storeEventState = function(e)
{
  qx.event.types.MouseEvent._screenX = e.getScreenX();
  qx.event.types.MouseEvent._screenY = e.getScreenY();
  qx.event.types.MouseEvent._clientX = e.getClientX();
  qx.event.types.MouseEvent._clientY = e.getClientY();
  qx.event.types.MouseEvent._pageX   = e.getPageX();
  qx.event.types.MouseEvent._pageY   = e.getPageY();
  qx.event.types.MouseEvent._button  = e.getButton();
};

qx.event.types.MouseEvent.getScreenX = function() { return qx.event.types.MouseEvent._screenX; };
qx.event.types.MouseEvent.getScreenY = function() { return qx.event.types.MouseEvent._screenY; };
qx.event.types.MouseEvent.getClientX = function() { return qx.event.types.MouseEvent._clientX; };
qx.event.types.MouseEvent.getClientY = function() { return qx.event.types.MouseEvent._clientY; };
qx.event.types.MouseEvent.getPageX   = function() { return qx.event.types.MouseEvent._pageX;   };
qx.event.types.MouseEvent.getPageY   = function() { return qx.event.types.MouseEvent._pageY;   };
qx.event.types.MouseEvent.getButton  = function() { return qx.event.types.MouseEvent._button;  };

if (qx.sys.Client.isMshtml())
{
  qx.event.types.MouseEvent.buttons = { left : 1, right : 2, middle : 4 };
}
else
{
  qx.event.types.MouseEvent.buttons = { left : 0, right : 2, middle : 1 };
};
