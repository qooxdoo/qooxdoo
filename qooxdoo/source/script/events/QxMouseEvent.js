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
#post(QxMouseEventCore)

************************************************************************ */

/*!
  A mouse event instance contains all data for each occured mouse event
*/
function QxMouseEvent(vType, vDomEvent, vDomTarget, vTarget, vOriginalTarget, vRelatedTarget)
{
  QxDomEvent.call(this, vType, vDomEvent, vDomTarget, vTarget, vOriginalTarget);

  if (vRelatedTarget) {
    this.setRelatedTarget(vRelatedTarget);
  };
};

QxMouseEvent.extend(QxDomEvent, "QxMouseEvent");







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

if (QxClient.isMshtml())
{
  QxMouseEvent.addFastProperty({ name : "pageX", readOnly : true });
  QxMouseEvent.addFastProperty({ name : "pageY", readOnly : true });

  if (QxUtil.isInvalid(document.compatMode) || document.compatMode == QxConst.INTERNAL_BACKCOMPAT)
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
else if (QxClient.isGecko())
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

if (QxClient.isMshtml() || QxClient.isGecko())
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
  QxMouseEvent.addFastProperty({ name : "clientX", readOnly : true });
  QxMouseEvent.addFastProperty({ name : "clientY", readOnly : true });

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

QxMouseEvent.addFastProperty({ name : "button", readOnly : true });

proto.isLeftButtonPressed = function() {
  return this.getButton() === QxConst.BUTTON_LEFT;
};

proto.isMiddleButtonPressed = function() {
  return this.getButton() === QxConst.BUTTON_MIDDLE;
};

proto.isRightButtonPressed = function() {
  return this.getButton() === QxConst.BUTTON_RIGHT;
};

if (QxClient.isMshtml())
{
  proto._computeButton = function()
  {
    switch(this.getDomEvent().button)
    {
      case 1:
        return QxConst.BUTTON_LEFT;

      case 2:
        return QxConst.BUTTON_RIGHT;

      case 4:
        return QxConst.BUTTON_MIDDLE;

      default:
        return QxConst.BUTTON_NONE;
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
        return QxConst.BUTTON_LEFT;

      case 1:
        return QxConst.BUTTON_MIDDLE;

      case 2:
        return QxConst.BUTTON_RIGHT;

      default:
        return QxConst.BUTTON_NONE;
    };
  };
};








/*
---------------------------------------------------------------------------
  WHEEL SUPPORT
---------------------------------------------------------------------------
*/

QxMouseEvent.addFastProperty({ name : "wheelDelta", readOnly : true });

if(QxClient.isMshtml())
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
