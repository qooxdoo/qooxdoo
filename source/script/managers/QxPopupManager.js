function QxPopupManager()
{
  if(QxPopupManager._instance) {
    return QxPopupManager._instance;
  };

  QxManager.call(this);

  QxPopupManager._instance = this;
};

QxPopupManager.extend(QxManager, "QxPopupManager");

proto.update = function(oTarget)
{
  var p;
  
  for (var hc in this._objects)
  {
    p = this._objects[hc];
    
    if(!p.getAutoHide()) {
      continue;
    };

    if(!oTarget || p != oTarget && (!p.contains(oTarget) || p.getVisible()) && new Date - p.getShowTimeStamp() > 100) {
      p.setVisible(false);
    };
  };
};
