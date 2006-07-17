/* ************************************************************************

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
     * Sebastian Werner (wpbasti)
       <sebastian dot werner at 1und1 dot de>
     * Andreas Ecker (ecker)
       <andreas dot ecker at 1und1 dot de>

************************************************************************ */

/* ************************************************************************

#module(eventcore)

************************************************************************ */

/*!
  A mouse event instance contains all data for each occured mouse event
*/
qx.OO.defineClass("qx.event.type.MouseEvent", qx.event.type.DomEvent,
function(vType, vDomEvent, vDomTarget, vTarget, vOriginalTarget, vRelatedTarget)
{
  qx.event.type.DomEvent.call(this, vType, vDomEvent, vDomTarget, vTarget, vOriginalTarget);

  if (vRelatedTarget) {
    this.setRelatedTarget(vRelatedTarget);
  }
});

qx.Class.C_BUTTON_LEFT = "left";
qx.Class.C_BUTTON_MIDDLE = "middle";
qx.Class.C_BUTTON_RIGHT = "right";
qx.Class.C_BUTTON_NONE = "none";



/* ************************************************************************
   Class data, properties and methods
************************************************************************ */

/*
---------------------------------------------------------------------------
  CLASS PROPERTIES AND METHODS
---------------------------------------------------------------------------
*/

qx.event.type.MouseEvent._screenX = qx.event.type.MouseEvent._screenY = qx.event.type.MouseEvent._clientX = qx.event.type.MouseEvent._clientY = qx.event.type.MouseEvent._pageX = qx.event.type.MouseEvent._pageY = 0;
qx.event.type.MouseEvent._button = null;

qx.event.type.MouseEvent._storeEventState = function(e)
{
  qx.event.type.MouseEvent._screenX = e.getScreenX();
  qx.event.type.MouseEvent._screenY = e.getScreenY();
  qx.event.type.MouseEvent._clientX = e.getClientX();
  qx.event.type.MouseEvent._clientY = e.getClientY();
  qx.event.type.MouseEvent._pageX   = e.getPageX();
  qx.event.type.MouseEvent._pageY   = e.getPageY();
  qx.event.type.MouseEvent._button  = e.getButton();
}

qx.event.type.MouseEvent.getScreenX = function() { return qx.event.type.MouseEvent._screenX; }
qx.event.type.MouseEvent.getScreenY = function() { return qx.event.type.MouseEvent._screenY; }
qx.event.type.MouseEvent.getClientX = function() { return qx.event.type.MouseEvent._clientX; }
qx.event.type.MouseEvent.getClientY = function() { return qx.event.type.MouseEvent._clientY; }
qx.event.type.MouseEvent.getPageX   = function() { return qx.event.type.MouseEvent._pageX;   }
qx.event.type.MouseEvent.getPageY   = function() { return qx.event.type.MouseEvent._pageY;   }
qx.event.type.MouseEvent.getButton  = function() { return qx.event.type.MouseEvent._button;  }

if (qx.sys.Client.isMshtml())
{
  qx.event.type.MouseEvent.buttons = { left : 1, right : 2, middle : 4 }
}
else
{
  qx.event.type.MouseEvent.buttons = { left : 0, right : 2, middle : 1 }
}






/* ************************************************************************
   Instance data, properties and methods
************************************************************************ */

/*
---------------------------------------------------------------------------
  SCREEN COORDINATES SUPPORT
---------------------------------------------------------------------------
*/

qx.Proto.getScreenX = function() {
  return this.getDomEvent().screenX;
}

qx.Proto.getScreenY = function() {
  return this.getDomEvent().screenY;
}








/*
---------------------------------------------------------------------------
  PAGE COORDINATES SUPPORT
---------------------------------------------------------------------------
*/

