function QxToolTipManager()
{
  if(QxToolTipManager._instance)
    return QxToolTipManager._instance;

  QxManager.call(this);
  
  QxToolTipManager._instance = this;
};

QxToolTipManager.extend(QxManager, "QxToolTipManager");

QxToolTipManager.addProperty({ name : "currentToolTip" });

proto._modifyCurrentToolTip = function(propValue, propOldValue, propName, uniqModIds)
{
  // Return if the new tooltip is a child of the old one
  if(propOldValue && propOldValue.contains(propValue)) {
    return;
  };
  
  // If old tooltip existing, hide it and clear widget binding
  if(propOldValue)
  {
    propOldValue.setVisible(false);
    
    propOldValue._stopShowTimer();
    propOldValue._stopHideTimer();
  };

  // If new tooltip is not null, set it up and start the timer
  if(propValue) {
    propValue._startShowTimer();
  };
  
  return true;
};

proto.handleMouseOver = function(e)
{
  var to = e.getTarget();
  var c = to;
  var tt;
  
  // this.debug("MouseOver Handler");

  //Search first parent which has a tooltip
  while(c != null && !(tt = c.getToolTip())) {
    c = c.getParent();
  };
    
  // Bind tooltip to widget
  if (tt != null) {
    tt.setBoundToWidget(c);
  };
    
  // Set Property
  this.setCurrentToolTip(tt);  
};

proto.handleMouseOut = function(e)
{
  var to = e.getRelatedTarget();
  var from = e.getTarget();
  var cur = this.getCurrentToolTip();
  
  // this.debug("MouseOut Handler");

  // If there was a tooltip and 
  // - the destination target is the current tooltip
  //   or 
  // - the current tooltip contains the destination target
  if(cur && (to == cur || cur.contains(to))) {
    return;
  };
    
  // If the destination target exists and the target contains it
  if(to && from.contains(to)) {
    return;
  };

  // If there was a tooltip and there is no new one
  if(cur && !to) {
    this.setCurrentToolTip(null);
  };
};

proto.handleFocus = function(e)
{
  var c = e.getTarget();
  var tt = c.getToolTip();
  
  // this.debug("Focus Handler");

  // Only set new tooltip if focus widget
  // has one
  if(tt != null)
  {
    // Bind tooltip to widget
    tt.setBoundToWidget(c);
    
    // Set Property
    this.setCurrentToolTip(tt);
  };
};

proto.handleBlur = function(e)
{
  var c = e.getTarget();

  // this.debug("Blur Handler");

  if(!c) {
    return;
  };

  var tt = c.getToolTip();
  var cur = this.getCurrentToolTip();

  // Only set to null if blured widget is the
  // one which has created the current tooltip
  if(cur && cur == tt) {
    this.setCurrentToolTip(null);
  };
};
