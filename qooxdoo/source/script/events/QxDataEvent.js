function QxDataEvent(eType, newValue, oldValue, autoDispose)
{
  QxEvent.call(this, eType, autoDispose);

  if (typeof newValue != "undefined") {
    this._newValue = newValue;
  };

  if (typeof oldValue != "undefined") {
    this._oldValue = oldValue;
  };
};

QxDataEvent.extend(QxEvent, "QxDataEvent");

proto._propagationStopped = false;

proto.getValue = proto.getData = proto.getNewValue = function() {
  return this._newValue;
};

proto.getOldValue = function() {
  return this._oldValue;
};

proto.dispose = function()
{
  if(this._disposed) {
    return;
  };

  this._newValue = this._oldValue = null;
  QxEvent.prototype.dispose.call(this);
};
