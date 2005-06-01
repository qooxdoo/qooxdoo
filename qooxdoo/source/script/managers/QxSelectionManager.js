function QxSelectionManager(vBoundedWidget)
{
  QxTarget.call(this);

  this._selectedItems = new QxSelectionStorage();

  if (isValid(vBoundedWidget)) {
    this.setBoundedWidget(vBoundedWidget);
  };
};

QxSelectionManager.extend(QxManager, "QxSelectionManager");

/*
  -------------------------------------------------------------------------------
    PROPERTIES
  -------------------------------------------------------------------------------
*/

/*!
This contains the currently assigned widget (QxList, ...)
*/
QxSelectionManager.addProperty({ name : "boundedWidget", type : Object });

/*!
Should multiple selection be allowed?
*/
QxSelectionManager.addProperty({ name : "multiSelection", type : Boolean, defaultValue : true });

/*!
Enable drag selection?
*/
QxSelectionManager.addProperty({ name : "dragSelection", type : Boolean, defaultValue : true });

/*!
Should the user be able to select
*/
QxSelectionManager.addProperty({ name : "canDeselect", type : Boolean, defaultValue : true });

/*!
Should a change event be fired?
*/
QxSelectionManager.addProperty({ name : "fireChange", type : Boolean, defaultValue : true });

/*!
The current anchor in range selections.
*/
QxSelectionManager.addProperty({ name : "anchorItem", type : Object });

/*!
The last selected item
*/
QxSelectionManager.addProperty({ name : "leadItem", type : Object });




/*
  -------------------------------------------------------------------------------
    MODIFIER
  -------------------------------------------------------------------------------
*/

proto._modifyAnchorItem = function(propValue, propOldValue, propName, uniqModIds)
{
  if (propOldValue) {
    this.renderItemAnchorState(propOldValue, false);
  };
  
  if (propValue) {
    this.renderItemAnchorState(propValue, true);
  };
  
  return true;
};

proto._modifyLeadItem = function(propValue, propOldValue, propName, uniqModIds)
{
  if (propOldValue) {
    this.renderItemLeadState(propOldValue, false);
  };
  
  if (propValue) {
    this.renderItemLeadState(propValue, true);
  };
  
  return true;
};



/*
  -------------------------------------------------------------------------------
    MAPPING TO BOUNDED WIDGET
  -------------------------------------------------------------------------------
*/

proto.getFirst = function() 
{
  var vItem = this.getBoundedWidget().getFirstChild();
  return vItem.isEnabled() ? vItem : this.getNext(vItem);
};

proto.getLast = function() 
{
  var vItem = this.getBoundedWidget().getLastChild();
  return vItem.isEnabled() ? vItem : this.getPrevious(vItem);
};

proto.getItems = function() {
  return this.getBoundedWidget().getChildren();
};

proto.getNext = function(vItem)
{
  while(vItem)
  {
    vItem = vItem.getNextSibling();
    
    if (!vItem) {
      break;
    };
    
    if (vItem.isEnabled()) {
      return vItem;
    };    
  };

  return null;
};

proto.getPrevious = function(vItem)
{
  while(vItem)
  {
    vItem = vItem.getPreviousSibling();
    
    if (!vItem) {
      break;
    };
    
    if (vItem.isEnabled()) {
      return vItem;
    };    
  };  

  return null;
};

proto.isBefore = function(vItem1, vItem2)
{
  var cs = this.getItems();
  return cs.indexOf(vItem1) < cs.indexOf(vItem2);
};

proto.isEqual = function(vItem1, vItem2) {
  return vItem1 == vItem2;
};



/*
  -------------------------------------------------------------------------------
    MAPPING TO ITEM PROPERTIES
  -------------------------------------------------------------------------------
*/

proto.getItemHashCode = function(vItem) {
  return vItem.toHash();
};





/*
  -------------------------------------------------------------------------------
    MAPPING TO ITEM DIMENSIONS
  -------------------------------------------------------------------------------
*/

proto.scrollItemIntoView = function(vItem) {
  vItem.scrollIntoView();
};

proto.getItemLeft = function(vItem) {
  return vItem.getOffsetLeft();
};

proto.getItemTop = function(vItem) {
  return vItem.getOffsetTop();
};

