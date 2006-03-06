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

#package(form)
#require(QxDomLocation)
#require(QxList)
#require(QxPopup)
#require(QxAtom)
#require(QxTextField)
#require(QxImage)

************************************************************************ */

/*!
  A combo-box for qooxdoo.

  The major additional feature compared to typical select fields is that it allows
  it to be editable. Also images are supported inside the popup list.

  Features:
  * Editable text field
  * Complete key-navigation
  * Images inside the list
  * Images and text inside the list
*/
function QxComboBox()
{
  QxHorizontalBoxLayout.call(this);


  // ************************************************************************
  //   LIST
  // ************************************************************************
  var l = this._list = new QxList;

  l.setAppearance("combo-box-list");


  // ************************************************************************
  //   MANAGER
  // ************************************************************************
  var m = this._manager = this._list.getManager();

  m.setMultiSelection(false);
  m.setDragSelection(false);


  // ************************************************************************
  //   POPUP
  // ************************************************************************
  var p = this._popup = new QxPopup;

  p.setAppearance("combo-box-popup");
  p.setAutoHide(false);

  p.add(l);


  // ************************************************************************
  //   TEXTFIELD
  // ************************************************************************
  var f = this._field = new QxTextField;

  f.setAppearance("combo-box-text-field");

  this.add(f);


  // ************************************************************************
  //   BUTTON
  // ************************************************************************

  // Use QxAtom instead of QxButton here to omit the registration
  // of the unneeded and complex button events.
  var b = this._button = new QxAtom(null, "widgets/arrows/down.gif");

  b.setAppearance("combo-box-button");
  b.setTabIndex(-1);

  this.add(b);


  // ************************************************************************
  //   BEHAVIOR
  // ************************************************************************
  this.setTabIndex(1);
  this.setEditable(false);


  // ************************************************************************
  //   WIDGET MOUSE EVENTS
  // ************************************************************************
  this.addEventListener(QxConst.EVENT_TYPE_MOUSEDOWN, this._onmousedown);
  this.addEventListener(QxConst.EVENT_TYPE_MOUSEUP, this._onmouseup);
  this.addEventListener(QxConst.EVENT_TYPE_MOUSEOVER, this._onmouseover);
  this.addEventListener(QxConst.EVENT_TYPE_MOUSEWHEEL, this._onmousewheel);


  // ************************************************************************
  //   WIDGET KEY EVENTS
  // ************************************************************************
  this.addEventListener(QxConst.EVENT_TYPE_KEYDOWN, this._onkeydown);
  this.addEventListener(QxConst.EVENT_TYPE_KEYPRESS, this._onkeypress);


  // ************************************************************************
  //   CHILDREN EVENTS
  // ************************************************************************
  p.addEventListener(QxConst.EVENT_TYPE_APPEAR, this._onpopupappear, this);
  f.addEventListener(QxConst.EVENT_TYPE_INPUT, this._oninput, this);


  // ************************************************************************
  //   REMAPPING
  // ************************************************************************
  this.remapChildrenHandlingTo(l);
};

QxComboBox.extend(QxHorizontalBoxLayout, "QxComboBox");



/*
---------------------------------------------------------------------------
  PROPERTIES
---------------------------------------------------------------------------
*/

QxComboBox.changeProperty({ name : "appearance", type : QxConst.TYPEOF_STRING, defaultValue : "combo-box" });

QxComboBox.addProperty({ name: "editable", type: QxConst.TYPEOF_BOOLEAN, getAlias: "isEditable" });
QxComboBox.addProperty({ name: "selected", type: QxConst.TYPEOF_OBJECT, instance : "QxListItem" });
QxComboBox.addProperty({ name: "value", type : QxConst.TYPEOF_STRING });
QxComboBox.addProperty({ name: "pagingInterval", type: QxConst.TYPEOF_NUMBER, defaultValue: 10 });




/*
---------------------------------------------------------------------------
  UTILITIES
---------------------------------------------------------------------------
*/

proto.getManager = function() {
  return this._manager;
};

proto.getPopup = function() {
  return this._popup;
};

proto.getList = function() {
  return this._list;
};

proto.getField = function() {
  return this._field;
};

proto.getButton = function() {
  return this._button;
};







/*
---------------------------------------------------------------------------
  MODIFIER
---------------------------------------------------------------------------
*/

