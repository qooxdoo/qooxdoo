function QxMouseEvent(eType, domEvent, autoDispose)
{
  QxEvent.call(this, eType, autoDispose);

  this._domEvent = domEvent;
};

QxMouseEvent.extend(QxEvent, "QxMouseEvent");

// ******************************************************************************************************
// Store last occured event data - this is cool to handle tooltips, windows, ...

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

QxMouseEvent.getScreenX = function() {
  return QxMouseEvent._screenX;
};

QxMouseEvent.getScreenY = function() {
  return QxMouseEvent._screenY;
};

QxMouseEvent.getClientX = function() {
  return QxMouseEvent._clientX;
};

QxMouseEvent.getClientY = function() {
  return QxMouseEvent._clientY;
};

QxMouseEvent.getPageX = function() {
  return QxMouseEvent._pageX;
};

QxMouseEvent.getPageY = function() {
  return QxMouseEvent._pageY;
};

QxMouseEvent.getButton = function() {
  return QxMouseEvent._button;
};

QxMouseEvent._screenX = QxMouseEvent._screenY = QxMouseEvent._clientX = QxMouseEvent._clientY = 0;

// ******************************************************************************************************

proto._domEvent = null;
proto._preventDefault = false;
proto._bubbles = true;
proto._propagationStopped = false;

/*
  Simple Property Short-Cuts
*/
proto.getDomEvent  = function() { return this._domEvent; };
proto.getDomTarget = function() { return this._domEvent.target || this._domEvent.srcElement; };

if ((new QxClient).isGecko())
{
  proto.getPageX   = function() { return this._domEvent.pageX;  };
  proto.getPageY   = function() { return this._domEvent.pageY;  };
}
else if ((new QxClient).isMshtml())
{
  if (isInvalid(document.compatMode) || document.compatMode == "BackCompat")
  {
    proto.getPageX = function() {
      return this._domEvent.clientX + document.documentElement.scrollLeft;
    };

    proto.getPageY = function() {
      return this._domEvent.clientY + document.documentElement.scrollTop;
    };
  }
  else
  {
    proto.getPageX = function() {
      return this._domEvent.clientX + document.body.scrollLeft;
    };

    proto.getPageY = function() {
      return this._domEvent.clientY + document.body.scrollTop;
    };
  };
}
else
{
  // in Konqueror, Opera and iCab, client? really contains the page? value
  proto.getPageX   = function() { return this._domEvent.clientX;  };
  proto.getPageY   = function() { return this._domEvent.clientY;  };
};

if ((new QxClient).isMshtml() || (new QxClient).isGecko())
{
  proto.getClientX   = function() { return this._domEvent.clientX;  };
  proto.getClientY   = function() { return this._domEvent.clientY;  };
}
else
{
  // in Konqueror, Opera and iCab, client? really contains the page? value
  proto.getClientX   = function() { return this._domEvent.clientX + (document.body && document.body.scrollLeft != null ? document.body.scrollLeft : 0);  };
  proto.getClientY   = function() { return this._domEvent.clientY + (document.body && document.body.scrollTop != null ? document.body.scrollTop : 0);  };
};

proto.getScreenX   = function() { return this._domEvent.screenX;  };
proto.getScreenY   = function() { return this._domEvent.screenY;  };

proto.getCtrlKey   = function() { return this._domEvent.ctrlKey;  };
proto.getShiftKey  = function() { return this._domEvent.shiftKey; };
proto.getAltKey    = function() { return this._domEvent.altKey;   };

proto.getDomTargetByTagName = function(elemTagName, stopElem)
{
  var dt = this.getDomTarget();

  while(dt && dt.tagName != elemTagName && dt != stopElem) {
    dt = dt.parentNode;
  };

  if (dt && dt.tagName == elemTagName) {
    return dt;
  };

  return null;
};




/*
  -------------------------------------------------------------------------------
    PREVENT DEFAULT SUPPORT
  -------------------------------------------------------------------------------
*/

if((new QxClient).isMshtml())
{
  proto.preventDefault = function()
  {
    this._domEvent.returnValue = false;

    this._defaultPrevented = true;
  };
}
else
{
  proto.preventDefault = function()
  {
    this._domEvent.preventDefault();
    this._domEvent.returnValue = false;

    this._defaultPrevented = true;
  };
};

proto.getDefaultPrevented = function()
{
  return this._defaultPrevented;
};





/*
  -------------------------------------------------------------------------------
    TARGET SUPPORT
  -------------------------------------------------------------------------------
*/

proto._target = null;
proto._targetEvaluated = false;
proto._dragDropTarget = null;
proto._dragDropTargetEvaluated = false;
proto._managerTarget = null;
proto._managerTargetEvaluated = false;

proto.getTarget = function()
{
  if (this._targetEvaluated) {
    return this._target;
  };

  this._targetEvaluated = true;
  return this._target = this._evalTarget();
};

proto.getDragDropTarget = function()
{
  if (this._dragDropTargetEvaluated) {
    return this._dragDropTarget;
  };

  this._dragDropTargetEvaluated = true;
  return this._dragDropTarget = this._evalDragDropTarget();
};

