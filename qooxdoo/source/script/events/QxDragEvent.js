function QxDragEvent(sType, oMouseEvent)
{
  QxMouseEvent.call(this, sType, oMouseEvent && oMouseEvent._event);
  
  this._manager = new QxDragAndDropManager;
};

QxDragEvent.extend(QxMouseEvent, "QxDragEvent");

proto.getManager = function() {
  return this._manager;
};

proto.startDrag = function()
{
  if (this._type != "dragstart") {
    throw new Error("QxDragEvent startDrag can only be called during the dragstart event");
  };

  this.stopPropagation();
  this._manager.startDrag();
};

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

proto.getTarget = function()
{
  switch (this._type)
  {
    case "dragstart":
    case "dragend":
    case "dragover":
    case "dragout":
    case "dragmove": 
      return this._target;

    case "dragdrop": 
      return this._manager.getDestinationWidget();

    default: 
      return QxMouseEvent.prototype.getTarget.call(this);
  };
};

proto.getRelatedTarget = function()
{
  switch (this._type)
  {
    case "dragover":
    case "dragout": 
      return this._relatedTarget;

    case "dragdrop": 
      return this._manager.getSourceWidget();

    case "dragend": 
      return this._manager.getDestinationWidget();

    default: 
      return QxMouseEvent.prototype.getRelatedTarget.call(this);
  };
};



proto.getRealTarget = function() {
  return QxMouseEvent.prototype.getTarget.call(this);
};



proto.dispose = function()
{
  if (this.getDisposed()) {
    return;
  };

  QxMouseEvent.prototype.dispose.call(this);
  this._relatedTarget = null;
};