proto._modifySelected = function(propValue, propOldValue, propData)
{
  this._fromSelected = true;

  // only do this if we called setSelected seperatly
  // and not from the property "value".
  if (!this._fromValue) {
    this.setValue(propValue ? propValue.getLabel() : QxConst.CORE_EMPTY);
  };

  // reset manager cache
  this._manager.setLeadItem(propValue);
  this._manager.setAnchorItem(propValue);

  // sync to manager
  this._manager.setSelectedItem(propValue);

  // reset hint
  delete this._fromSelected;

  return true;
};

proto._modifyValue = function(propValue, propOldValue, propData)
{
  this._fromValue = true;

  // only do this if we called setValue seperatly
  // and not from the event QxConst.EVENT_TYPE_INPUT.
  if (!this._fromInput) {
    this._field.setValue(propValue);
  };

  // only do this if we called setValue seperatly
  // and not from the property "selected".
  if (!this._fromSelected)
  {
    // inform selected property
    var vSelItem = this._list.findStringExact(propValue);

    // ignore disabled items
    if (vSelItem != null && !vSelItem.getEnabled()) {
      vSelItem = null;
    };

    this.setSelected(vSelItem);

    // be sure that the manager get informed
    // if 'selected' was already 'null'
    if (vSelItem == null) {
      this._manager.deselectAll();
    };
  };

  // reset hint
  delete this._fromValue;

  return true;
};

proto._modifyEditable = function(propValue, propOldValue, propData)
{
  var f = this._field;

  f.setReadOnly(!propValue);
  f.setCursor(propValue ? null : QxConst.CORE_DEFAULT);
  f.setSelectable(propValue);

  return true;
};






/*
---------------------------------------------------------------------------
  OTHER EVENT HANDLER
---------------------------------------------------------------------------
*/

proto._onpopupappear = function(e)
{
  var vSelItem = this.getSelected();
  if (vSelItem) {
    vSelItem.scrollIntoView();
  };
};

proto._oninput = function(e)
{
  // Hint for modifier
  this._fromInput = true;

  this.setValue(this._field.getComputedValue());

  // be sure that the found item is in view
  if (this.getPopup().isSeeable() && this.getSelected()) {
    this.getSelected().scrollIntoView();
  };

  delete this._fromInput;
};





/*
---------------------------------------------------------------------------
  MOUSE EVENT HANDLER
---------------------------------------------------------------------------
*/

proto._onmousedown = function(e)
{
  var vTarget = e.getTarget();

  switch(vTarget)
  {
    case this._field:
      if (this.getEditable()) {
        break;
      };

      // no break here

    case this._button:
      this._button.addState(QxConst.STATE_PRESSED);
      this._togglePopup();
      break;

    case this:
    case this._list:
      break;

    default:
      if (vTarget instanceof QxListItem)
      {
        this._list._onmousedown(e);
        this.setSelected(this._list.getSelectedItem());

        this._closePopup();
      }
      else if (this._popup.isSeeable())
      {
        this._popup.hide();
        this.setCapture(false);
      };
  };
};

proto._onmouseup = function(e)
{
  switch(e.getTarget())
  {
    case this._field:
      if (this.getEditable()) {
        break;
      };

      // no break here

    case this._button:
      this._button.removeState(QxConst.STATE_PRESSED);
      break;
  };
};

proto._onmouseover = function(e)
{
  var vTarget = e.getTarget();

  if (vTarget instanceof QxListItem)
  {
    var vManager = this._manager;

    vManager.deselectAll();

    vManager.setLeadItem(vTarget);
    vManager.setAnchorItem(vTarget);

    vManager.setSelectedItem(vTarget);
  };
};

proto._onmousewheel = function(e)
{
  if (!this._popup.isSeeable())
  {
    var toSelect;

    var isSelected = this.getSelected();

    if (e.getWheelDelta() < 0)
    {
      toSelect = isSelected ? this._manager.getNext(isSelected) : this._manager.getFirst();
    }
    else
    {
      toSelect = isSelected ? this._manager.getPrevious(isSelected) : this._manager.getLast();
    };

    if (toSelect)
    {
      this.setSelected(toSelect);
    };
  };
};






/*
---------------------------------------------------------------------------
  KEY EVENT HANDLER
---------------------------------------------------------------------------
*/