proto.getManagerTarget = function()
{
  if (this._managerTargetEvaluated) {
    return this._managerTarget;
  };

  this._managerTargetEvaluated = true;
  return this._managerTarget = this._evalManagerTarget();  
};

proto._evalTarget = function()
{
  var n = this._domEvent.target || this._domEvent.srcElement;
  
  try
  {
    while(n != null && n._QxWidget == null) {
      n = n.parentNode;
    };
  }
  catch (ex)
  {
    return null;
  };

  return n == null ? null : n._QxWidget;  
};

if ((new QxClient).isGecko())
{
  proto._evalDragDropTarget = function()
  {
    if ((this._domEvent.type == "mouseup" || this._domEvent.type == "mousemove") && this._domEvent.button == 0)
    {
      // Mozilla/5.0 (Windows; U; Windows NT 5.1; de-DE; rv:1.7.5) Gecko/20041108 Firefox/1.0
      // Mouse move with button down gives as target always the domNode where
      // the button was pressed down before, not the real "current" target.
      var n = QxDOM.getElementFromPoint(this._domEvent.pageX, this._domEvent.pageY);
    }
    else
    {
      var n = this._domEvent.target;
    };

    try
    {
      while(n != null && n._QxWidget == null) {
        n = n.parentNode;
      };
    }
    catch (ex)
    {
      return null;
    };

    return n == null ? null : n._QxWidget;
  };
}
else
{
  proto._evalDragDropTarget = proto._evalTarget;
};

proto._evalManagerTarget = function()
{
  var n = this._domEvent.target || this._domEvent.srcElement;
  return QxEventManager.prototype._getTargetObject(n);
};






/*
  -------------------------------------------------------------------------------
    RELATED TARGET
  -------------------------------------------------------------------------------
*/

proto._relatedTarget = null;
proto._relatedTargetEvaluated = false;

proto.getRelatedTarget = function()
{
  if (this._relatedTargetEvaluated)
    return this._relatedTarget;

  this._relatedTargetEvaluated = true;
  return this._relatedTarget = this._evalRelatedTarget();
};

proto._evalRelatedTarget = function()
{
  var n = this._domEvent.relatedTarget || (this._type == "mouseover" ? this._domEvent.fromElement : this._domEvent.toElement);

  try
  {
    while(n != null && n._QxWidget == null) {
      n = n.parentNode;
    };
  }
  catch (ex)
  {
    return null;
  };

  return n == null ? null : n._QxWidget;
};





/*
  -------------------------------------------------------------------------------
    BUTTON SUPPORT
  -------------------------------------------------------------------------------
*/

proto._button = 0;
proto._buttonEvaluated = false;

proto.getButton = function()
{
  if (this._buttonEvaluated) {
    return this._button;
  };

  this._buttonEvaluated = true;
  return this._button = this._evalButton();
};

proto.isLeftButton = function() {
  return this.getButton() == "left";
};

proto.isMiddleButton = function() {
  return this.getButton() == "middle";
};

proto.isRightButton = function() {
  return this.getButton() == "right";
};

proto.isNotLeftButton = function() {
  return this.getButton() != "left";
};

proto.isNotMiddleButton = function() {
  return this.getButton() != "middle";
};

proto.isNotRightButton = function() {
  return this.getButton() != "right";
};

if ((new QxClient).isMshtml())
{
  proto._evalButton = function() {
    var b = this._domEvent.button;
    return b == 1 ? "left" : b == 2 ? "right" : b == 4 ? "middle" : null;
  };

  QxMouseEvent.buttons = { left : 1, right : 2, middle : 4 };
  QxMouseEvent._button = 0;
}
else
{
  proto._evalButton = function() {
    var b = this._domEvent.button;
    return b == 0 ? "left" : b == 2 ? "right" : b == 1 ? "middle" : null;
  };

  QxMouseEvent.buttons = { left : 0, right : 2, middle : 1 };
  QxMouseEvent._button = -1;
};




/*
  -------------------------------------------------------------------------------
    WHEEL SUPPORT
  -------------------------------------------------------------------------------
*/

proto._wheelDelta = 0;
proto._wheelDeltaEvaluated = false;

proto.getWheelDelta = function()
{
  if (this._wheelDeltaEvaluated) {
    return this._wheelDelta;
  };

  this._wheelDeltaEvaluated = true;
  return this._wheelDelta = this._evalWheelDelta();
};

if((new QxClient).isMshtml())
{
  proto._evalWheelDelta = function() {
    return this._domEvent.wheelDelta ? this._domEvent.wheelDelta / 40 : 0;
  };
}
else
{
  proto._evalWheelDelta = function() {
    return -(this._domEvent.detail || 0);
  };
};





/*
  -------------------------------------------------------------------------------
    DISPOSER
  -------------------------------------------------------------------------------
*/
proto.dispose = function()
{
  if(this._disposed)
    return;

  this._domEvent = null;
  QxEvent.prototype.dispose.call(this);
};
