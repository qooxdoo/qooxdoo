function QxDataManager()
{
  if(QxDataManager._instance)
    return QxDataManager._instance;

  QxManager.call(this);
  
  QxDataManager._instance = this;
};

QxDataManager.extend(QxManager, "QxDataManager");