if (qx.sys.Client.isMshtml())
{
qx.OO.addFastProperty({ name : "pageX", readOnly : true });
qx.OO.addFastProperty({ name : "pageY", readOnly : true });

  if (qx.sys.Client.isInQuirksMode())
  {
    qx.Proto._computePageX = function() {
      return this.getDomEvent().clientX + document.documentElement.scrollLeft;
    }

    qx.Proto._computePageY = function() {
      return this.getDomEvent().clientY + document.documentElement.scrollTop;
    }
  }
  else
  {
    qx.Proto._computePageX = function() {
      return this.getDomEvent().clientX + document.body.scrollLeft;
    }

    qx.Proto._computePageY = function() {
      return this.getDomEvent().clientY + document.body.scrollTop;
    }
  }
}
else if (qx.sys.Client.isGecko())
{
  qx.Proto.getPageX = function() {
    return this.getDomEvent().pageX;
  }

  qx.Proto.getPageY = function() {
    return this.getDomEvent().pageY;
  }
}
else
{
  qx.Proto.getPageX = function() {
    return this.getDomEvent().clientX;
  }

  qx.Proto.getPageY = function() {
    return this.getDomEvent().clientY;
  }
}







/*
---------------------------------------------------------------------------
  CLIENT COORDINATES SUPPORT
---------------------------------------------------------------------------
*/

if (qx.sys.Client.isMshtml() || qx.sys.Client.isGecko())
{
  qx.Proto.getClientX = function() {
    return this.getDomEvent().clientX;
  }

  qx.Proto.getClientY = function() {
    return this.getDomEvent().clientY;
  }
}
else
{
qx.OO.addFastProperty({ name : "clientX", readOnly : true });
qx.OO.addFastProperty({ name : "clientY", readOnly : true });

  qx.Proto._computeClientX = function() {
    return this.getDomEvent().clientX + (document.body && document.body.scrollLeft != null ? document.body.scrollLeft : 0);
  }

  qx.Proto._computeClientY = function() {
    return this.getDomEvent().clientY + (document.body && document.body.scrollTop != null ? document.body.scrollTop : 0);
  }
}







/*
---------------------------------------------------------------------------
  BUTTON SUPPORT
---------------------------------------------------------------------------
*/

qx.OO.addFastProperty({ name : "button", readOnly : true });

qx.Proto.isLeftButtonPressed = function() {
  return this.getButton() === qx.event.type.MouseEvent.C_BUTTON_LEFT;
}

qx.Proto.isMiddleButtonPressed = function() {
  return this.getButton() === qx.event.type.MouseEvent.C_BUTTON_MIDDLE;
}

qx.Proto.isRightButtonPressed = function() {
  return this.getButton() === qx.event.type.MouseEvent.C_BUTTON_RIGHT;
}

if (qx.sys.Client.isMshtml())
{
  qx.Proto._computeButton = function()
  {
    switch(this.getDomEvent().button)
    {
      case 1:
        return qx.event.type.MouseEvent.C_BUTTON_LEFT;

      case 2:
        return qx.event.type.MouseEvent.C_BUTTON_RIGHT;

      case 4:
        return qx.event.type.MouseEvent.C_BUTTON_MIDDLE;

      default:
        return qx.event.type.MouseEvent.C_BUTTON_NONE;
    }
  }
}
else
{
  qx.Proto._computeButton = function()
  {
    switch(this.getDomEvent().button)
    {
      case 0:
        return qx.event.type.MouseEvent.C_BUTTON_LEFT;

      case 1:
        return qx.event.type.MouseEvent.C_BUTTON_MIDDLE;

      case 2:
        return qx.event.type.MouseEvent.C_BUTTON_RIGHT;

      default:
        return qx.event.type.MouseEvent.C_BUTTON_NONE;
    }
  }
}








/*
---------------------------------------------------------------------------
  WHEEL SUPPORT
---------------------------------------------------------------------------
*/

qx.OO.addFastProperty({ name : "wheelDelta", readOnly : true });

if(qx.sys.Client.isMshtml())
{
  qx.Proto._computeWheelDelta = function() {
    return this.getDomEvent().wheelDelta ? this.getDomEvent().wheelDelta / 40 : 0;
  }
}
else
{
  qx.Proto._computeWheelDelta = function() {
    return -(this.getDomEvent().detail || 0);
  }
}
