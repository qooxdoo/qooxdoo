function QxList()
{
  QxWidget.call(this);

  this.setCanSelect(false);
  this.setOverflow("auto");
  this.setTabIndex(1);

  this._manager = new QxSelectionManager(this);

  this.addEventListener("mouseover", this._onmouseover);
  this.addEventListener("mousedown", this._onmousedown);
  this.addEventListener("mouseup", this._onmouseup);
  this.addEventListener("click", this._onclick);
  this.addEventListener("dblclick", this._ondblclick);

  this.addEventListener("keydown", this._onkeydown);
  this.addEventListener("keypress", this._onkeypress);
};

QxList.extend(QxWidget, "QxList");

QxList.addProperty({ name : "enableInlineFind", type : Boolean, defaultValue : true });

proto.isFocusRoot = function() { 
  return true; 
};

proto._pressedString = "";

proto._visualizeBlur = function() {};
proto._visualizeFocus = function() {};




/*
  -------------------------------------------------------------------------------
    MANAGER BINDING
  -------------------------------------------------------------------------------
*/

proto.getManager = function() {
  return this._manager;
};

proto.getListItemTarget = function(vItem)
{
  while (vItem != null && vItem.getParent() != this) {
    vItem = vItem.getParent();
  };

  return vItem;
};

proto.getSelectedItem = function() {
  return this.getSelectedItems()[0];
};

proto.getSelectedItems = function() {
  return this._manager.getSelectedItems();
};



/*
  -------------------------------------------------------------------------------
    MOUSE EVENT HANDLER
  -------------------------------------------------------------------------------
*/

proto._onmouseover = function(e)
{
  var vItem = this.getListItemTarget(e.getTarget());

  if (vItem) {
    this._manager.handleMouseOver(vItem, e);
  };
};

proto._onmousedown = function(e)
{
  var vItem = this.getListItemTarget(e.getTarget());

  if (vItem) {
    this._manager.handleMouseDown(vItem, e);
  };
};

proto._onmouseup = function(e)
{
  var vItem = this.getListItemTarget(e.getTarget());

  if (vItem) {
    this._manager.handleMouseUp(vItem, e);
  };
};

proto._onclick = function(e)
{
  var vItem = this.getListItemTarget(e.getTarget());

  if (vItem) {
    this._manager.handleClick(vItem, e);
  };
};

proto._ondblclick = function(e)
{
  var vItem = this.getListItemTarget(e.getTarget());

  if (vItem) {
    this._manager.handleDblClick(vItem, e);
  };
};




/*
  -------------------------------------------------------------------------------
    KEY EVENT HANDLER
  -------------------------------------------------------------------------------
*/

proto._onkeydown = function(e)
{
  var kc = e.getKeyCode();

  // Execute action on press <ENTER>
  if (kc == QxKeyEvent.keys.enter && !e.getAltKey())
  {
    var items = this.getSelectedItems();
    var currentItem;

    for (var i=0; i<items.length; i++) 
    {
      currentItem = items[i];
      
      if (currentItem.hasEventListeners("action")) {
        currentItem._dispachEvent(new QxEvent("action"));
      };
    };
  }
  else
  {
    // Give control to selectionManager
    this._manager.handleKeyDown(e);
  };
};

this._lastKeyPress = 0;

proto._onkeypress = function(e)
{
  if (!this.getEnableInlineFind()) {
    return;
  };

  // Reset string after a second of non pressed key
  if (((new Date).valueOf() - this._lastKeyPress) > 1000) {
    this._pressedString = "";
  };

  // Combine keys the user pressed to a string
  this._pressedString += String.fromCharCode(e.getKeyCode());
  
  // Find matching item
  var matchedItem = this.findString(this._pressedString, null);
  
  if (matchedItem)
  {
    var oldVal = this._manager._getChangeValue();
    
    // Temporary disable change event
    var oldFireChange = this._manager.getFireChange();
    this._manager.setFireChange(false);
    
    // Reset current selection
    this._manager._deselectAll();

    // Update manager 
    this._manager.setItemSelected(matchedItem, true);
    this._manager.setAnchorItem(matchedItem);
    this._manager.setLeadItem(matchedItem);

    // Scroll to matched item
    matchedItem.scrollIntoView();

    // Recover event status
    this._manager.setFireChange(oldFireChange);

    // Dispatch event if there were any changes
    if (oldFireChange && this._manager._hasChanged(oldVal)) {
      this._manager._dispatchChange();
    };
  };

  // Store timestamp
  this._lastKeyPress = (new Date).valueOf();
  e.preventDefault();
};




/*
  -------------------------------------------------------------------------------
    FIND SUPPORT
  -------------------------------------------------------------------------------
*/

proto._findItem = function(vUserValue, vStartIndex, vType)
{
  var vAllItems = this.getChildren();

  // If no startIndex given try to get it by current selection
  if (vStartIndex == null)
  {
    vStartIndex = vAllItems.indexOf(this.getSelectedItem());

    if (vStartIndex == -1) {
      vStartIndex = 0;
    };
  };

  var methodName = "matches" + vType;

  // Mode #1: Find all items after the startIndex
  for (var i=vStartIndex; i<vAllItems.length; i++) {
    if (vAllItems[i][methodName](vUserValue)) {
      return vAllItems[i];
    };
  };

  // Mode #2: Find all items before the startIndex
  for (var i=0; i<vStartIndex; i++) {
    if (vAllItems[i][methodName](vUserValue)) {
      return vAllItems[i];
    };
  };

  return null;
};

proto.findString = function(vText, vStartIndex) {
  return this._findItem(vText, vStartIndex || 0, "String");
};

proto.findStringExact = function(vText, vStartIndex) {
  return this._findItem(vText, vStartIndex || 0, "StringExact");
};




/*
  -------------------------------------------------------------------------------
    PREFERRED
  -------------------------------------------------------------------------------
*/

proto.getPreferredHeight = function()
{
  var ch = this.getChildren();
  var chl = ch.length;
  var sum = 0;
  
  for (var i=0; i<chl; i++) {
    sum += ch[i].getPreferredHeight();
  };
  
  return sum;
};
