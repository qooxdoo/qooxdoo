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

/*!
  Wraps key events to target functions
*/
proto._onkeydown = function(e)
{
  switch(e.getKeyCode())
  {
    case QxKeyEvent.keys.left:
      this._onkeydown_left(e);
      break;
      
    case QxKeyEvent.keys.right:
      this._onkeydown_right(e);
      break;  
  };
};

proto._onkeydown_left = function(e)
{
  var vMenu = this.getMenu();
  if (!vMenu) {
    return;
  };
  
  var vOpener = vMenu.getOpener();
  if (!vOpener) {
    return;
  };
  
  var vPrev = vOpener ? vOpener.isFirstChild() ? this.getLastActiveChild() : vOpener.getPreviousActiveSibling() : this.getLastActiveChild();
  vPrev.setState("pressed");

  var vPrevMenu = vPrev.getMenu();
  if (vPrevMenu)
  {
    var vPrevFirst = vPrevMenu.getFirstActiveChild();
    if (vPrevFirst) {
      vPrevMenu.setHoverItem(vPrevFirst);      
    };
  };
};

proto._onkeydown_right = function(e)
{
  var vMenu = this.getMenu();
  if (!vMenu) {
    return;
  };
  
  var vOpener = vMenu.getOpener();
  if (!vOpener) {
    return;
  };
  
  var vNext = vOpener ? vOpener.isLastChild() ? this.getFirstActiveChild() : vOpener.getNextActiveSibling() : this.getFirstActiveChild();
  vNext.setState("pressed");
  
  var vNextMenu = vNext.getMenu();
  if (vNextMenu)
  {
    var vNextFirst = vNextMenu.getFirstActiveChild();
    if (vNextFirst) {
      vNextMenu.setHoverItem(vNextFirst);      
    };  
  };
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
  
  // Remove event listeners
  this.removeEventListener("keydown", this._onkeydown);
  
  return QxWidget.prototype.dispose.call(this);
};