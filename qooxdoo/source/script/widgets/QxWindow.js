function QxWindow()
{
  QxPopup.call(this);
  
  this.setPadding(2);
  
  this._titlebar = new QxWidget;
  this._titlebar.set({ top : 0, left: 0, right : 0, height: 18, backgroundColor: "#0B256B", color : "#FFFFFF" });
  this.add(this._titlebar);
  
  this._title = new QxContainer("My First Window");
  this._title.set({ left : 20, top : 2 });
  this._title.setStyleProperty("fontWeight", "bold");
  this._titlebar.add(this._title);
  
  this._icon = new QxImage("icons/16/bookmark.png");
  this._icon.set({ left : 2, top : 1 });
  this._titlebar.add(this._icon);
  
  
  
  
  
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

  
  

  
  
  this._pane = new QxWidget;
  this._pane.set({ top : 18, bottom: 18, left: 0, right: 0, paddingTop: 4, paddingBottom: 4 });
  this.add(this._pane);
  
  
  
  
  
  this._statusbar = new QxWidget;
  this._statusbar.set({ bottom: 0, left: 0, right: 0, height: 18 });
  this._statusbar.setBorder(QxBorder.presets.thinInset);
  this.add(this._statusbar);
  
  
};

QxWindow.extend(QxPopup, "QxWindow");


/*
------------------------------------------------------------------------------------
  MANAGER
------------------------------------------------------------------------------------
*/

proto._windowManager = new QxWindowManager();

proto._beforeShow = function(uniqModIds)
{
  QxAtom.prototype._beforeShow.call(this, uniqModIds);
  
  this._windowManager.add(this);
  this.bringToFront();
  
  this._makeActive();
};

proto._beforeHide = function(uniqModIds)
{
  QxAtom.prototype._beforeHide.call(this, uniqModIds);
  
  this.sendToBack();
  this._windowManager.remove(this);
  
  this._makeInactive();
};