function QxWindowManager()
{
  if(QxWindowManager._instance) {
    return QxWindowManager._instance;
  };

  QxManager.call(this);
  
  QxWindowManager._instance = this;
};

QxWindowManager.extend(QxManager, "QxWindowManager");

QxWindowManager.addProperty({ name : "activeWindow", type : Object });

proto.update = function(oTarget)
{
  var m;
  
  for (var vHash in this._objects)
  {
    m = this._objects[vHash];
    
    if(!m.getAutoHide()) {
      continue;
    };
    
    m.setVisible(false);   
  };
};

proto._modifyActiveWindow = function(propValue, propOldValue, propName, uniqModIds)
{
  (new QxPopupManager).update();
  
  this.sort();
  
  if (propOldValue && propOldValue.getModal()) {
    propOldValue.getTopLevelWidget().release(propOldValue);
  };  

  if (propValue && propValue.getModal()) {
    propValue.getTopLevelWidget().block(propValue);
  };
  
  return true;
};

proto.compareWindows = function(w1, w2) 
{
  switch((new QxWindowManager).getActiveWindow())
  {
    case w1:
      return 1;
    
    case w2:
      return -1;      
  };
  
  return w1.getZIndex() - w2.getZIndex();
};

proto.sort = function(oObject)
{
  var a = [];
  for (var i in this._objects) {
    a.push(this._objects[i]);
  };  
  
  a.sort(this.compareWindows);

  var minz = QxWindow.prototype._minZindex;
  
  for (var l=a.length, i=0; i<l; i++) {
    a[i].setZIndex(minz+i);
  };
};

proto.add = function(oObject)
{
  QxManager.prototype.add.call(this, oObject);
  
  this.setActiveWindow(oObject);
};

proto.remove = function(oObject)
{
  QxManager.prototype.remove.call(this, oObject);
  
  if (this.getActiveWindow() == oObject)
  {
    var a = [];
    for (var i in this._objects) {
      a.push(this._objects[i]);
    };  
  
    var l = a.length;
    
    if (l==1)
    {
      this.setActiveWindow(a[0]);
    }
    else if (l>1)
    {
      a.sort(this.compareWindows);
      this.setActiveWindow(a[l-1]);
    };
  };
};
