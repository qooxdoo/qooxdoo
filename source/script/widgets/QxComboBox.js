function QxComboBox()
{
  QxWidget.call(this);
  
  this.setWidth(120);
  this.setHeight(22);
  this.setBorder(QxBorder.presets.inset);
  this.setTabIndex(1);
 
  
  // ***********************************************************************
  //   LIST  
  // ***********************************************************************
  this._list = new QxList();
  this._list.set({ top: 0, left: 0, bottom: 0, right: 0, overflow: "auto", timerCreate: false });
  

  // ***********************************************************************
  //   MANAGER
  // ***********************************************************************
  this._manager = this._list.getManager();
  this._manager.set({ multiSelection : false, dragSelection: false });
  this._manager.addEventListener("changeSelection", this._onchangeselection, this);
 
 
  // ***********************************************************************
  //   POPUP
  // ***********************************************************************
  this._popup = new QxPopup();  
  this._popup.set({ autoHide: false, width: 150, height: 180, timerCreate: false });
  this._popup.add(this._list);
  

  // ***********************************************************************
  //   ATOM AND TEXTFIELD
  // ***********************************************************************
  this._atom = new QxAtom();
  this._atom.set({ width: null, top: 3, left: 4, right: 16, tabIndex : -1 });
  
  this._textfield = new QxTextField();
  this._textfield.setTop((new QxClient).isGecko() ? 1 : 0);
  this._textfield.set({ left: 4, right: 16, tabIndex : -1 });
  
  (this.isEditable() ? this._atom : this._textfield).setStyleProperty("visibility", "hidden");


  // ***********************************************************************
  //   BUTTON
  // ***********************************************************************
  this._button = new QxWidget();
  this._button.set({ top: 0, bottom: 0, width: 16, right: 0, border: QxBorder.presets.outset, canSelect : false });
  
  this._buttonimage = new QxImage("widgets/arrows/down.gif", 7, 4);
  this._buttonimage.set({ top: 5, left: 2 });
  
  this._button.add(this._buttonimage);
  

  // ***********************************************************************
  //   COMBINE
  // ***********************************************************************  
  this.add(this._textfield, this._atom, this._button);
  

  // ***********************************************************************
  //   EVENTS
  // ***********************************************************************    
  this.addEventListener("mousedown", this._onmousedown);
  this.addEventListener("mouseup", this._onmouseup);
  this.addEventListener("mouseover", this._onmouseover);
  this.addEventListener("keydown", this._onkeydown);
  this.addEventListener("keypress", this._onkeypress);
  this.addEventListener("mousewheel", this._onmousewheel);
};

QxComboBox.extend(QxWidget, "QxComboBox");


/*
  -------------------------------------------------------------------------------
    PROPERTIES
  -------------------------------------------------------------------------------
*/

QxComboBox.addProperty({ name: "editable", type: Boolean, defaultValue: false, getAlias: "isEditable" });
QxComboBox.addProperty({ name: "selected", type: Object });
QxComboBox.addProperty({ name: "value", type: Object });
QxComboBox.addProperty({ name: "pagingInterval", type: Number, defaultValue: 10 });
QxComboBox.addProperty({ name: "maxListHeight", type: Number, defaultValue: 180 });






/*
  -------------------------------------------------------------------------------
    MODIFIERS
  -------------------------------------------------------------------------------
*/
  
proto._modifyParent = function(propValue, propOldValue, propName, uniqModIds)
{
  if (propValue)
  {
    propValue.getTopLevelWidget().add(this._popup);
  }
  else if (propOldValue)
  {
    propOldValue.getTopLevelWidget().remove(this._popup);
  };
  
  return QxWidget.prototype._modifyParent.call(this, propValue, propOldValue, propName, uniqModIds);
};

proto._modifySelected = function(propValue, propOldValue, propName, uniqModIds)
{
  this.setValue(propValue ? propValue.getText() : "", uniqModIds);
  
  if (propValue) 
  {
    this._manager.setSelectedItems([propValue]);
  }
  else
  {
    this._manager.deselectAll();  
  };
  
  return true;
};

proto._modifyValue = function(propValue, propOldValue, propName, uniqModIds)
{
  var vText = isValid(propValue) ? propValue : "";
  
  if (this.isEditable())
  {
    this._textfield.setText(vText, uniqModIds);
  }
  else
  {
    this._atom.setText(vText, uniqModIds);
  };
  
  this.setSelected(vText == "" ? null : this.getList().findStringExact(vText), uniqModIds);
  return true;
};

proto._modifyEditable = function(propValue, propOldValue, propName, uniqModIds)
{
  var l = this._atom;
  var t = this._textfield;
  
  if (this.isCreated())
  {
    l.setVisible(!propValue);
    t.setVisible(propValue);
      
    if (propValue)
    {
      t.setText(this.getValue());
    }
    else
    {
      l.setText(this.getValue());
    };
  }
  else
  {
    if (propValue)
    {
      l.setStyleProperty("visibility", "hidden");
      t.removeStyleProperty("visibility");
    }
    else
    {
      t.setStyleProperty("visibility", "hidden");
      l.removeStyleProperty("visibility");
    };    
  };
  
  this._modifyEditablePost(propValue);  
  return true;
};


