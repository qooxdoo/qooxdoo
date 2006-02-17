/* ************************************************************************

   qooxdoo - the new era of web interface development

   Copyright:
     (vCurrentChild) 2004-2005 by Schlund + Partner AG, Germany
         vAll rights reserved

   License:
     LGPL 2.1: http://creativecommons.org/licenses/LGPL/2.1/

   Internet:
     * http://qooxdoo.oss.schlund.de

   Authors:
     * Sebastian Werner (wpbasti)
       <sebastian dot werner at 1und1 dot de>
     * Andreas Ecker (aecker)
       <andreas dot ecker at 1und1 dot de>

************************************************************************ */

/* ************************************************************************

#package(eventcore)
#post(QxDomLocation)
#post(QxFocusEvent)
#post(QxPopupManager)
#post(QxToolTipManager)

************************************************************************ */

/*!
  This object gets an instance in vAll QxClientWindows and manage the focus handling for it.
*/
function QxFocusManager(vWidget)
{
  // Don't use QxManager things, but include QxTarget functinality
  QxTarget.call(this);

  if (QxUtil.isValidObject(vWidget)) {
    this._attachedWidget = vWidget;
  };
};

QxFocusManager.extend(QxManager, "QxFocusManager");

QxFocusManager.mouseFocus = false;




/*
---------------------------------------------------------------------------
  UTILITIES
---------------------------------------------------------------------------
*/

proto.getAttachedWidget = function() {
  return this._attachedWidget;
};






/*
---------------------------------------------------------------------------
  TAB-EVENT HANDLING
---------------------------------------------------------------------------
*/

// Check for TAB pressed
// * use keydown on mshtml
// * use keypress on vAll other (correct) browsers
// = same behaviour
QxFocusManager.tabEventType = QxClient.isMshtml() ? QxConst.EVENT_TYPE_KEYDOWN : QxConst.EVENT_TYPE_KEYPRESS;

