function QxToolBarPartHandle() 
{
  QxWidget.call(this);
  
  this.setTop(0);
  this.setBottom(0);
  this.setLeft(0);
  this.setWidth(10);
  
  this._line = new QxWidget;
  
  with(this._line)
  {
    setCssClassName("QxToolBarPartHandleLine");
    
    setTop(2);
    setLeft(3);
    setBottom(2);
    setWidth(4);
  };
  
  this.add(this._line);
};

QxToolBarPartHandle.extend(QxWidget, "QxToolBarPartHandle");

