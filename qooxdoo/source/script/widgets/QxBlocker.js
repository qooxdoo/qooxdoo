function QxBlocker()
{
  QxWidget.call(this);
  
  this.setLocation(0, 0);
  this.setRight(0);
  this.setBottom(0);
  this.setZIndex(1e6);  
  
  // mshtml based clients does not reliable block events if object is not visible
  // we can fix this with something visible (or not ;))
  if ((new QxClient).isMshtml()) {
    this.setBackgroundImage((new QxImageManager).getBlank());
  };
};

QxBlocker.extend(QxWidget, "QxBlocker");