proto.getItemWidth = function(vItem) {
  return vItem.getOffsetWidth();
};

proto.getItemHeight = function(vItem) {
  return vItem.getOffsetHeight();
};

proto.getItemEnabled = function(vItem) {
  return vItem.getEnabled();
};


/*
  -------------------------------------------------------------------------------
    ITEM CSS STATE MANAGMENT
  -------------------------------------------------------------------------------
*/

proto._updateState = function(vItem, vState, vIsState)
{
  var c = vItem.getCssClassName();
  var n = vItem.classname + "-" + vState;

  vItem.setCssClassName(vIsState ? c.add(n, " ") : c.remove(n, " "));  
};

proto.renderItemSelectionState = function(vItem, vIsSelected) {
  this._updateState(vItem, "Selected", vIsSelected);
};

proto.renderItemAnchorState = function(vItem, vIsAnchor) {
  this._updateState(vItem, "Anchor", vIsAnchor);
};

proto.renderItemLeadState = function(vItem, vIsLead) {
  this._updateState(vItem, "Lead", vIsLead);
};




/*
  -------------------------------------------------------------------------------
    SELECTION HANDLING
  -------------------------------------------------------------------------------
*/

proto.getItemSelected = function(vItem) {
  return this._selectedItems.contains(vItem);
};

/*!
Make a single item selected / not selected

#param vItem[QxWidget]: Item which should be selected / not selected
#param vSelected[Boolean]: Should this item be selected?
*/
proto.setItemSelected = function(vItem, vSelected)
{
  var hc = this.getItemHashCode(vItem);

  switch(this.getMultiSelection())
  {
    // Multiple item selection is allowed
    case true:
      if (!this.getItemEnabled(vItem)) {
        return;
      };
    
      // If selection state is not to be changed => return
      if (this.getItemSelected(vItem) == vSelected) {
        return;
      };

      // Otherwise render new state
      this.renderItemSelectionState(vItem, vSelected);

      // Add item to selection hash / delete it from there     
      vSelected ? this._selectedItems.add(vItem) : this._selectedItems.remove(vItem);

      // Dispatch change Event
      this._dispatchChange();    
      
      break;



    // Multiple item selection is NOT allowed
    case false:
      var item0 = this.getSelectedItems()[0];
  
      
  
      if (vSelected)
      {

        // Precheck for any changes
        var old = item0;
  
        if (this.isEqual(vItem, old)) {
          return;
        };
  
        // Reset rendering of previous selected item
        if (old != null) {
          this.renderItemSelectionState(old, false);
        };
  
        // Render new item as selected
        this.renderItemSelectionState(vItem, true);
        
        // Reset current selection hash
        this._selectedItems.removeAll();
        
        // Add new one
        this._selectedItems.add(vItem);
        
        // Dispatch change Event
        this._dispatchChange();
      }
      else
      {

        // Pre-check if item is currently selected
        // Do not allow deselection in single selection mode
        if (!this.isEqual(item0, vItem))
        {
          // Reset rendering as selected item
          this.renderItemSelectionState(vItem, false);
          
          // Reset current selection hash
          this._selectedItems.removeAll();
          
          // Dispatch change Event
          this._dispatchChange();
        };
      };
      
      break;
   
  };
};








/*!
  Get the selected items (objects)
*/
proto.getSelectedItems = function() {
  return this._selectedItems.toArray();
};

proto.getSelectedItem = function() {
  return this._selectedItems.getFirst();
};

/*!
Select given items
  
#param vItems[Array of QxWidgets]: Items to select
*/
proto.setSelectedItems = function(vItems)
{
  var oldVal = this._getChangeValue();
  
  // Temporary disabling of event fire
  var oldFireChange = this.getFireChange();  
  this.setFireChange(false);
  
  // Deselect all currently selected items
  this._deselectAll();
  
  // Apply new selection
  var vItem;
  var vItemLength = vItems.length;

  for (var i=0; i<vItemLength; i++)
  {
    vItem = vItems[i];
    
    if (!this.getItemEnabled(vItem)) {
      continue;
    };    
    
    // Add item to selection
    this._selectedItems.add(vItem);
    
    // Render new state for item
    this.renderItemSelectionState(vItem, true);
  };

  // Recover change event status
  this.setFireChange(oldFireChange);

  // Dispatch change Event
  if (oldFireChange && this._hasChanged(oldVal)) {
    this._dispatchChange();
  };
};