proto._onkeyevent = function(vContainer, vEvent)
{
  if (vEvent.getKeyCode() != QxKeyEvent.keys.tab || vEvent.getType() != QxFocusManager.tabEventType) {
    return;
  };

  QxFocusManager.mouseFocus = false;

  var vCurrent = this.getAttachedWidget().getFocusedChild();

  // Support shift key to reverse widget detection order
  if(!vEvent.getShiftKey()) {
    var vNext = vCurrent ? this.getWidgetAfter(vContainer, vCurrent) : this.getFirstWidget(vContainer);
  } else {
    var vNext = vCurrent ? this.getWidgetBefore(vContainer, vCurrent) : this.getLastWidget(vContainer);
  };

  // If there was a widget found, focus it
  if(vNext)
  {
    vNext.setFocused(true);
    vNext._ontabfocus();
  };

  vEvent.stopPropagation();
  vEvent.preventDefault();
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

  var y1 = QxDom.getComputedPageBoxTop(c1.getElement());
  var y2 = QxDom.getComputedPageBoxTop(c2.getElement());

  if(y1 != y2) {
    return y1 - y2;
  };

  // Sort-Check #3: Left-Position
  var x1 = QxDom.getComputedPageBoxLeft(c1.getElement());
  var x2 = QxDom.getComputedPageBoxLeft(c2.getElement());

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
---------------------------------------------------------------------------
  UTILITIES FOR TAB HANDLING
---------------------------------------------------------------------------
*/

proto.getFirstWidget = function(vParentContainer) {
  return this._getFirst(vParentContainer, null);
};

proto.getLastWidget = function(vParentContainer) {
  return this._getLast(vParentContainer, null);
};

proto.getWidgetAfter = function(vParentContainer, vWidget)
{
  if(vParentContainer == vWidget) {
    return this.getFirstWidget(vParentContainer);
  };

  if(vWidget.getAnonymous()) {
    vWidget = vWidget.getParent();
  };

  if(vWidget == null) {
    return [];
  };

  var vAll = [];

  this._getAllAfter(vParentContainer, vWidget, vAll);

  vAll.sort(this.compareTabOrder);

  return vAll.length > 0 ? vAll[0] : this.getFirstWidget(vParentContainer);
};

proto.getWidgetBefore = function(vParentContainer, vWidget)
{
  if(vParentContainer == vWidget) {
    return this.getLastWidget(vParentContainer);
  };

  if(vWidget.getAnonymous()) {
    vWidget = vWidget.getParent();
  };

  if(vWidget == null) {
    return [];
  };

  var vAll = [];

  this._getAllBefore(vParentContainer, vWidget, vAll);

  vAll.sort(this.compareTabOrder);

  var vChildrenLength = vAll.length;
  return vChildrenLength > 0 ? vAll[vChildrenLength-1] : this.getLastWidget(vParentContainer);
};

proto._getAllAfter = function(vParent, vWidget, vArray)
{
  var vChildren = vParent.getChildren();
  var vCurrentChild;
  var vChildrenLength = vChildren.length;

  for (var i = 0; i < vChildrenLength; i++)
  {
    vCurrentChild = vChildren[i];

    if(!(vCurrentChild instanceof QxParent) && !(vCurrentChild instanceof QxTerminator)) {
      continue;
    };

    if(vCurrentChild.isFocusable() && vCurrentChild.getTabIndex() > 0 && this.compareTabOrder(vWidget, vCurrentChild) < 0) {
      vArray.push(vChildren[i]);
    };

    if(!vCurrentChild.isFocusRoot() && vCurrentChild instanceof QxParent) {
      this._getAllAfter(vCurrentChild, vWidget, vArray);
    };
  };
};

proto._getAllBefore = function(vParent, vWidget, vArray)
{
  var vChildren = vParent.getChildren();
  var vCurrentChild;
  var vChildrenLength = vChildren.length;

  for (var i = 0; i < vChildrenLength; i++)
  {
    vCurrentChild = vChildren[i];

    if(!(vCurrentChild instanceof QxParent) && !(vCurrentChild instanceof QxTerminator)) {
      continue;
    };

    if(vCurrentChild.isFocusable() && vCurrentChild.getTabIndex() > 0 && this.compareTabOrder(vWidget, vCurrentChild) > 0) {
      vArray.push(vCurrentChild);
    };

    if(!vCurrentChild.isFocusRoot() && vCurrentChild instanceof QxParent) {
      this._getAllBefore(vCurrentChild, vWidget, vArray);
    };
  };
};

proto._getFirst = function(vParent, vFirstWidget)
{
  var vChildren = vParent.getChildren();
  var vCurrentChild;
  var vChildrenLength = vChildren.length;

  for (var i = 0; i < vChildrenLength; i++)
  {
    vCurrentChild = vChildren[i];

    if(!(vCurrentChild instanceof QxParent) && !(vCurrentChild instanceof QxTerminator)) {
      continue;
    };

    if(vCurrentChild.isFocusable() && vCurrentChild.getTabIndex() > 0)
    {
      if(vFirstWidget == null || this.compareTabOrder(vCurrentChild, vFirstWidget) < 0) {
        vFirstWidget = vCurrentChild;
      };
    };

    if(!vCurrentChild.isFocusRoot() && vCurrentChild instanceof QxParent) {
      vFirstWidget = this._getFirst(vCurrentChild, vFirstWidget);
    };
  };

  return vFirstWidget;
};

proto._getLast = function(vParent, vLastWidget)
{
  var vChildren = vParent.getChildren();
  var vCurrentChild;
  var vChildrenLength = vChildren.length;

  for (var i = 0; i < vChildrenLength; i++)
  {
    vCurrentChild = vChildren[i];

    if(!(vCurrentChild instanceof QxParent) && !(vCurrentChild instanceof QxTerminator)) {
      continue;
    };

    if(vCurrentChild.isFocusable() && vCurrentChild.getTabIndex() > 0)
    {
      if(vLastWidget == null || this.compareTabOrder(vCurrentChild, vLastWidget) > 0) {
        vLastWidget = vCurrentChild;
      };
    };

    if(!vCurrentChild.isFocusRoot() && vCurrentChild instanceof QxParent) {
      vLastWidget = this._getLast(vCurrentChild, vLastWidget);
    };
  };

  return vLastWidget;
};







/*
---------------------------------------------------------------------------
  DISPOSER
---------------------------------------------------------------------------
*/

proto.dispose = function()
{
  if (this.getDisposed()) {
    return;
  };

  this._attachedWidget = null;

  QxObject.prototype.dispose.call(this);
};
