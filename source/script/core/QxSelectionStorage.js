function QxSelectionStorage() {
  this.removeAll();
};

QxSelectionStorage.extend(QxObject, "QxSelectionStorage");

proto.add = function(oItem) {
  this._storage[this.getItemHashCode(oItem)] = oItem;
};

proto.remove = function(oItem) {
  delete this._storage[this.getItemHashCode(oItem)];
};

proto.removeAll = function() {
  this._storage = {};
};

proto.contains = function(oItem) {
  return this.getItemHashCode(oItem) in this._storage;
};

proto.toArray = function()
{
  var res = [];

  for (var key in this._storage) {
    res.push(this._storage[key]);
  };

  return res;
};

proto.getFirst = function()
{
  for (var key in this._storage) {
    return this._storage[key];
  };  
};

proto.getChangeValue = function()
{
  var sb = [];

  for (var hc in this._storage) {
    sb.push(hc);
  };

  sb.sort();
  return sb.join(",");
};

proto.getItemHashCode = function(oItem) {
  return oItem.toHash();
};

proto.isEmpty = function() {
  return isHashEmpty(this._storage);
};

proto.dispose = function()
{
  if (this.getDisposed()) {
    return;
  };

  this._storage = null;

  QxObject.prototype.dispose.call(this);  
};