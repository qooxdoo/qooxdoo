function QxDragEvent(vType, vMouseEvent, vAutoDispose)
{
  this._mouseEvent = vMouseEvent;
  this._manager = new QxDragAndDropManager;

  QxMouseEvent.call(this, vType, vMouseEvent ? vMouseEvent._domEvent : null, vAutoDispose);
};

QxDragEvent.extend(QxMouseEvent, "QxDragEvent");

/*
  -------------------------------------------------------------------------------
    UTILITY
  -------------------------------------------------------------------------------
*/

proto.getManager = function() {
  return this._manager;
};

proto.getMouseEvent = function() {
  return this._mouseEvent;
};



/*
  -------------------------------------------------------------------------------
    FRONTEND FUNCTION
  -------------------------------------------------------------------------------
*/

proto.startDrag = function()
{
  if (this._type != "dragstart") {
    throw new Error("QxDragEvent startDrag can only be called during the dragstart event");
  };

  this.stopPropagation();
  this._manager.startDrag();
};





/*
  -------------------------------------------------------------------------------
    DATA SUPPORT
  -------------------------------------------------------------------------------
*/

proto.addData = function(sType, oData) {
  this._manager.addData(sType, oData);
};

proto.getData = function(sType) {
  return this._manager.getData(sType);
};

proto.clearData = function() {
  this._manager.clearData();
};

proto.getDropDataTypes = function() {
  return this._manager.getDropDataTypes();
};




/*
  -------------------------------------------------------------------------------
    ACTION SUPPORT
  -------------------------------------------------------------------------------
*/

proto.addAction = function(sAction) {
  this._manager.addAction(sAction);
};

proto.removeAction = function(sAction) {
  this._manager.removeAction(sAction);
};

proto.getAction = function() {
  return this._manager.getCurrentAction();
};

proto.clearActions = function() {
  this._manager.clearActions();
};





/*
  -------------------------------------------------------------------------------
    TARGET SUPPORT
  -------------------------------------------------------------------------------
*/

proto._evalTarget = function()
{
  switch(this._type)
  {
    case "dragstart":
    case "dragend":
    case "dragover":
    case "dragout":
    case "dragmove": 
      // Will be setuped through QxDragAndDropManager
      return this._target;
          
    case "dragdrop":
      return this._manager.getDestinationWidget();
    
    default:
      return QxMouseEvent.prototype._evalTarget.call(this);  
  };
};

proto._evalRelatedTarget = function()
{
  switch(this._type)
  {
    case "dragover":
    case "dragout": 
      // Will be setuped through QxDragAndDropManager
      return this._relatedTarget;    
    
    case "dragdrop":
      return this._manager.getSourceWidget();
    
    case "dragend":
      return this._manager.getDestinationWidget();
      
    default:
      return QxMouseEvent.prototype._evalRelatedTarget.call(this);        
  }; 
};





/*
  -------------------------------------------------------------------------------
    DISPOSER
  -------------------------------------------------------------------------------
*/

proto.dispose = function()
{
  if (this.getDisposed()) {
    return;
  };

  QxMouseEvent.prototype.dispose.call(this);
  
  this._relatedTarget = null;
  this._target = null;
};