proto._onkeydown = function(e)
{
  var vManager = this._manager;
  var vKeyCode = e.getKeyCode();
  var vKeys = QxKeyEvent.keys;
  var vVisible = this._popup.isSeeable();

  switch(vKeyCode)
  {
    // Handle <ENTER>
    case vKeys.enter:
      if (vVisible)
      {
        this.setSelected(this._manager.getSelectedItem());
        this._closePopup();
      }
      else
      {
        this._openPopup();
      };

      return;

    // Handle <ESC>
    case vKeys.esc:
      if (vVisible)
      {
        vManager.setLeadItem(this._oldSelected);
        vManager.setAnchorItem(this._oldSelected);

        vManager.setSelectedItem(this._oldSelected);

        this._field.setValue(this._oldSelected ? this._oldSelected.getLabel() : QxConst.CORE_EMPTY);

        this._closePopup();
      };

      return;

    // Handle <PAGEUP>
    case vKeys.pageup:
      if (!vVisible)
      {
        var vPrevious;
        var vTemp = this.getSelected();

        if (vTemp)
        {
          var vInterval = this.getPagingInterval();

          do {
            vPrevious = vTemp;
          } while(--vInterval && (vTemp = vManager.getPrevious(vPrevious)));
        }
        else
        {
          vPrevious = vManager.getLast();
        };

        this.setSelected(vPrevious);

        return;
      };

      break;

    // Handle <PAGEDOWN>
    case vKeys.pagedown:
      if (!vVisible)
      {
        var vNext;
        var vTemp = this.getSelected();

        if (vTemp)
        {
          var vInterval = this.getPagingInterval();

          do {
            vNext = vTemp;
          } while(--vInterval && (vTemp = vManager.getNext(vNext)));
        }
        else
        {
          vNext = vManager.getFirst();
        };

        this.setSelected(vNext);

        return;
      };

      break;
  };

  // Default Handling
  if (!this.isEditable() || vVisible)
  {
    this._list._onkeydown(e);

    var vSelected = this._manager.getSelectedItem();

    if (!vVisible)
    {
      this.setSelected(vSelected);
    }
    else if (vSelected)
    {
      this._field.setValue(vSelected.getLabel());
    };

    return;
  };

  switch(vKeyCode)
  {
    case vKeys.pageup:
    case vKeys.pagedown:
      if (!this._popup.isCreated()) {
        return;
      };

      // no break here

    case vKeys.up:
    case vKeys.down:
      this._list._onkeydown(e);
      this.setSelected(this._manager.getSelectedItem());
      break;
  };
};

proto._onkeypress = function(e)
{
  if (!this.isEditable()) {
    this._list._onkeypress(e);
  };
};







/*
---------------------------------------------------------------------------
  POPUP HELPER
---------------------------------------------------------------------------
*/

proto._oldSelected = null;

proto._openPopup = function()
{
  var p = this._popup;
  var el = this.getElement();

  if (!p.isCreated()) {
    this.createDispatchEvent("beforeInitialOpen");
  };

  if (this._list.getChildrenLength() == 0) {
    return;
  };

  p.setLeft(QxDom.getComputedPageBoxLeft(el)+1);
  p.setTop(QxDom.getComputedPageBoxTop(el) + QxDom.getComputedBoxHeight(el));
  p.setWidth(this.getBoxWidth()-2);

  p.setParent(this.getTopLevelWidget());
  p.show();

  this._oldSelected = this.getSelected();

  this.setCapture(true);
};

proto._closePopup = function()
{
  this._popup.hide();

  this.setCapture(false);
  this.setFocused(true);
};

proto._togglePopup = function() {
  this._popup.isSeeable() ? this._closePopup() : this._openPopup();
};






/*
---------------------------------------------------------------------------
  DISPOSE
---------------------------------------------------------------------------
*/

proto.dispose = function()
{
  if (this.getDisposed()) {
    return;
  };

  if (this._list)
  {
    this._list.dispose();
    this._list = null;
  };

  if (this._manager)
  {
    this._manager.dispose();
    this._manager = null;
  };

  if (this._popup)
  {
    this._popup.dispose();
    this._popup = null;
  };

  if (this._field)
  {
    this._field.dispose();
    this._field = null;
  };

  if (this._button)
  {
    this._button.dispose();
    this._button = null;
  };

  return QxHorizontalBoxLayout.prototype.dispose.call(this);
};