proto.setSelectedItem = function(vItem)
{
  if (!vItem) {
    return;
  };
  
  if (!vItem.getEnabled()) {
    return;
  };
  
  var oldVal = this._getChangeValue();
  
  // Temporary disabling of event fire
  var oldFireChange = this.getFireChange();  
  this.setFireChange(false);  
  
  // Deselect all currently selected items
  this._deselectAll();
  
  // Add item to selection
  this._selectedItems.add(vItem);
    
  // Render new state for item
  this.renderItemSelectionState(vItem, true);  
    
  // Recover change event status
  this.setFireChange(oldFireChange);

  // Dispatch change Event
  if (oldFireChange && this._hasChanged(oldVal)) {
    this._dispatchChange();
  };  
};





/*!
  Select all items.
*/
proto.selectAll = function()
{
  var oldVal = this._getChangeValue();
  
  // Temporary disabling of event fire
  var oldFireChange = this.getFireChange();
  this.setFireChange(false);
  
  // Call sub method to select all items
  this._selectAll();
  
  // Recover change event status
  this.setFireChange(oldFireChange);

  // Dispatch change Event
  if (oldFireChange && this._hasChanged(oldVal)) {
    this._dispatchChange();
  };
};

/*!
  Sub method for selectAll. Handles the real work
  to select all items.
*/
proto._selectAll = function()
{
  if (!this.getMultiSelection()) {
    return;
  };

  var vItem;
  var vItems = this.getItems();
  var vItemsLength = vItems.length;
  
  // Reset current selection hash
  this._selectedItems.removeAll();

  for (var i=0; i<vItemsLength; i++)
  {
    vItem = vItems[i];
    
    if (!this.getItemEnabled(vItem)) {
      continue;
    };    
    
    // Add item to selection
    this._selectedItems.add(vItem);

    // Render new state for item
    this.renderItemSelectionState(vItem, true);
  };
  
  return true;
};





/*!
  Deselect all items.
*/
proto.deselectAll = function()
{
  var oldVal = this._getChangeValue();
  
  // Temporary disabling of event fire
  var oldFireChange = this.getFireChange();
  this.setFireChange(false);
  
  // Call sub method to deselect all items
  this._deselectAll();
  
  // Recover change event status
  this.setFireChange(oldFireChange);

  // Dispatch change Event
  if (oldFireChange && this._hasChanged(oldVal))
    this._dispatchChange();
  };

/*!
  Sub method for deselectAll. Handles the real work
  to deselect all items.
*/
proto._deselectAll = function()
{
  // Render new state for items
  var items = this._selectedItems.toArray();
  for (var i = 0; i < items.length; i++) {
    this.renderItemSelectionState(items[i], false);
  };
  
  // Delete all entries in selectedItems hash
  this._selectedItems.removeAll();
  
  return true;
};




/*!
Select a range of items.
  
#param vItem1[QxWidget]: Start item
#param vItem2[QxWidget]: Stop item
*/
proto.selectItemRange = function(vItem1, vItem2)
{
  var oldVal = this._getChangeValue();
  
  // Temporary disabling of event fire
  var oldFireChange = this.getFireChange();
  this.setFireChange(false);
  
  // Call sub method to select the range of items
  this._selectItemRange(vItem1, vItem2, true);
  
  // Recover change event status
  this.setFireChange(oldFireChange);

  // Dispatch change Event
  if (oldFireChange && this._hasChanged(oldVal)) {
    this._dispatchChange();
  };
};




