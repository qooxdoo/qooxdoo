function QxMenuManager()
{
  if(QxMenuManager._instance) {
    return QxMenuManager._instance;
  };

  QxManager.call(this);

  QxMenuManager._instance = this;
};

QxMenuManager.extend(QxManager, "QxMenuManager");

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