if ((new QxClient).isMshtml())
{
  proto._modifyEditablePost = function(propValue)
  {
    var t = this._textfield;
    
    if (propValue)
    {
      t.setHtmlProperty("unselectable", false); 
      t.setHtmlProperty("tabIndex", 1);
    }
    else
    {
      t.setHtmlProperty("unselectable", true); 
      t.setHtmlProperty("tabIndex", -1);      
    };  
  };
}
else if ((new QxClient).isGecko())
{
  proto._modifyEditablePost = function(propValue)
  {
    var t = this._textfield;
    
    if (propValue)
    {
      t.setStyleProperty("MozUserFocus", "normal");
      t.setStyleProperty("userFocus", "normal");  
    }
    else
    {
      t.setStyleProperty("MozUserFocus", "ignore");
      t.setStyleProperty("userFocus", "ignore");
    };  
  };
}
else
{
  proto._modifyEditablePost = function(propValue)
  {
    var t = this._textfield;
    
    if (propValue)
    {
      t.setStyleProperty("userFocus", "normal");  
      t.setHtmlProperty("tabIndex", 1);
    }
    else
    {
      t.setStyleProperty("userFocus", "ignore");
      t.setHtmlProperty("tabIndex", -1);      
    };  
  };  
};





/*
  -------------------------------------------------------------------------------
    GETTER
  -------------------------------------------------------------------------------
*/

proto.getList = function() {
  return this._list;
};

proto.getManager = function() {
  return this._manager;
};

proto.getPopup = function() {
  return this._popup;
};

proto.getAtom = function() {
  return this._atom;
};

proto.getTextField = function() {
  return this._textfield;
};

proto.getButton = function() {
  return this._button;
};

proto.getButtonImage = function() {
  return this._buttonimage;
};






/*
  -------------------------------------------------------------------------------
    UTILITY
  -------------------------------------------------------------------------------
*/

/*!
  If you want to pre-create the popup and the list call this function
  anywhere in your code.
*/
proto.createPopup = function()
{
  var p = this._popup;
  
  if (!p.isCreated()) 
  {
    p.setLeft(this.getComputedPageBoxLeft() + 1);
    p.setTop(this.getComputedPageBoxBottom());
    p.setWidth(this.getComputedBoxWidth() - 2);    
    
    p._createElement();
    p.setVisible(false);
  };
};






/*
  -------------------------------------------------------------------------------
    EVENT HANDLER
  -------------------------------------------------------------------------------
*/

proto._togglePopup = function() 
{
  if(this._popup.getVisible())
  {
    this._closePopup();
    
    if (!this.getEditable()) {
      this.setState("mark");
    };
  }
  else
  {
    this._openPopup();
  };
};

proto._openPopup = function()
{
  var p = this._popup;
  var l = this._list;
  var m = this._manager;

  // initial creation of popups and list
  this.createPopup();

  // setup height and scrolling  
  var lh = l.getPreferredHeight();
  var mh = this.getMaxListHeight();
    
  if (lh > mh)
  {
    p.setHeight(mh);    
    l.setOverflow("scrollY");
  }
  else
  {
    p.setHeight(lh);
    l.setOverflow("hidden");
  };
    
  
  
  // Handle editable 
  if (this.isEditable()) 
  {
    var vFound = this._findMatchingEditItem();
    if (vFound)
    {
      m.setSelectedItem(vFound);
    }
    else
    {
      var oldFireChange = m.getFireChange();
      m.setFireChange(false);
      
      m.deselectAll();  
      m.setLeadItem(null);
      
      m.setFireChange(oldFireChange);
    };
  };
  
  // Syncronise current selection
  var vCurrent = this._manager.getSelectedItem();
  if (vCurrent) {
    m.setLeadItem(vCurrent);
    m.scrollItemIntoView(vCurrent);
  };  
  
  // Activate capture
  this.setCapture(true);  
  
  // Reset state
  this.setState(null);
  
  // Finally show the popup
  p.setVisible(true);
};

proto._closePopup = function()
{
  // Syncronise selection: manager -> combobox
  var vCurrent = this._manager.getSelectedItem();
  this.setSelected(vCurrent);
  this._manager.setLeadItem(vCurrent);
  
  // Deactivating capturing
  this.setCapture(false);
  
  // Finally hide the popup  
  this._popup.setVisible(false);
};

proto._onmousedown = function(e)
{
  var t = e.getActiveTarget();
  
  if (typeof t == "undefined") {
    return;
  };
  
  if (t instanceof QxImage) {
    t = t.getParent();
  };

  if (t instanceof QxListItem) 
  {
    if( !t.isEnabled() ) {
      return;
    };

    t = t.getParent();
  };
  
  switch(t)
  {
    case this._textfield:
      return;
    
    case this._atom:
    case this._button:
    case this._buttonimage:
      this._togglePopup();
      this._button.setBorder(QxBorder.presets.inset);
      break;
      
    case this._list:
      this._list._onmousedown(e);
      
      // don't close on click and move to the scrollbars
      if (e.getTarget() != this._list) {
        this._closePopup();
      };
      
      break;
      
    // Mshtml click on scrollbar
    case this._popup:
      break;
    
    default:
      var sel = this.getSelected();
      
      this._manager.deselectAll();
      
      if (sel) {
        this._manager.setSelectedItem(sel);
      };
    
      this._closePopup(); 
      break;
  };
};

