/*!
  Application-like MenuBarButton.
  
  This need a instanceof QxMenuBar as parent.
*/
function QxMenuBarButton(vText, vMenu)
{
  QxWidget.call(this);

  this.setCanSelect(false);

  if (isValid(vText)) {
    this.setText(vText);
  };

  if (isValid(vMenu)) {
    this.setMenu(vMenu);
  };

  // Add event listeners
  this.addEventListener("mouseover", this._onmouseover);
  this.addEventListener("mouseout", this._onmouseout);
  this.addEventListener("mousedown", this._onmousedown);
};

QxMenuBarButton.extend(QxWidget, "QxMenuBarButton");



/*
------------------------------------------------------------------------------------
  PROPERTIES
------------------------------------------------------------------------------------
*/

QxMenuBarButton.addProperty({ name : "text", type : String });
QxMenuBarButton.addProperty({ name : "menu" });
QxMenuBarButton.addProperty({ name : "status", type : String, defaultValue : "normal" });





/*
------------------------------------------------------------------------------------
  MODIFIER
------------------------------------------------------------------------------------
*/

proto._modifyElement = function(propValue, propOldValue, propName, uniqModIds)
{
  QxWidget.prototype._modifyElement.call(this, propValue, propOldValue, propName, uniqModIds);

  if (propValue)
  {
    if (!this._textNode) {
      this._textNode = document.createTextNode(this.getText());
    };
    
    propValue.appendChild(this._textNode);
  }
  else if (propOldValue && this._textNode)
  {
    propOldValue.removeChild(this._textNode);
  };

  return true;
};

proto._modifyState = function(propValue, propOldValue, propName, uniqModIds)
{
  var vParent = this.getParent();
  
  if (vParent.getMenu() == this.getMenu())
  {
    if (propValue == null || propValue == "hover")
    {
      vParent.setMenu(null, uniqModIds);  
    };
  }
  else if (propValue == "pressed")
  {
    vParent.setMenu(this.getMenu(), uniqModIds);  
  };
  
  return QxWidget.prototype._modifyState.call(this, propValue, propOldValue, propName, uniqModIds);
};

proto._modifyText = function(propValue, propOldValue, propName, uniqModIds)
{
  if (!this.isCreated()) {
    return true;
  };

  this._textNode.nodeValue = propValue;
  return true;
};

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






/*
------------------------------------------------------------------------------------
  EVENT-HANDLER
------------------------------------------------------------------------------------
*/

proto._onmouseover = function(e)
{
  var vMenu = this.getParent().getMenu();
  if (vMenu != this.getMenu()) {
    this.setState(vMenu ? "pressed" : "hover");
  };
};

proto._onmouseout = function(e) {
  if (this.getState() == "hover") {
    this.setState(null);
  };
};

proto._onmousedown = function(e) 
{
  if(e.isNotLeftButton()) {
    return;
  };

  this.setState(this.getState() == "pressed" ? "hover" : "pressed");
  e.setPropagationStopped(true);
};




/*
------------------------------------------------------------------------------------
  DISPOSER
------------------------------------------------------------------------------------
*/

proto.dispose = function()
{
  if (this.getDisposed()) {
    return;
  };

  QxWidget.prototype.dispose.call(this);
};