/*!
Sub method for selectItemRange. Handles the real work
to select a range of items.
  
#param vItem1[QxWidget]: Start item
#param vItem2[QxWidget]: Stop item  
#param vDelect[Boolean]: Deselect currently selected items first?
*/
proto._selectItemRange = function(vItem1, vItem2, vDeselect)
{
  // this.debug("SELECT_RANGE: " + vItem1.toText() + "<->" + vItem2.toText());  
  
  // Pre-Check a revert call if vItem2 is before vItem1
  if (this.isBefore(vItem2, vItem1)) {
    return this._selectItemRange(vItem2, vItem1, vDeselect);
  };

  // Deselect all
  if (vDeselect) {
    this._deselectAll();
  };
  
  var vCurrentItem = vItem1;

  while (vCurrentItem != null)
  {
    if (this.getItemEnabled(vCurrentItem)) 
    {
      // Add item to selection
      this._selectedItems.add(vCurrentItem);
      
      // Render new state for item
      this.renderItemSelectionState(vCurrentItem, true);
    };  

    // Stop here if we reached target item
    if (this.isEqual(vCurrentItem, vItem2)) {
      break;
    };
    
    // Get next item
    vCurrentItem = this.getNext(vCurrentItem);
  };
  
  return true;
};

/*!
Internal method for deselection of ranges. 
  
#param vItem1[QxWidget]: Start item
#param vItem2[QxWidget]: Stop item  
*/
proto._deselectItemRange = function(vItem1, vItem2)
{
  // Pre-Check a revert call if vItem2 is before vItem1
  if (this.isBefore(vItem2, vItem1)) {
    return this._deselectItemRange(vItem2, vItem1);
  };

  var vCurrentItem = vItem1;

  while (vCurrentItem != null)
  {
    // Add item to selection
    this._selectedItems.remove(vCurrentItem);
    
    // Render new state for item
    this.renderItemSelectionState(vCurrentItem, false);

    // Stop here if we reached target item
    if (this.isEqual(vCurrentItem, vItem2)) {
      break;
    };

    // Get next item
    vCurrentItem = this.getNext(vCurrentItem);
  };
};


/*
  -------------------------------------------------------------------------------
    MOUSE EVENT HANDLING
  -------------------------------------------------------------------------------
*/

proto._activeDragSession = false;

proto.handleMouseDown = function(vItem, e)
{
  // Only allow left and right button
  if (e.isNotLeftButton() && e.isNotRightButton()) {
    return;
  };

  // Keep selection on right click on already selected item
  if (e.isRightButton() && this.getItemSelected(vItem)) {
    return;
  };

  // Shift Key
  //   or
  // Click on an unseleted item (without Strg)
  if (e.getShiftKey() || this.getDragSelection() || (!this.getItemSelected(vItem) && !e.getCtrlKey()))
  {
    // Handle event
    this._onmouseevent(vItem, e);
  }
  else
  {
    // Update lead item
    this.setLeadItem(vItem);
  };
  
  
  // Handle dragging
  this._activeDragSession = this.getDragSelection();

  if (this._activeDragSession)
  {
    // Add mouseup listener and register as capture widget
    this.getBoundedWidget().addEventListener("mouseup", this._ondragup, this);
    this.getBoundedWidget().setCapture(true);
  };  
};

proto._ondragup = function(e)
{
  this.getBoundedWidget().removeEventListener("mouseup", this._ondragup, this);
  this.getBoundedWidget().setCapture(false);
  this._activeDragSession = false;
};

proto.handleMouseUp = function(vItem, e)
{
  if (e.isNotLeftButton()) {
    return;
  };

  if (e.getCtrlKey() || this.getItemSelected(vItem) && !this._activeDragSession) {
    this._onmouseevent(vItem, e);
  };
  
  if (this._activeDragSession)
  {
    this._activeDragSession = false;
    this.getBoundedWidget().setCapture(false);
  };  
};

proto.handleMouseOver = function(oItem, e)
{
  if (! this.getDragSelection() || !this._activeDragSession) {
    return;
  };

  this._onmouseevent(oItem, e, true);
};

// currently unused placeholder
proto.handleClick = function(vItem, e) {};

// currently unused placeholder
proto.handleDblClick = function(vItem, e) {};


