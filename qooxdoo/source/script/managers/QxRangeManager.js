function QxRangeManager() 
{
  // We need no internal objects cache
  QxTarget.call(this);
};

QxRangeManager.extend(QxManager, "QxRangeManager");

QxRangeManager.addProperty({ name : "value", type : Number, defaultValue : 0 });
QxRangeManager.addProperty({ name : "min", type : Number, defaultValue : 0 });
QxRangeManager.addProperty({ name : "max", type : Number, defaultValue : 100 });

proto._checkValue = function(propValue) {
  return Math.max(this.getMin(), Math.min(this.getMax(), Math.floor(propValue)));
};

proto._modifyValue = function(propValue, propOldValue, propName, uniqModIds) 
{
  if (this.hasEventListeners("change")) {
    this.dispatchEvent(new QxEvent("change"));
  };
  return true;
};

proto._checkMax = function(propValue) {
  return Math.floor(propValue);
};

proto._modifyMax = function(propValue, propOldValue, propName, uniqModIds)
{
  this.setValue(Math.min(this.getValue(), propValue));

  if (this.hasEventListeners("change")) {
    this.dispatchEvent(new QxEvent("change"));
  };
  
  return true;
};

proto._checkMin = function(propValue) {
  return Math.floor(propValue);
};

proto._modifyMin = function(propValue, propOldValue, propName, uniqModIds)
{
  this.setValue(Math.max(this.getValue(), propValue));

  if (this.hasEventListeners("change")) {
    this.dispatchEvent(new QxEvent("change"));
  };
  
  return true;
};