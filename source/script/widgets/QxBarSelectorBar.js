function QxBarSelectorBar()
{
  QxWidget.call(this);

  this._manager = new QxRadioButtonManager();
};

QxBarSelectorBar.extend(QxWidget, "QxBarSelectorBar");


/*
------------------------------------------------------------------------------------
  UTILITY
------------------------------------------------------------------------------------
*/

proto.getManager = function() {
  return this._manager;
};



/*
------------------------------------------------------------------------------------
  STATE MODIFIER
------------------------------------------------------------------------------------
*/

proto._modifyState = function(propValue, propOldValue, propName, uniqModIds)
{
  var vClasses = this.getCssClassName();

  if (isValidString(propOldValue)) {
    vClasses = vClasses.remove(this.classname + "-" + propOldValue.toFirstUp(), " ");
  };

  if (isValidString(propValue)) {
    vClasses = vClasses.add(this.classname + "-" + propValue.toFirstUp(), " ");
  };

  this.setCssClassName(vClasses, uniqModIds);
  
  return this._applyState();
};




/*
------------------------------------------------------------------------------------
  UPDATE
------------------------------------------------------------------------------------
*/

proto._applyState = function() 
{
  this._omitRendering();
  this["_applyState_" + this.getState()]();
  this._activateRendering();
    
  return true;
};

proto._applyState_top = function()
{
  this.setBottom(null);
  this.setWidth(null);

  this.setHeight("auto");
  
  this.setLeft(0);
  this.setRight(0);
  this.setTop(0);  
};

proto._applyState_right = function()
{
  this.setLeft(null);
  this.setHeight(null);

  this.setWidth("auto");
  
  this.setRight(0);  
  this.setBottom(0);
  this.setTop(0);  
};

proto._applyState_bottom = function()
{
  this.setWidth(null);
  this.setTop(null);

  this.setHeight("auto");

  this.setLeft(0);
  this.setRight(0);
  this.setBottom(0);  
};

proto._applyState_left = function()
{
  this.setRight(null);
  this.setHeight(null);

  this.setWidth("auto");

  this.setLeft(0);
  this.setBottom(0);
  this.setTop(0);
};



/*
------------------------------------------------------------------------------------
  LAYOUTER
------------------------------------------------------------------------------------
*/

proto._layoutInternalWidgetsRunning = false;

proto._layoutInternalWidgets = proto._layoutInternalWidgetsHorizontal = function(vHint)
{
  if (this._layoutInternalWidgetsRunning) {
    return true; 
  };
  
  var vPane = this.getParent().getPane();

  if (!this.isCreated() || !vPane.isCreated()) {
    return true;
  };
  
  this._layoutInternalWidgetsRunning = true;

  var ch = this.getChildren();
  var chl = ch.length;
  var chc;
    
  switch(this.getState())
  {
    case "left":
    case "right":
      for (var i=0; i<chl; i++)
      {
        chc = ch[i];
        
        chc._omitRendering();
        
        chc.setWidth(null);
        chc.setTop(null);
        chc.setBottom(null);
        chc.setLeft(0);
        chc.setRight(0);
        chc.setHeight("auto");        
        
        chc._innerWidthChanged();
        chc._innerHeightChanged();
        
        chc._activateRendering(); 
      };
      
      break;    
      
    default:
      for (var i=0; i<chl; i++)
      {
        chc = ch[i];
        
        chc._omitRendering();
        
        chc.setLeft(null);
        chc.setRight(null);
        chc.setHeight(null);
        chc.setTop(0);
        chc.setBottom(0);
        chc.setWidth("auto");        
        
        chc._innerWidthChanged();
        chc._innerHeightChanged();
        
        chc._activateRendering();
      };
      
      break;      
  };   
  
  this._layoutInternalWidgetsRunning = false;
};

proto._layoutInternalWidgetsVertical = function(vHint) { 
  return;
};






/*
------------------------------------------------------------------------------------
  BASICS

  Extend this core functions of QxWidget.
------------------------------------------------------------------------------------
*/

proto._onnewchild = function(otherObject) {
  this._layoutInternalWidgetsHorizontal("append-child");
};

proto._onremovechild = function(otherObject) {
  this._layoutInternalWidgetsHorizontal("remove-child");
};





/*
------------------------------------------------------------------------------------
  RENDERER: INNER DIMENSION SIGNAL

  should be called always when the inner dimension have been modified
------------------------------------------------------------------------------------
*/

proto._innerHeightChanged = function()
{
  // Invalidate internal cache
  this._invalidateInnerHeight();
  
  // Update placement of buttons
  this._layoutInternalWidgetsHorizontal("inner-height");
};

proto._innerWidthChanged = function()
{
  // Invalidate internal cache
  this._invalidateInnerWidth();
};





/*
------------------------------------------------------------------------------------
  RENDERER: OUTER DIMENSION SIGNAL

  should be called always when the outer dimensions have been modified
------------------------------------------------------------------------------------
*/

proto._childOuterWidthChanged = function(vModifiedChild, vHint)
{
  if (this._layoutInternalWidgetsRunning) {
    return; 
  };
  
  return !this._wasVisible ? true : this.getWidth() == "auto" ? this._setChildrenDependWidth(vModifiedChild, vHint) : this._layoutInternalWidgetsHorizontal(vHint);
};

proto._childOuterHeightChanged = function(vModifiedChild, vHint) 
{
  if (this._layoutInternalWidgetsRunning) {
    return; 
  };

  return !this._wasVisible ? true : this.getHeight() == "auto" ? this._setChildrenDependHeight(vModifiedChild, vHint) : this._layoutInternalWidgetsVertical(vHint);
};





/*
  -------------------------------------------------------------------------------
    DISPOSER
  -------------------------------------------------------------------------------
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
  
  QxWidget.prototype.dispose.call(this);
};