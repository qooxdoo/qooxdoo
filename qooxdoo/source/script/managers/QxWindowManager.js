function QxWindowManager()
{
  if(QxWindowManager._instance) {
    return QxWindowManager._instance;
  };

  QxManager.call(this);

  QxWindowManager._instance = this;
};

QxWindowManager.extend(QxManager, "QxWindowManager");

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
