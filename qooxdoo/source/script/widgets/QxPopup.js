function QxPopup(vText, vIcon)
{
  QxAtom.call(this, vText, vIcon);

  this.setZIndex(this._minZindex);
};

QxPopup.extend(QxAtom, "QxPopup");

/*!
  Whether to let the system decide when to hide the popup. Setting 
  this to false gives you better control but it also requires you 
  to handle the closing of the popup.
*/
QxPopup.addProperty({ name : "autoHide", type : Boolean, defaultValue : true });



proto._minZindex = 1e6;

proto._showTimeStamp = new Date(0);
proto._hideTimeStamp = new Date(0);

proto._popupManager = new QxPopupManager();


/*
------------------------------------------------------------------------------------
  PARENT/ELEMENT/VISIBLE MODIFIER
------------------------------------------------------------------------------------
*/

proto._beforeShow = function(uniqModIds)
{
  QxAtom.prototype._beforeShow.call(this, uniqModIds);
  
  this._popupManager.add(this);
  this._popupManager.update(this);

  this._showTimeStamp = new Date;
  this.bringToFront();  
};

proto._beforeHide = function(uniqModIds)
{
  QxAtom.prototype._beforeHide.call(this, uniqModIds);
  
  this.sendToBack();
    
  this._popupManager.remove(this);
  this._hideTimeStamp = new Date;
};

proto._makeActive = function() {
  (new QxApplication).setActiveWidget(this);    
};

proto._makeInactive = function()
{
  var vApp = new QxApplication;
  if (vApp.getActiveWidget() == this) {
    vApp.setActiveWidget(vApp.getClientWindow().getClientDocument());
  };  
};

proto._shouldBecomeCreated = function() {
  return false;
};



/*
------------------------------------------------------------------------------------
  FOCUS
------------------------------------------------------------------------------------
*/

proto.getCanFocus = function() { 
  return false; 
};




/*
------------------------------------------------------------------------------------
  Z-Index positioning
------------------------------------------------------------------------------------
*/

if((new QxClient).isMshtml())
{
  /*!
    Makes so that the current popup is displayed behind all other shown popups
  */
  proto.sendToBack = function()
  {
    if(!this.isCreated() || !this.getParent()) {
      return;
    };
      
    var min = Infinity;
    var d = this.getTopLevelWidget().getDocumentElement();
    var cs = d.body.children;
    var zi;

    for (var i=0; i<cs.length; i++) {
      if(cs[i].nodeType == 1) 
      {
        zi = cs[i].currentStyle.zIndex;
        
        if (zi > this._minZindex) {
          min = Math.min(min, zi);
        };
      };
    };
    
    this.setZIndex(min - 1);
  };
  
  /*!
    Makes so that the popup is displayed on top of all other shown popups.
  */
  proto.bringToFront = function()
  {
    if(!this.isCreated() || !this.getParent()) {
      return;
    };

    var max = -Infinity;
    var d = this.getTopLevelWidget().getDocumentElement();      

    var cs = d.body.children;

    for (var i=0; i<cs.length; i++) {
      if(cs[i].nodeType == 1) {
        max = Math.max(max, cs[i].currentStyle.zIndex);
      };
    };
    
    this.setZIndex(max + 1);
  }; 
}
else
{
  /*!
    Makes so that the current popup is displayed behind all other shown popups
  */
  proto.sendToBack = function()
  {
    if(!this.isCreated() || !this.getParent()) {
      return;
    };
      
    var min = Infinity;
    var d = this.getTopLevelWidget().getDocumentElement();
    var cs = d.body.childNodes;
    var view = d.defaultView;
    var zi;

    for (var i=0; i<cs.length; i++)
    {
      if(cs[i].nodeType == 1)
      {
        zi = cs[i].style.zIndex;

        if(zi == "" || isNaN(zi))
        {
          zi = view.getComputedStyle(cs[i], "").zIndex;

          if(zi == "" || isNaN(zi)) {
            zi = 0;
          };
        };
        
        if (zi > this._minZindex) {
          min = Math.min(min, zi);
        };
      };    
    };  
    
    this.setZIndex(min - 1);
  };
  
  /*!
    Makes so that the popup is displayed on top of all other shown popups.
  */  
  proto.bringToFront = function()
  {
    if(!this.isCreated() || !this.getParent()) {
      return;
    };

    var max = -Infinity;
    var d = this.getTopLevelWidget().getDocumentElement();      
    var cs = d.body.childNodes;
    var view = d.defaultView;
    var zi;

    for (var i=0; i<cs.length; i++)
    {
      if(cs[i].nodeType == 1)
      {
        zi = cs[i].style.zIndex;

        if(zi == "" || isNaN(zi))
        {
          zi = view.getComputedStyle(cs[i], "").zIndex;

          if(zi == "" || isNaN(zi)) {
            zi = 0;
          };
        };

        max = Math.max(max, zi);
      };
    };

    this.setZIndex(max + 1);
  };     
};


proto.getShowTimeStamp = function() {
  return this._showTimeStamp;
};

proto.getHideTimeStamp = function() {
  return this._hideTimeStamp;
};





/*
------------------------------------------------------------------------------------
  DISPOSER
------------------------------------------------------------------------------------
*/

proto.dispose = function()
{
  if(this.getDisposed()) {
    return;
  };
  
  if (this._popupManager) 
  {
    this._popupManager.remove(this);
    this._popupManager = null;
  };
  
  return QxAtom.prototype.dispose.call(this);
};