proto._onmouseup = function(e) {
  this._button.setBorder(QxBorder.presets.outset);
};

proto._findMatchingEditItem = function() {
  return this._list.findStringExact(this._textfield.getElement().value);
};

proto._onkeydown = function(e) 
{
  var m = this._manager;
  
  if (this._popup.getVisible())
  {
    if (e.getKeyCode() == QxKeyEvent.keys.enter)
    {
      this.setSelected(this._manager.getSelectedItem());
      this._closePopup();
      return;
    }
    else if (e.getKeyCode() == QxKeyEvent.keys.esc)
    {
      m.setSelectedItem(this.getSelected());
      m.setLeadItem(this.getSelected());      
      this._popup.setVisible(false);
      this.setCapture(false); 
      return;
    };  
  }
  else if (e.getKeyCode() == QxKeyEvent.keys.enter)
  {
    this._openPopup();  
  };
  

  if (!this._popup.getVisible() && e.getKeyCode() == QxKeyEvent.keys.pageup)
  {
    var vPrevious;
    var vTemp = this.getSelected();
    
    if (vTemp)
    {
      var vInterval = this.getPagingInterval();
    
      do {
        vPrevious = vTemp;
      }
      while(--vInterval && (vTemp = m.getPrevious(vPrevious)));
    }
    else
    {
      vPrevious = m.getLast();
    };
    
    this.setSelected(vPrevious);
  }
  else if (!this._popup.getVisible() && e.getKeyCode() == QxKeyEvent.keys.pagedown)
  {
    var vNext;
    var vTemp = this.getSelected();
    
    if (vTemp)
    {
      var vInterval = this.getPagingInterval();

      do {
        vNext = vTemp;
      }
      while(--vInterval && (vTemp = m.getNext(vNext)));
    }
    else
    {
      vNext = m.getFirst();
    };
    
    this.setSelected(vNext);  
  }
  else if (!this.isEditable() || this._popup.getVisible()) 
  {
    this._list._onkeydown(e);
  }
  else if (e.getKeyCode() == QxKeyEvent.keys.up || e.getKeyCode() == QxKeyEvent.keys.down)
  {
    var vFound = this._findMatchingEditItem();

    if (vFound)
    {
      m.setSelectedItem(vFound);    
      m.setLeadItem(vFound);
    }
    else
    {
      m.deselectAll();  
      m.setLeadItem(null);
    };
    
    this._list._onkeydown(e);
  }
  
  // pagedown and pageup need a created popup
  else if (this._popup.isCreated() && (e.getKeyCode() == QxKeyEvent.keys.pageup || e.getKeyCode() == QxKeyEvent.keys.pagedown))
  {
    var vFound = this._findMatchingEditItem();
    
    if (vFound)
    {
      m.setSelectedItem(vFound);    
      m.setLeadItem(vFound);
    }
    else
    {
      m.deselectAll();  
      m.setLeadItem(null);
    };
    
    this._list._onkeydown(e);    
  };
};

proto._onkeypress = function(e) 
{
  if (!this.isEditable() || this._popup.getVisible()) {
    this._list._onkeypress(e);
  };
};

proto._onmouseover = function(e)
{
  var t = e.getTarget();

  if (t instanceof QxImage) {
    t = t.getParent();
  };
  
  if (t instanceof QxListItem && t.getEnabled()) 
  {
    var m = this._manager;
    
    m.deselectAll();
    m.setLeadItem(t);
    m.setSelectedItem(t);
  };
};

proto._onmousewheel = function(e)
{
  if (!this._popup.getVisible())
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

proto._onchangeselection = function(e)
{
  if (!this._popup.getVisible())
  {
    this.setSelected(this._manager.getSelectedItem());
  };
};

proto._visualizeBlur = function()
{
  this.setState(null);

  // TODO: close popup but do *not* select current item
  //  this._closePopup();

  QxWidget.prototype._visualizeBlur.call(this);
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
  
  if (this._list) {
    this._list.dispose();
    this._list = null;
  };

  if (this._manager) {
    this._manager.dispose();
    this._manager = null;
  };

  if (this._popup) {
    this._popup.dispose();
    this._popup = null;
  };

  if (this._atom) {
    this._atom.dispose();
    this._atom = null;
  };

  if (this._textfield) {
    this._textfield.dispose();
    this._textfield = null;
  };
  
  if (this._button) {
    this._button.dispose();
    this._button = null;
  };

  if (this._buttonimage) {
    this._buttonimage.dispose();
    this._buttonimage = null;
  };
  
  return QxWidget.prototype.dispose.call(this);
};

