function QxBarSelectorBar()
{
  QxToolBar.call(this);
  
  this.setState("top");
  this._updatePlacement();

  this._manager = new QxRadioButtonManager();
  this._manager.addEventListener("changeSelected", this._updatePage);
};

QxBarSelectorBar.extend(QxToolBar, "QxBarSelectorBar");

QxBarSelectorBar.addProperty({ name : "placeOn", type : String, defaultValue : "top" });
QxBarSelectorBar.removeProperty({ name : "alignTabsToLeft" });

proto._modifyElement = function(propValue, propOldValue, propName, uniqModIds)
{
  QxWidget.prototype._modifyElement.call(this, propValue, propOldValue, propName, uniqModIds);
  
  switch(this.getPlaceOn())
  {
    case "left":
    case "right":
      this._updateChilds("100%");
  };  
  
  return true;
};

proto.getAlignTabsToLeft = function() {
  return true;
};

proto._updatePage = function(e)
{
  var oldTab = e.getOldValue();
  var newTab = e.getNewValue();

  if (oldTab && oldTab.getPage()) {
    oldTab.getPage().setVisible(false);
  };

  if (newTab && newTab.getPage()) {
    newTab.getPage().setVisible(true);
  };
};

proto.getManager = function() {
  return this._manager;
};

proto._modifyPlaceOn = function(propValue, propOldValue, propName, uniqModIds)
{
  this.getParent().setPlaceBarOn(propValue, uniqModIds);
  this.setState(propValue, uniqModIds);
  
  this._updatePlacement();

  return true;
};

proto._updatePlacement = function()
{
  switch(this.getPlaceOn())
  {
    case "top":
      this._updateChilds(null);
      
      this.setWidth(null);
      this.setRight(0);  
      this.setLeft(0);

      this.setBottom(null);
      this.setTop(0);
      
      this.setHeight("auto");
      
      break;
      
    case "bottom":
      this._updateChilds(null);
    
    
      this.setWidth(null);    
      this.setRight(0);  
      this.setLeft(0);
      
      this.setTop(null);
      this.setBottom(0);
      
      this.setHeight("auto");
      
      break;
      
    case "left":
      this.setHeight(null);
      this.setTop(0);
      this.setBottom(0);

      this.setRight(null);
      this.setLeft(0);
      
      this.setWidth("auto");
      this._updateChilds("100%");
      break;
      
    case "right":
      this.setHeight(null);
      this.setTop(0);
      this.setBottom(0);

      this.setLeft(null);
      this.setRight(0);
      
      this.setWidth("auto");
      this._updateChilds("100%");
      break;
  };
};

proto._updateChilds = function(vWidth)
{
  if (!this.isCreated()) {
    return;
  };
  
  var ch = this.getChildren();
  var chl = ch.length;
  
  switch(vWidth)
  {
    case "100%":
      var max = 0;
      
      for (var i=0; i<chl; i++) {
        max = Math.max(max, ch[i].getElement().firstChild.offsetWidth);
      };
      
      for (var i=0; i<chl; i++) {
        ch[i].getElement().firstChild.style.width = max + "px";
      };  
      
      break;
      
    case null:
      for (var i=0; i<chl; i++) {
        ch[i].getElement().firstChild.style.width = "";
      };
      
      break;
  };
};