/*!
  A application like menubar. 
  
  Simply add some instances of QxMenuBarButton to fill.
*/
function QxMenuBar()
{
  QxWidget.call(this);
  
  this.addEventListener("keydown", this._onkeydown);
};

QxMenuBar.extend(QxWidget, "QxMenuBar");



/*
------------------------------------------------------------------------------------
  PROPERTIES
------------------------------------------------------------------------------------
*/

QxMenuBar.addProperty({ name : "menu", type : Object });




/*
------------------------------------------------------------------------------------
  MODIFIER
------------------------------------------------------------------------------------
*/

proto._modifyMenu = function(propValue, propOldValue, propName, uniqModIds)
{
  if (propOldValue)
  {
    propOldValue.getOpener().setState("normal", uniqModIds);
    propOldValue.setVisible(false, uniqModIds);
  };

  if (propValue)
  {
    var vOpener = propValue.getOpener();
    
    propValue.setLeft(vOpener.getComputedPageBoxLeft(), uniqModIds);
    propValue.setTop(vOpener.getComputedPageBoxBottom(), uniqModIds);
    propValue.setVisible(true, uniqModIds);
  };

  return true;
};



/*
------------------------------------------------------------------------------------
  EVENTS
------------------------------------------------------------------------------------
*/

proto._onkeydown = function(e)
{
  switch(e.getKeyCode())
  {
    case QxKeyEvent.keys.left:
      this._goLeft(e);
      break;
      
    case QxKeyEvent.keys.right:
      this._goRight(e);
      break;  
  };
};

proto._goLeft = function(e)
{
  var vMenu = this.getMenu();
  
  if (!vMenu) {
    return;
  };
  
  var vOpener = vMenu.getOpener();
  
  if (!vOpener) {
    return;
  };
  
  var vPrev = vOpener ? vOpener.isFirstChild() ? this.getLastChild() : vOpener.getPreviousActiveSibling() : this.getLastChild();
  vPrev.setState("pressed");
};

proto._goRight = function(e)
{
  var vMenu = this.getMenu();
  
  if (!vMenu) {
    return;
  };
  
  var vOpener = vMenu.getOpener();
  
  if (!vOpener) {
    return;
  };
  
  var vNext = vOpener ? vOpener.isLastChild() ? this.getFirstChild() : vOpener.getNextActiveSibling() : this.getFirstChild();
  vNext.setState("pressed");
};

