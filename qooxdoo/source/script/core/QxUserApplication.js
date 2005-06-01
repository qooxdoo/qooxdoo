/* ********************************************************************
   Class: QxUserApplication
******************************************************************** */

function QxUserApplication()
{
  if (QxUserApplication._instance) {
    return QxUserApplication._instance;
  };

  QxTarget.call(this);

  QxUserApplication._instance = this;
};

QxUserApplication.extend(QxTarget, "QxUserApplication");


/*
  -------------------------------------------------------------------------------
    DISPOSER
  -------------------------------------------------------------------------------
*/

proto.dispose = function()
{
  if (this.getDisposed()) {
    return;
  };

  var dispose_start = (new Date).valueOf();
    
  QxTarget.prototype.dispose.call(this);

  QxObject.dispose();
  QxDebug("QxUserApplication", "Dispose total: " + ((new Date).valueOf() - dispose_start) + "ms");
};