/*!
Internal handler for all mouse events bound to this manager.
*/
proto._onmouseevent = function(oItem, e, bOver)
{
  if (!oItem.getEnabled()) {
    return;
  };  
  
  // ********************************************************************
  //   Init
  // ********************************************************************

  // Cache current (old) values
  var oldVal = this._getChangeValue();
  var oldLead = this.getLeadItem();

  // Temporary disabling of event fire
  var oldFireChange = this.getFireChange();
  this.setFireChange(false);

  // Cache selection and count
  var selectedItems = this.getSelectedItems();
  var selectedCount = selectedItems.length;

  // Update lead item
  this.setLeadItem(oItem);

  // Cache current anchor item
  var currentAnchorItem = this.getAnchorItem();

  // Cache keys pressed
  var vCtrlKey = e.getCtrlKey();
  var vShiftKey = e.getShiftKey();


  // ********************************************************************
  //   Do we need to update the anchor?
  // ********************************************************************
  
  if (!currentAnchorItem || selectedCount == 0 || (vCtrlKey && !vShiftKey && this.getMultiSelection() && !this.getDragSelection()))
  {
    this.setAnchorItem(oItem);
    currentAnchorItem = oItem;
  };



  // ********************************************************************
  //   Mode #1: Replace current selection with new one
  // ********************************************************************
  if ((!vCtrlKey && !vShiftKey && !this._activeDragSession || !this.getMultiSelection()))
  {
    if (!oItem.getEnabled()) {
      return;
    };
    
    // Remove current selection
    this._deselectAll();
    
    // Update anchor item
    this.setAnchorItem(oItem);
    
    if (this._activeDragSession) 
    {
      // a little bit hacky, but seems to be a fast way to detect if we slide to top or to bottom
      this.scrollItemIntoView((this.getBoundedWidget().getScrollTop() > (this.getItemTop(oItem)-1) ? this.getPrevious(oItem) : this.getNext(oItem)) || oItem);
    };

    if (!this.getItemSelected(oItem)) {
      this.renderItemSelectionState(oItem, true);
    };

    // Clear up and add new one
    //this._selectedItems.removeAll();
    this._selectedItems.add(oItem);
    
    this._addToCurrentSelection = true;
  }

  
  // ********************************************************************
  //   Mode #2: (De-)Select item range in mouse drag session
  // ********************************************************************
  else if (this._activeDragSession && bOver)
  {
    if (oldLead) {
      this._deselectItemRange(currentAnchorItem, oldLead);
    };
    
    // Drag down
    if (this.isBefore(currentAnchorItem, oItem))
    {
      if (this._addToCurrentSelection)
      {
        this._selectItemRange(currentAnchorItem, oItem, false);
      }
      else
      {
        this._deselectItemRange(currentAnchorItem, oItem);
      };      
    }
    
    // Drag up
    else
    {
      if (this._addToCurrentSelection)
      {
        this._selectItemRange(oItem, currentAnchorItem, false);
      }
      else
      {
        this._deselectItemRange(oItem, currentAnchorItem);
      };      
    };
    
    // a little bit hacky, but seems to be a fast way to detect if we slide to top or to bottom
    this.scrollItemIntoView((this.getBoundedWidget().getScrollTop() > (this.getItemTop(oItem)-1) ? this.getPrevious(oItem) : this.getNext(oItem)) || oItem);
  }
  
  
  // ********************************************************************
  //   Mode #3: Add new item to current selection (ctrl pressed)
  // ********************************************************************
  else if (this.getMultiSelection() && vCtrlKey && !vShiftKey)
  {
    if (!this._activeDragSession) {
      this._addToCurrentSelection = !(this.getCanDeselect() && this.getItemSelected(oItem));
    };
    
    this.setItemSelected(oItem, this._addToCurrentSelection);
    this.setAnchorItem(oItem);
  }


  // ********************************************************************
  //   Mode #4: Add new (or continued) range to selection
  // ********************************************************************
  else if (this.getMultiSelection() && vCtrlKey && vShiftKey)
  {
    if (!this._activeDragSession) {
      this._addToCurrentSelection = !(this.getCanDeselect() && this.getItemSelected(oItem));
    };

    if (this._addToCurrentSelection) 
    {
      this._selectItemRange(currentAnchorItem, oItem, false);
    }
    else
    { 
      this._deselectItemRange(currentAnchorItem, oItem);
    };
  }

  // ********************************************************************
  //   Mode #5: Replace selection with new range selection
  // ********************************************************************
  else if (this.getMultiSelection() && !vCtrlKey && vShiftKey)
  {
    if (this.getCanDeselect())
    {
      this._selectItemRange(currentAnchorItem, oItem, true);
    }

    else
    {
      if (oldLead) {
        this._deselectItemRange(currentAnchorItem, oldLead);
      };

      this._selectItemRange(currentAnchorItem, oItem, false);
    };
  };



  // Recover change event status
  this.setFireChange(oldFireChange);

  // Dispatch change Event  
  if(oldFireChange && this._hasChanged(oldVal)) {
    this._dispatchChange();
  };
};




