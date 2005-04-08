function QxWindow(vCaption, vIcon)
{
  QxPopup.call(this);
  
  this.setBorder(QxBorder.presets.outset);
  this.setPadding(2);
  
  // ***********************************************************************
  //   CAPTIONBAR
  // ***********************************************************************    
  this._captionbar = new QxWidget;
  this._captionbar.set({ cssClassName : "QxWindowCaptionBar", top : 0, left: 0, right : 0, height: 18 });
  this.add(this._captionbar);
  
  
  
  // ***********************************************************************
  //   CAPTION TEXT
  // ***********************************************************************      
  this._caption = new QxContainer(this.getCaption());
  this._caption.set({ left : 20, top : 2 });
  this._captionbar.add(this._caption);
  
  
  
  // ***********************************************************************
  //   ICON
  // ***********************************************************************      
  this._icon = new QxImage(this.getIcon());
  this._icon.set({ left : 2, top : 1 });
  this._captionbar.add(this._icon);
  
  
  
  
  // ***********************************************************************
  //   BUTTONS
  // ***********************************************************************      
  this._closeButton = new QxWidget;
  this._closeButton.set({ right: 1, top: 2, height: 14, width: 16, paddingLeft: 1, border: QxBorder.presets.outset, backgroundColor: "Threedface" });
  this._closeImage = new QxImage("widgets/window/close.gif");
  this._closeButton.add(this._closeImage);
  this._captionbar.add(this._closeButton);

  this._restoreButton = new QxWidget;
  this._restoreButton.set({ right: 18, top: 2, height: 14, width: 16, paddingLeft: 1, border: QxBorder.presets.outset, backgroundColor: "Threedface" });
  this._restoreImage = new QxImage("widgets/window/restore.gif");
  this._restoreButton.add(this._restoreImage);
  this._captionbar.add(this._restoreButton);

  this._minimizeButton = new QxWidget;
  this._minimizeButton.set({ right: 34, top: 2, height: 14, width: 16, paddingLeft: 1, border: QxBorder.presets.outset, backgroundColor: "Threedface" });
  this._minimizeImage = new QxImage("widgets/window/minimize.gif");
  this._minimizeButton.add(this._minimizeImage);
  this._captionbar.add(this._minimizeButton);

  
  

  
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
  
  this._captionbar.addEventListener("mousedown", this._ontitlemousedown, this);
  this._captionbar.addEventListener("mouseup", this._ontitlemouseup, this);
  this._captionbar.addEventListener("mousemove", this._ontitlemousemove, this);
  
  this._icon.addEventListener("mousedown", this._oniconmousedown, this);
  
  this._closeButton.addEventListener("click", this._onclosebuttonmousedown, this);
  




  // ***********************************************************************
  //   ARGUMENTS
  // ***********************************************************************    
  
  if (isValidString(vCaption)) {
    this.setCaption(vCaption);
  };
  
  if (isValidString(vIcon)) {
    this.setIcon(vIcon);
  };
  
};

QxWindow.extend(QxPopup, "QxWindow");

QxWindow.addProperty({ name : "modal", type : Boolean, defaultValue : false });
QxWindow.addProperty({ name : "opener", type : Object });

/*
  Supported states (by state property):
  null (normal), minmized, maximized
*/

QxWindow.addProperty({ name : "caption", type : String, defaultValue : "Caption" });
QxWindow.addProperty({ name : "icon", type : String, defaultValue : "icons/16/exec.png" });

QxWindow.addProperty({ name : "active", type : Boolean, defaultValue : false });
QxWindow.addProperty({ name : "showClose", type : Boolean, defaultValue : true });
QxWindow.addProperty({ name : "showMaximize", type : Boolean, defaultValue : true });
QxWindow.addProperty({ name : "showMinimize", type : Boolean, defaultValue : true });
QxWindow.addProperty({ name : "showIcon", type : Boolean, defaultValue : true });
QxWindow.addProperty({ name : "resizeable", type : Boolean, defaultValue : true });
QxWindow.addProperty({ name : "moveable", type : Boolean, defaultValue : true });




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
  MODIFIERS
------------------------------------------------------------------------------------
*/

proto._modifyActive = function(propValue, propOldValue, propName, uniqModIds)
{
  if (propValue)
  {
    this.addCssClassNameDetail("active") 
    this._windowManager.setActiveWindow(this, uniqModIds);
  }
  else
  {
    this.removeCssClassNameDetail("active");
  };
  
  return true;  
};

proto._modifyCaption = function(propValue, propOldValue, propName, uniqModIds)
{
  this._caption.setHtml(propValue ? propValue : "");  
  return true;
};

proto._modifyIcon = function(propValue, propOldValue, propName, uniqModIds)
{
  this._icon.setSource(propValue ? propValue : (new QxImageManager).getBlank());  
  return true;
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
  this.setActive(true);
};

proto._ontitlemousedown = function(e)
{
  if (e.isNotLeftButton()) {
    return;
  };
  
  // Enable capturing
  this._captionbar.setCapture(true);
  
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
  this._captionbar.setCapture(false);  

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
  
  if (this._captionbar) 
  {
    this._captionbar.removeEventListener("mousedown", this._ontitlemousedown, this);
    this._captionbar.removeEventListener("mouseup", this._ontitlemouseup, this);
    this._captionbar.removeEventListener("mousemove", this._ontitlemousemove, this);

    this._captionbar.dispose();
    this._captionbar = null;
  };
  
  if (this._caption) 
  {
    this._caption.dispose();
    this._caption = null;
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