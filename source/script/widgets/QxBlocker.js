function QxBlocker()
{
  QxWidget.call(this);
  
  this.setLocation(0, 0);
  this.setRight(0);
  this.setBottom(0);

  this.setZIndex(1e8);
};

QxBlocker.extend(QxWidget, "QxBlocker");

