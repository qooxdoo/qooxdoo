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

************************************************************************ */

/*!
  A mouse event instance contains all data for each occured mouse event
*/
qx.event.types.MouseEvent = function(vType, vDomEvent, vDomTarget, vTarget, vOriginalTarget, vRelatedTarget)
{
  qx.event.types.DomEvent.call(this, vType, vDomEvent, vDomTarget, vTarget, vOriginalTarget);

  if (vRelatedTarget) {
    this.setRelatedTarget(vRelatedTarget);
  };
};

qx.event.types.MouseEvent.extend(qx.event.types.DomEvent, "qx.event.types.MouseEvent");




/* ************************************************************************
   Class data, properties and methods
************************************************************************ */

/*
---------------------------------------------------------------------------
  CLASS PROPERTIES AND METHODS
---------------------------------------------------------------------------
*/

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






/* ************************************************************************
   Instance data, properties and methods
************************************************************************ */

/*
---------------------------------------------------------------------------
  SCREEN COORDINATES SUPPORT
---------------------------------------------------------------------------
*/

proto.getScreenX = function() {
  return this.getDomEvent().screenX;
};

proto.getScreenY = function() {
  return this.getDomEvent().screenY;
};








/*
---------------------------------------------------------------------------
  PAGE COORDINATES SUPPORT
---------------------------------------------------------------------------
*/

if (qx.sys.Client.isMshtml())
{
  qx.event.types.MouseEvent.addFastProperty({ name : "pageX", readOnly : true });
  qx.event.types.MouseEvent.addFastProperty({ name : "pageY", readOnly : true });

  if (qx.sys.Client.isInQuirksMode())
  {
    proto._computePageX = function() {
      return this.getDomEvent().clientX + document.documentElement.scrollLeft;
    };

    proto._computePageY = function() {
      return this.getDomEvent().clientY + document.documentElement.scrollTop;
    };
  }
  else
  {
    proto._computePageX = function() {
      return this.getDomEvent().clientX + document.body.scrollLeft;
    };

    proto._computePageY = function() {
      return this.getDomEvent().clientY + document.body.scrollTop;
    };
  };
}
else if (qx.sys.Client.isGecko())
{
  proto.getPageX = function() {
    return this.getDomEvent().pageX;
  };

  proto.getPageY = function() {
    return this.getDomEvent().pageY;
  };
}
else
{
  proto.getPageX = function() {
    return this.getDomEvent().clientX;
  };

  proto.getPageY = function() {
    return this.getDomEvent().clientY;
  };
};







/*
---------------------------------------------------------------------------
  CLIENT COORDINATES SUPPORT
---------------------------------------------------------------------------
*/

if (qx.sys.Client.isMshtml() || qx.sys.Client.isGecko())
{
  proto.getClientX = function() {
    return this.getDomEvent().clientX;
  };

  proto.getClientY = function() {
    return this.getDomEvent().clientY;
  };
}
else
{
  qx.event.types.MouseEvent.addFastProperty({ name : "clientX", readOnly : true });
  qx.event.types.MouseEvent.addFastProperty({ name : "clientY", readOnly : true });

  proto._computeClientX = function() {
    return this.getDomEvent().clientX + (document.body && document.body.scrollLeft != null ? document.body.scrollLeft : 0);
  };

  proto._computeClientY = function() {
    return this.getDomEvent().clientY + (document.body && document.body.scrollTop != null ? document.body.scrollTop : 0);
  };
};







/*
---------------------------------------------------------------------------
  BUTTON SUPPORT
---------------------------------------------------------------------------
*/

qx.event.types.MouseEvent.addFastProperty({ name : "button", readOnly : true });

proto.isLeftButtonPressed = function() {
  return this.getButton() === qx.Const.BUTTON_LEFT;
};

proto.isMiddleButtonPressed = function() {
  return this.getButton() === qx.Const.BUTTON_MIDDLE;
};

proto.isRightButtonPressed = function() {
  return this.getButton() === qx.Const.BUTTON_RIGHT;
};

if (qx.sys.Client.isMshtml())
{
  proto._computeButton = function()
  {
    switch(this.getDomEvent().button)
    {
      case 1:
        return qx.Const.BUTTON_LEFT;

      case 2:
        return qx.Const.BUTTON_RIGHT;

      case 4:
        return qx.Const.BUTTON_MIDDLE;

      default:
        return qx.Const.BUTTON_NONE;
    };
  };
}
else
{
  proto._computeButton = function()
  {
    switch(this.getDomEvent().button)
    {
      case 0:
        return qx.Const.BUTTON_LEFT;

      case 1:
        return qx.Const.BUTTON_MIDDLE;

      case 2:
        return qx.Const.BUTTON_RIGHT;

      default:
        return qx.Const.BUTTON_NONE;
    };
  };
};








/*
---------------------------------------------------------------------------
  WHEEL SUPPORT
---------------------------------------------------------------------------
*/

qx.event.types.MouseEvent.addFastProperty({ name : "wheelDelta", readOnly : true });

if(qx.sys.Client.isMshtml())
{
  proto._computeWheelDelta = function() {
    return this.getDomEvent().wheelDelta ? this.getDomEvent().wheelDelta / 40 : 0;
  };
}
else
{
  proto._computeWheelDelta = function() {
    return -(this.getDomEvent().detail || 0);
  };
};
