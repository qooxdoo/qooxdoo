function QxTimerManager()
{
  if(QxTimerManager._instance)
    return QxTimerManager._instance;

  QxManager.call(this);
  
  QxTimerManager._instance = this;
};

QxTimerManager.extend(QxManager, "QxTimerManager");