/*
  -------------------------------------------------------------------------------
    KEY EVENT HANDLER
  -------------------------------------------------------------------------------
*/

proto.handleKeyDown = function(e)
{
  var oldVal = this._getChangeValue();
  
  // Temporary disabling of event fire
  var oldFireChange = this.getFireChange();
  this.setFireChange(false);

  // this.debug("KeyCode: " + e.getKeyCode());

  // Ctrl+A: Select all
  if (e.getKeyCode() == 65 && e.getCtrlKey())
  {
    if (this.getMultiSelection())
    {
      this._selectAll();
      
      // Update lead item to this new last 
      // (or better here: first) selected item
      this.setLeadItem(this.getFirst());
    };
  }

  // Default operation
  else
  {
    var aIndex = this.getAnchorItem();
    var itemToSelect = this.getItemToSelect(e);
    
    // this.debug("Anchor: " + (aIndex ? aIndex.getText() : "null"));
    // this.debug("ToSelect: " + (itemToSelect ? itemToSelect.getText() : "null"));

    if (itemToSelect && this.getItemEnabled(itemToSelect))
    {
      // Update lead item to this new last selected item
      this.setLeadItem(itemToSelect);
      
      // Scroll new item into view
      this.scrollItemIntoView(itemToSelect);
      
      // Stop event handling
      e.preventDefault();

      // Select a range
      if (e.getShiftKey() && this.getMultiSelection())
      {
        // Make it a little bit more failsafe:
        // Set anchor if not given already. Allows us to select 
        // a range without any previous selection.
        if (aIndex == null) {
          this.setAnchorItem(itemToSelect);
        };

        // Select new range (and clear up current selection first)
        this._selectItemRange(this.getAnchorItem(), itemToSelect, true);
      }
      else if (!e.getCtrlKey())
      {
        // Clear current selection
        this._deselectAll();
        
        // Update new item to be selected
        this.renderItemSelectionState(itemToSelect, true);

        // Add item to new selection        
        this._selectedItems.add(itemToSelect);

        // Update anchor to this new item 
        // (allows following shift range selection)
        this.setAnchorItem(itemToSelect);
      };
    };
  };

  // Recover change event status
  this.setFireChange(oldFireChange);

  // Dispatch change Event  
  if (oldFireChange && this._hasChanged(oldVal)) {
    this._dispatchChange();
  };
};

proto.getItemToSelect = function(oKeyboardEvent)
{
  var e = oKeyboardEvent;

  // Don't handle ALT here
  if (e.getAltKey()) {
    return null;
  };

  // Handle event by keycode
  switch (e.getKeyCode())
  {
    case QxKeyEvent.keys.home:
      return this.getHome(this.getLeadItem());

    case QxKeyEvent.keys.end:
      return this.getEnd(this.getLeadItem());


    case QxKeyEvent.keys.down: 
      return this.getDown(this.getLeadItem());

    case QxKeyEvent.keys.up: 
      return this.getUp(this.getLeadItem());


    case QxKeyEvent.keys.pageup: 
      return this.getPageUp(this.getLeadItem());

    case QxKeyEvent.keys.pagedown: 
      return this.getPageDown(this.getLeadItem());
  };

  return null;
};




/*
  -------------------------------------------------------------------------------
    CHANGE HANDLING
  -------------------------------------------------------------------------------
*/

proto._dispatchChange = function()
{
  if (!this.getFireChange()) {
    return;
  };
  
  this.dispatchEvent(new QxDataEvent("changeSelection", this.getSelectedItems()));
};

proto._hasChanged = function(sOldValue) {
  return sOldValue != this._getChangeValue();
};

proto._getChangeValue = function() {
  return this._selectedItems.getChangeValue();
};






/*
  -------------------------------------------------------------------------------
    POSITION HANDLING
  -------------------------------------------------------------------------------
*/

