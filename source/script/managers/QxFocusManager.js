function QxFocusManager(vClientWindow)
{
  // don't use QxManager things
  QxObject.call(this);

  if (isValid(vClientWindow)) {
    this._attachedClientWindow = vClientWindow;
  };
};

QxFocusManager.extend(QxManager, "QxFocusManager");

QxFocusManager.addProperty({ name : "focusedWidget" });

proto._attachedClientWindow = null;



/*
  -------------------------------------------------------------------------------
    MODIFIERS
  -------------------------------------------------------------------------------
*/

proto._modifyFocusedWidget = function(propValue, propOldValue, propName, uniqModIds)
{
  var cIn = typeof propValue == "object" && propValue != null;
  var cOut = typeof propOldValue == "object" && propOldValue != null;

  if (cIn && typeof QxPopupManager == "function")
  {
    (new QxPopupManager).update(propValue);
  };

  if (cOut)
  {
    // Dispatch FocusOut
    var s = new QxFocusEvent("focusout", false);

    if (cIn) {
      s.setRelatedTarget(propValue);
    };

    propOldValue.dispatchEvent(s);
    s.dispose();
  };

  if (cIn)
  {
    // Dispatch FocusIn
    var s = new QxFocusEvent("focusin", false);

    if (cOut) {
      s.setRelatedTarget(propOldValue);
    };

    propValue.dispatchEvent(s);
    s.dispose();
  };

  if (cOut)
  {
    // Call Object Property Setter
    propOldValue.setFocused(false, uniqModIds);

    // Dispatch Blur
    var s = new QxFocusEvent("blur", false);

    if (cIn) {
      s.setRelatedTarget(propValue);
    };

    propOldValue.dispatchEvent(s);

    (new QxToolTipManager).handleBlur(s);
    s.dispose();

    (new QxApplication).setActiveWidget(null);
  };

  if (cIn)
  {
    // Call Object Property Setter
    propValue.setFocused(true, uniqModIds);

    // Dispatch Focus
    var s = new QxFocusEvent("focus", false);

    if (cOut) {
      s.setRelatedTarget(propOldValue);
    };

    propValue.dispatchEvent(s);

    (new QxToolTipManager).handleFocus(s);
    s.dispose();

    (new QxApplication).setActiveWidget(propValue);
  };

  return true;
};




/*
  -------------------------------------------------------------------------------
    TAB-EVENT HANDLING
  -------------------------------------------------------------------------------
*/

// Check for TAB pressed
// * use keydown on mshtml
// * use keypress on all other (correct) browsers
// = same behaviour
proto._ontabeventname = (new QxClient).isMshtml() ? "keydown" : "keypress";

proto._ontabevent = function(e)
{
  if (e.type != this._ontabeventname || !this._attachedClientWindow) {
    return;
  };

  var cd = this._attachedClientWindow.getDocument();
  var current = this.getFocusedWidget();

  // Support shift key to reverse widget detection order
  if(!e.shiftKey)
  {
    var next = current ? this.getWidgetAfter(cd, current) : this.getFirstWidget(cd);
  }
  else
  {
    var next = current ? this.getWidgetBefore(cd, current) : this.getLastWidget(cd);
  };

  // If there was a widget found, focus it
  if(next) {
    next.setFocused(true);
  };
};

proto.compareTabOrder = function(c1, c2)
{
  // Sort-Check #1: Tab-Index
  if(c1 == c2) {
    return 0;
  };

  var t1 = c1.getTabIndex();
  var t2 = c2.getTabIndex();

  // The following are some ideas to handle focus after tabindex.

  // Sort-Check #2: Top-Position
  if(t1 != t2) {
    return t1 - t2;
  };

  var y1 = c1.getComputedPageBoxTop();
  var y2 = c2.getComputedPageBoxTop();

  if(y1 != y2) {
    return y1 - y2;
  };

  // Sort-Check #3: Left-Position
  var x1 = c1.getComputedPageBoxLeft();
  var x2 = c2.getComputedPageBoxLeft();

  if(x1 != x2) {
    return x1 - x2;
  };

  // Sort-Check #4: zIndex
  var z1 = c1.getZIndex();
  var z2 = c2.getZIndex();

  if(z1 != z2) {
    return z1 - z2;
  };

  return 0;
};






