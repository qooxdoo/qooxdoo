function QxToolBarMenuButton(vText, vIcon, vIconWidth, vIconHeight, vMenu)
{
  QxToolBarButton.call(this, vText, vIcon, vIconWidth, vIconHeight);
  
  if (isValid(vMenu)) {
    this.setMenu(vMenu);
  };
};

QxToolBarMenuButton.extend(QxToolBarButton, "QxToolBarMenuButton");

QxToolBarMenuButton.addProperty({ name : "menu", type : Object });

proto._modifyMenu = function(propValue, propOldValue, propName, uniqModIds)
{
  if (propOldValue) {
    propOldValue.setOpener(null, uniqModIds);
  };

  if (propValue) {
    propValue.setOpener(this, uniqModIds);
  };

  return true;
};

proto._modifyState = function(propValue, propOldValue, propName, uniqModIds)
{
  var vMenu = this.getMenu();
 
  if (vMenu)
  {
    if (propValue == "pressed")
    {

      vMenu.setLeft(this.getComputedPageBoxLeft());
      vMenu.setTop(this.getComputedPageBoxTop() + this.getComputedBoxHeight());
    
      vMenu.setVisible(true, uniqModIds);
    }
    else
    {
      vMenu.setVisible(false, uniqModIds);    
    };
  };
  
  return QxWidget.prototype._modifyState.call(this, propValue, propOldValue, propName, uniqModIds);
};

proto._onmouseover = function(e)
{
  var vMenu = this.getMenu();
  
  if (vMenu == null || !vMenu.getVisible()) {
    this.setState("hover");
  };
};

proto._onmouseout = function(e) 
{
  if (this.getState() == "hover") {
    this.setState(null);
  };
};

proto._onmousedown = function(e) 
{
  if(e.isNotLeftButton()) {
    return;
  };
  
  (new QxMenuManager).update();

  this.setState(this.getState() == "pressed" ? "hover" : "pressed");
  e.setPropagationStopped(true);
};

proto._onmouseup = function(e) {};