proto.getHome = function() {
  return this.getFirst();
};

proto.getEnd = function() {
  return this.getLast();
};

proto.getDown = function(vItem) {
  return !vItem ? this.getFirst() : this.getNext(vItem);
};

proto.getUp = function(vItem) {
  return !vItem ? this.getLast() : this.getPrevious(vItem);
};






/*
  -------------------------------------------------------------------------------
    PAGE HANDLING
  -------------------------------------------------------------------------------
*/

/*!
Jump a "page" up.

#param vItem[QxWidget]: Relative to this widget
*/
proto.getPageUp = function(vItem)
{
  var vBound = this.getBoundedWidget();
  var vParentScrollTop = vBound.getScrollTop();
  
  // Find next item
  var newItem;
  var nextItem = this.getLeadItem();
  if (!nextItem) {
    nextItem = this.getFirst();
  };

  // Normally we should reach the status "lead" for the
  // nextItem after two iterations.
  var tryLoops = 0;
  while (tryLoops < 2)
  {
    while (nextItem && (this.getItemTop(nextItem) - this.getItemHeight(nextItem) >= vParentScrollTop)) 
    {
      newItem = this.getUp(nextItem);
      
      if (newItem == null) {
        break;
      };
      
      nextItem = newItem;
    };

    // This should never occour after the fix above
    if (nextItem == null) 
    {
      // this.debug("No item found, stop here");
      tryLoops = 2;
      break;
    };

    // If the nextItem is not anymore the leadItem
    // Means: There has occured a change.
    // We break here. This is normally the second step.
    if (nextItem != this.getLeadItem()) {
      break;
    };

    // Update scrolling (this is normally the first step)
    vBound.setScrollTop(vParentScrollTop - vBound.getClientHeight() - this.getItemHeight(nextItem));
    
    // Use the real applied value instead of the calulated above
    vParentScrollTop = vBound.getScrollTop();
    
    // Increment counter
    tryLoops++;
  };

  // this.debug("NextItem: " + (nextItem ? nextItem.getText() : "null"));
  return nextItem;
};

/*!
Jump a "page" down.

#param vItem[QxWidget]: Relative to this widget
*/
proto.getPageDown = function(vItem)
{
  var vBound = this.getBoundedWidget();
  var vParentScrollTop = vBound.getScrollTop();
  var vParentClientHeight = vBound.getClientHeight();
  
  // Find next item
  var newItem;
  var nextItem = this.getLeadItem();
  if (!nextItem) {
    nextItem = this.getFirst();
  };

  // Normally we should reach the status "lead" for the
  // nextItem after two iterations.
  var tryLoops = 0;
  while (tryLoops < 2)
  {
    // Find next
    while (nextItem && ((this.getItemTop(nextItem) + (2 * this.getItemHeight(nextItem))) <= (vParentScrollTop + vParentClientHeight))) 
    {
      newItem = this.getDown(nextItem);
      
      if (newItem == null) {
        break;
      };
      
      nextItem = newItem;
    };

    // This should never occour after the fix above
    if (nextItem == null) 
    {
      // this.debug("No item found, stop here");
      tryLoops = 2;
      break;
    };

    // If the nextItem is not anymore the leadItem
    // Means: There has occured a change.
    // We break here. This is normally the second step.
    if (nextItem != this.getLeadItem()) {
      break;
    };

    // Update scrolling (this is normally the first step)
    vBound.setScrollTop(vParentScrollTop + vParentClientHeight - (2 * this.getItemHeight(nextItem)));
    
    // Use the real applied value instead of the calulated above
    vParentScrollTop = vBound.getScrollTop();
    
    // Increment counter
    tryLoops++;
  };
  
  // this.debug("NextItem: " + (nextItem ? nextItem.getText() : "null"));
  return nextItem;
};










/*
  -------------------------------------------------------------------------------
    DISPOSE
  -------------------------------------------------------------------------------
*/

proto.dispose = function()
{
  if (this.getDisposed()) {
    return;
  };

  if (this._selectedItems) {
    this._selectedItems.dispose();
    this._selectedItems = null;
  };
  
  return QxTarget.prototype.dispose.call(this);
};