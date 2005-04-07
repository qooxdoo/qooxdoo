function QxWindow(vWindowTitle)
{
  QxPopup.call(this);
  
  this.setBorder(QxBorder.presets.outset);
  this.setPadding(2);
  
  // ***********************************************************************
  //   TITLEBAR
  // ***********************************************************************    
  this._titlebar = new QxWidget;
  this._titlebar.set({ top : 0, left: 0, right : 0, height: 18, backgroundColor: "#0B256B", color : "#FFFFFF" });
  this.add(this._titlebar);
  
  
  
  // ***********************************************************************
  //   TITLE TEXT
  // ***********************************************************************      
  this._title = new QxContainer(isValidString(vWindowTitle) ? vWindowTitle : "");
  this._title.set({ left : 20, top : 2 });
  this._title.setStyleProperty("fontWeight", "bold");
  this._titlebar.add(this._title);
  
  
  
  // ***********************************************************************
  //   ICON
  // ***********************************************************************      
  this._icon = new QxImage("icons/16/bookmark.png");
  this._icon.set({ left : 2, top : 1 });
  this._titlebar.add(this._icon);
  
  
  
  
  // ***********************************************************************
  //   BUTTONS
  // ***********************************************************************      
  this._closeButton = new QxWidget;
  this._closeButton.set({ right: 1, top: 2, height: 14, width: 16, paddingLeft: 1, border: QxBorder.presets.outset, backgroundColor: "Threedface" });
  this._closeImage = new QxImage("widgets/window/close.gif");
  this._closeButton.add(this._closeImage);
  this._titlebar.add(this._closeButton);

  this._restoreButton = new QxWidget;
  this._restoreButton.set({ right: 18, top: 2, height: 14, width: 16, paddingLeft: 1, border: QxBorder.presets.outset, backgroundColor: "Threedface" });
  this._restoreImage = new QxImage("widgets/window/restore.gif");
  this._restoreButton.add(this._restoreImage);
  this._titlebar.add(this._restoreButton);

  this._minimizeButton = new QxWidget;
  this._minimizeButton.set({ right: 34, top: 2, height: 14, width: 16, paddingLeft: 1, border: QxBorder.presets.outset, backgroundColor: "Threedface" });
  this._minimizeImage = new QxImage("widgets/window/minimize.gif");
  this._minimizeButton.add(this._minimizeImage);
  this._titlebar.add(this._minimizeButton);

  
  

  
  // ***********************************************************************
  //   PANE
  // ***********************************************************************      
  this._pane = new QxWidget;
  this._pane.set({ cssClassName : "QxWindowPane", top : 18, bottom: 18, left: 0, right: 0, paddingTop: 4, paddingBottom: 4 });
  this.add(this._pane);
  
  
  
  
  // ***********************************************************************
  //   STATUSBAR
  // ***********************************************************************      
  this._statusbar = new QxWidget;
  this._statusbar.set({ bottom: 0, left: 0, right: 0, height: 18 });
  this._statusbar.setBorder(QxBorder.presets.thinInset);
  this.add(this._statusbar);
  
  
  
  
  
  
  
  
  // ***********************************************************************
  //   EVENTS
  // ***********************************************************************    
  
  this.addEventListener("mousedown", this._onwindowmousedown, this);
  
  this._titlebar.addEventListener("mousedown", this._ontitlemousedown, this);
  this._titlebar.addEventListener("mouseup", this._ontitlemouseup, this);
  this._titlebar.addEventListener("mousemove", this._ontitlemousemove, this);
  
  this._icon.addEventListener("mousedown", this._oniconmousedown, this);
  
  this._closeButton.addEventListener("click", this._onclosebuttonmousedown, this);
  

  
};

QxWindow.extend(QxPopup, "QxWindow");

QxWindow.addProperty({ name : "modal", type : Boolean, defaultValue : false });
QxWindow.addProperty({ name : "opener", type : Object });


/*
------------------------------------------------------------------------------------
  MANAGER
------------------------------------------------------------------------------------
*/

