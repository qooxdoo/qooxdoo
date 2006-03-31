/* ************************************************************************

   qooxdoo - the new era of web interface development

   Copyright:
     (C) 2004-2006 by Schlund + Partner AG, Germany
         All rights reserved

   License:
     LGPL 2.1: http://creativecommons.org/licenses/LGPL/2.1/

   Internet:
     * http://qooxdoo.oss.schlund.de

   Authors:
     * Sebastian Werner (wpbasti)
       <sebastian dot werner at 1und1 dot de>
     * Andreas Ecker (aecker)
       <andreas dot ecker at 1und1 dot de>

************************************************************************ */

/* ************************************************************************

#package(list)

#post(QxSelectionManager)
#post(QxKeyEvent)

************************************************************************ */

function QxList()
{
  QxVerticalBoxLayout.call(this);


  // ************************************************************************
  //   INITILISIZE MANAGER
  // ************************************************************************
  this._manager = new QxSelectionManager(this);


  // ************************************************************************
  //   BEHAVIOR
  // ************************************************************************
  this.setSelectable(false);
  this.setTabIndex(1);


  // ************************************************************************
  //   MOUSE EVENT LISTENER
  // ************************************************************************
  this.addEventListener(QxConst.EVENT_TYPE_MOUSEOVER, this._onmouseover);
  this.addEventListener(QxConst.EVENT_TYPE_MOUSEDOWN, this._onmousedown);
  this.addEventListener(QxConst.EVENT_TYPE_MOUSEUP, this._onmouseup);
  this.addEventListener(QxConst.EVENT_TYPE_CLICK, this._onclick);
  this.addEventListener(QxConst.EVENT_TYPE_DBLCLICK, this._ondblclick);


  // ************************************************************************
  //   KEY EVENT LISTENER
  // ************************************************************************
  this.addEventListener(QxConst.EVENT_TYPE_KEYDOWN, this._onkeydown);
  this.addEventListener(QxConst.EVENT_TYPE_KEYPRESS, this._onkeypress);
};

QxList.extend(QxVerticalBoxLayout, "QxList");

QxList.changeProperty({ name : "appearance", type : QxConst.TYPEOF_STRING, defaultValue : "list" });

QxList.addProperty({ name : "enableInlineFind", type : QxConst.TYPEOF_BOOLEAN, defaultValue : true });
QxList.addProperty({ name : "markLeadingItem", type : QxConst.TYPEOF_BOOLEAN, defaultValue : false });

proto._pressedString = QxConst.CORE_EMPTY;





/*
---------------------------------------------------------------------------
  MANAGER BINDING
---------------------------------------------------------------------------
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
---------------------------------------------------------------------------
  MOUSE EVENT HANDLER
---------------------------------------------------------------------------
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
---------------------------------------------------------------------------
  KEY EVENT HANDLER
---------------------------------------------------------------------------
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
    this._pressedString = QxConst.CORE_EMPTY;
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
---------------------------------------------------------------------------
  FIND SUPPORT
---------------------------------------------------------------------------
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

proto.findValue = function(vText, vStartIndex) {
  return this._findItem(vText, vStartIndex || 0, "Value");
};

proto.findValueExact = function(vText, vStartIndex) {
  return this._findItem(vText, vStartIndex || 0, "ValueExact");
};






/*
---------------------------------------------------------------------------
  SORT SUPPORT
---------------------------------------------------------------------------
*/

proto._sortItemsCompare = function(a, b) {
  return a.key < b.key ? -1 : a.key == b.key ? 0 : 1;
};

proto.sortItemsByString = function(vReverse)
{
  var sortitems = [];
  var items = this.getChildren();

  for(var i=0, l=items.length; i<l; i++) {
    sortitems[i] = { key : items[i].getLabel(), item : items[i] };
  };

  sortitems.sort(this._sortItemsCompare);
  if (vReverse) {
    sortitems.reverse();
  };

  for(var i=0; i<l; i++) {
    this.addAt(sortitems[i].item, i);
  };
};

proto.sortItemsByValue = function(vReverse)
{
  var sortitems = [];
  var items = this.getChildren();

  for(var i=0, l=items.length; i<l; i++) {
    sortitems[i] = { key : items[i].getValue(), item : items[i] };
  };

  sortitems.sort(this._sortItemsCompare);
  if (vReverse) {
    sortitems.reverse();
  };

  for(var i=0; i<l; i++) {
    this.addAt(sortitems[i].item, i);
  };
};









/*
---------------------------------------------------------------------------
  DISPOSER
---------------------------------------------------------------------------
*/

proto.dispose = function()
{
  if (this.getDisposed()) {
    return;
  };

  if (this._manager)
  {
    this._manager.dispose();
    this._manager = null;
  };

  this.removeEventListener(QxConst.EVENT_TYPE_MOUSEOVER, this._onmouseover);
  this.removeEventListener(QxConst.EVENT_TYPE_MOUSEDOWN, this._onmousedown);
  this.removeEventListener(QxConst.EVENT_TYPE_MOUSEUP, this._onmouseup);
  this.removeEventListener(QxConst.EVENT_TYPE_CLICK, this._onclick);
  this.removeEventListener(QxConst.EVENT_TYPE_DBLCLICK, this._ondblclick);
  this.removeEventListener(QxConst.EVENT_TYPE_KEYDOWN, this._onkeydown);
  this.removeEventListener(QxConst.EVENT_TYPE_KEYPRESS, this._onkeypress);

  return QxVerticalBoxLayout.prototype.dispose.call(this);
};
