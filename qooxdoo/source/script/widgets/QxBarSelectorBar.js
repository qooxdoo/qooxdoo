function QxBarSelectorBar()
{
  QxWidget.call(this);

  this.setState("top");
  
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
  
  this._applyState();
  
  return true;
};




/*
------------------------------------------------------------------------------------
  UPDATE
------------------------------------------------------------------------------------
*/
QxBarSelectorBar.states = 
{
  top: {
    setBottom : null,
    setWidth : null,
    setTop : 0,
    setHeight : "auto",
    setLeft : 0,
    setRight : 0
  },
  
  right: {
    setLeft : null,
    setHeight: null,
    setRight : 0,
    setWidth : "auto",
    setBottom : 0,
    setTop : 0   
  },
  
  bottom: {
    setTop : null,
    setWidth : null,
    setBottom : 0,
    setHeight : "auto",
    setLeft : 0,
    setRight : 0
  },
  
  left: {
    setRight : null,
    setHeight: null,
    setLeft : 0,
    setWidth : "auto",
    setBottom : 0,
    setTop : 0
}};
// please keep: this end is not nice, but is seems that the optimizer 
// has currently problems in optimizing property lists.


proto._applyState = function()
{
  var h = QxBarSelectorBar.states[this.getState()];
  for (var i in h) {
    this[i](h[i]);
  };
};




/*
------------------------------------------------------------------------------------
  LAYOUTER
------------------------------------------------------------------------------------
*/

proto._layoutInternalWidgets = function(vHint) 
{
  this._layoutInternalWidgetsHorizontal(vHint);
  this._layoutInternalWidgetsVertical(vHint);
};

proto._layoutInternalWidgetsHorizontal = function(vHint)
{
  var vPane = this.getParent().getPane();

  if (!this.isCreated() || !vPane.isCreated()) {
    return true;
  };

  // this.debug("LAYOUT HORIZONTAL: " + vHint + ": " + this.getState());
  
  switch(this.getState())
  {
    case "left":
    case "right":
      var vSet = { setWidth : null, setLeft : 0, setRight : 0, setHorizontalAlign: "center" };
      break;
      
    default:
      var vSet = { setLeft : null, setRight : null, setWidth : "auto", setHorizontalAlign: null };
  };      
    
  var ch = this.getChildren();
  var chl = ch.length;
  
  for (var i=0; i<chl; i++)
  {
    for (var j in vSet) 
    {
      ch[i][j](vSet[j]);
    };
    
    ch[i]._recalculateFrame();
  };
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

  // Update placement of icon and text
  this._layoutInternalWidgetsVertical("inner-height");
};

proto._innerWidthChanged = function()
{
  // Invalidate internal cache
  this._invalidateInnerWidth();

  // Update placement of icon and text
  this._layoutInternalWidgetsHorizontal("inner-width");
};





/*
------------------------------------------------------------------------------------
  RENDERER: OUTER DIMENSION SIGNAL

  should be called always when the outer dimensions have been modified
------------------------------------------------------------------------------------
*/

proto._childOuterWidthChanged = function(vModifiedChild, vHint) {
  return !this._wasVisible ? true : this.getWidth() == "auto" ? this._setChildrenDependWidth(vModifiedChild, vHint) : this._layoutInternalWidgetsHorizontal(vHint);
};

proto._childOuterHeightChanged = function(vModifiedChild, vHint) {
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