proto._windowManager = new QxWindowManager();



/*
------------------------------------------------------------------------------------
  OVERWRITE POPUP METHODS
------------------------------------------------------------------------------------
*/

proto._beforeShow = function(uniqModIds)
{
  QxAtom.prototype._beforeShow.call(this, uniqModIds);
  
  (new QxPopupManager).update();
  
  this._windowManager.add(this);
  this._makeActive(); 
};

proto._beforeHide = function(uniqModIds)
{
  QxAtom.prototype._beforeHide.call(this, uniqModIds);
  
  this._windowManager.remove(this);
  this._makeInactive();
};

proto.bringToFront = proto.sendToBack = function() {
  throw new Error("Warning: bringToFront() and sendToBack() are not supported by QxWindow!");
};





/*
------------------------------------------------------------------------------------
  UTILITY
------------------------------------------------------------------------------------
*/

proto.close = function() {
  this.setVisible(false);
};

proto.open = function(vOpener) 
{
  if (isValid(vOpener)) {
    this.setOpener(vOpener);
  };

  this.setVisible(true);
};




/*
------------------------------------------------------------------------------------
  EVENTS
------------------------------------------------------------------------------------
*/

proto._onwindowmousedown = function(e) {
  this._windowManager.setActiveWindow(this);
};

proto._ontitlemousedown = function(e)
{
  if (e.isNotLeftButton()) {
    return;
  };
  
  // Enable capturing
  this._titlebar.setCapture(true);
  
  // Measuring offsets
  this._dragSession = {
    offsetX : e.getPageX() - this.getComputedPageBoxLeft(),
    offsetY : e.getPageY() - this.getComputedPageBoxTop()
  };
};

proto._ontitlemouseup = function(e)
{
  if (!this._dragSession) {
    return;
  };
  
  // Disable capturing
  this._titlebar.setCapture(false);  

  // Move window to last position  
  var s = this.getElement().style;
  this.setLeft(parseInt(s.left));
  this.setTop(parseInt(s.top));  
  
  // Cleanup session
  delete this._dragSession;
};

proto._ontitlemousemove = function(e)
{
  if (!this._dragSession) {
    return;
  };
  
  // Use the fast methods  
  this._applyPositionHorizontal(e.getPageX() - this._dragSession.offsetX);
  this._applyPositionVertical(e.getPageY() - this._dragSession.offsetY);
};

proto._oniconmousedown = function(e) {
  e.stopPropagation();
};

proto._onclosebuttonmousedown = function(e) {
  this.close();  
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
  
  this.removeEventListener("mousedown", this._onwindowmousedown, this);
  
  if (this._titlebar) 
  {
    this._titlebar.removeEventListener("mousedown", this._ontitlemousedown, this);
    this._titlebar.removeEventListener("mouseup", this._ontitlemouseup, this);
    this._titlebar.removeEventListener("mousemove", this._ontitlemousemove, this);

    this._titlebar.dispose();
    this._titlebar = null;
  };
  
  if (this._title) 
  {
    this._title.dispose();
    this._title = null;
  };

  if (this._icon) 
  {
    this._icon.removeEventListener("mousedown", this._oniconmousedown, this);
    
    this._icon.dispose();
    this._icon = null;
  };

  if (this._closeButton) 
  {
    this._closeButton.removeEventListener("click", this._onclosebuttonmousedown, this);  
    
    this._closeButton.dispose();
    this._closeButton = null;
  };

  if (this._restoreButton) 
  {
    this._restoreButton.dispose();
    this._restoreButton = null;
  };

  if (this._minimizeButton) 
  {
    this._minimizeButton.dispose();
    this._minimizeButton = null;
  };

  if (this._pane) 
  {
    this._pane.dispose();
    this._pane = null;
  };

  if (this._statusbar) 
  {
    this._statusbar.dispose();
    this._statusbar = null;
  };

  return QxPopup.prototype.dispose.call(this);
};