/*
  -------------------------------------------------------------------------------
    UTILITY/HELPER FUNCTIONS
  -------------------------------------------------------------------------------
*/

proto.getFirstWidget = function(oContainer)
{
  return this._getFirst(oContainer, null);
};

proto.getLastWidget = function(oContainer)
{
  return this._getLast(oContainer, null);
};

proto.getWidgetAfter = function(oContainer, oWidget)
{
  if(oContainer == oWidget) {
    return this.getFirstWidget(oContainer);
  };

  if(oWidget.getAnonymous()) {
    oWidget = oWidget.getParent();
  };

  if(oWidget == null) {
    return [];
  };

  var all = [];

  this._getAllAfter(oContainer, oWidget, all);

  all.sort(this.compareTabOrder);

  return all.length > 0 ? all[0] : this.getFirstWidget(oContainer);
};

proto.getWidgetBefore = function(oContainer, oWidget)
{
  if(oContainer == oWidget) {
    return this.getLastWidget(oContainer);
  };

  if(oWidget.getAnonymous()) {
    oWidget = oWidget.getParent();
  };

  if(oWidget == null) {
    return [];
  };

  var all = [];

  this._getAllBefore(oContainer, oWidget, all);

  all.sort(this.compareTabOrder);

  var l = all.length;
  return l > 0 ? all[l-1] : this.getLastWidget(oContainer);
};

proto._getAllAfter = function(oCont, oComp, oArray)
{
  var cs = oCont.getChildren();
  var l = cs.length;

  for (var i = 0; i < l; i++)
  {
    if(!(cs[i]instanceof QxWidget)) {
      continue;
    };

    if(cs[i].canGetFocus() && cs[i].getTabIndex() > 0 && this.compareTabOrder(oComp, cs[i]) < 0)
    {
      oArray.push(cs[i]);
    };

    if(!cs[i].isFocusRoot()) {
      this._getAllAfter(cs[i], oComp, oArray);
    };
  };
};

proto._getAllBefore = function(oCont, oComp, oArray)
{
  var cs = oCont.getChildren();
  var l = cs.length;

  for (var i = 0; i < l; i++)
  {
    if(!(cs[i]instanceof QxWidget)) {
      continue;
    };

    if(cs[i].canGetFocus() && cs[i].getTabIndex() > 0 && this.compareTabOrder(oComp, cs[i]) > 0)
    {
      oArray.push(cs[i]);
    };

    if(!cs[i].isFocusRoot()) {
      this._getAllBefore(cs[i], oComp, oArray);
    };
  };
};

proto._getFirst = function(oCont, oFirst)
{
  var cs = oCont.getChildren();
  var l = cs.length;

  for (var i = 0; i < l; i++)
  {
    if(!(cs[i]instanceof QxWidget)) {
      continue;
    };

    if(cs[i].canGetFocus() && cs[i].getTabIndex() > 0)
    {
      if(oFirst == null || this.compareTabOrder(cs[i], oFirst) < 0) {
        oFirst = cs[i];
      };
    };

    if(!cs[i].isFocusRoot()) {
      oFirst = this._getFirst(cs[i], oFirst);
    };
  };

  return oFirst;
};

proto._getLast = function(oCont, oLast)
{
  var cs = oCont.getChildren();
  var l = cs.length;

  for (var i = 0; i < l; i++)
  {
    if(!(cs[i] instanceof QxWidget)) {
      continue;
    };

    if(cs[i].canGetFocus() && cs[i].getTabIndex() > 0)
    {
      if(oLast == null || this.compareTabOrder(cs[i], oLast) > 0) {
        oLast = cs[i];
      };
    };

    if(! cs[i].isFocusRoot()) {
      oLast = this._getLast(cs[i], oLast);
    };
  };

  return oLast;
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

  this._attachedClientWindow = null;

  QxObject.prototype.dispose.call(this);
};