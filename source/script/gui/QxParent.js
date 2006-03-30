/* ************************************************************************

   qooxdoo - the new era of web interface development

   Copyright:
     (C) 2004-2006 by Schlund + Partner AG, Germany
         All rights reserved

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

#package(guicore)
#post(QxFocusManager)

************************************************************************ */

function QxParent()
{
  if (this.classname == QxParent.OMIT_CLASS) {
    throw new Error("Please omit the usage of QxParent directly. Choose between any widget which inherits from QxParent and so comes with a layout implementation!");
  };

  QxWidget.call(this);

  // Contains all children
  this._children = [];

  // Create instanceof layout implementation
  this._layoutImpl = this._createLayoutImpl();
};

QxParent.extend(QxWidget, "QxParent");

QxParent.OMIT_CLASS = "QxParent";




/*
---------------------------------------------------------------------------
  PROPERTIES
---------------------------------------------------------------------------
*/

/*!
  Individual focus manager for all child elements.
*/
QxParent.addProperty({ name : "focusManager", type : QxConst.TYPEOF_OBJECT, instance : "QxFocusManager" });

/*!
  The current active child.
*/
QxParent.addProperty({ name : "activeChild", type : QxConst.TYPEOF_OBJECT, instance : "QxWidget" });

/*!
  The current focused child.
*/
QxParent.addProperty({ name : "focusedChild", type : QxConst.TYPEOF_OBJECT, instance : "QxWidget" });





/*
---------------------------------------------------------------------------
  CACHED PRIVATE PROPERTIES
---------------------------------------------------------------------------
*/

QxParent.addCachedProperty({ name : "visibleChildren", defaultValue : null });






/*
---------------------------------------------------------------------------
  FOCUS HANDLING
---------------------------------------------------------------------------
*/

proto.isFocusRoot = function() {
  return this.getFocusManager() != null;
};

proto.getFocusRoot = function()
{
  if (this.isFocusRoot()) {
    return this;
  };

  if(this._hasParent) {
    return this.getParent().getFocusRoot();
  };

  return null;
};

proto.activateFocusRoot = function() {
  this.setFocusManager(new QxFocusManager(this));
};

proto._onfocuskeyevent = function(e) {
  this.getFocusManager()._onkeyevent(this, e);
};

proto._modifyFocusManager = function(propValue, propOldValue, propData)
{
  if (propValue)
  {
    // Add Key Handler
    this.addEventListener(QxConst.EVENT_TYPE_KEYDOWN, this._onfocuskeyevent);
    this.addEventListener(QxConst.EVENT_TYPE_KEYPRESS, this._onfocuskeyevent);

    // Activate focus handling (but keep already configured tabIndex)
    if (this.getTabIndex() < 1) {
      this.setTabIndex(1);
    };

    // But hide the focus outline
    this.setHideFocus(true);

    // Make myself the default
    this.setActiveChild(this);
  }
  else
  {
    // Remove Key Handler
    this.removeEventListener(QxConst.EVENT_TYPE_KEYDOWN, this._onfocuskeyevent);
    this.removeEventListener(QxConst.EVENT_TYPE_KEYPRESS, this._onfocuskeyevent);

    // Deactivate focus handling
    this.setTabIndex(-1);

    // Don't hide focus outline
    this.setHideFocus(false);
  };

  return true;
};

proto._modifyFocusedChild = function(propValue, propOldValue, propData)
{
  // this.debug("FocusedChild: " + propValue);

  var vFocusValid = QxUtil.isValidObject(propValue);
  var vBlurValid = QxUtil.isValidObject(propOldValue);

  if (vFocusValid && typeof QxPopupManager !== QxConst.TYPEOF_UNDEFINED) {
    QxPopupManager.update(propValue);
  };

  if (vBlurValid)
  {
    // Dispatch FocusOut
    if (propOldValue.hasEventListeners(QxConst.EVENT_TYPE_FOCUSOUT))
    {
      var vEventObject = new QxFocusEvent(QxConst.EVENT_TYPE_FOCUSOUT, propOldValue);

      if (vFocusValid) {
        vEventObject.setRelatedTarget(propValue);
      };

      propOldValue.dispatchEvent(vEventObject);
      vEventObject.dispose();
    };
  };

  if (vFocusValid)
  {
    if (propValue.hasEventListeners(QxConst.EVENT_TYPE_FOCUSIN))
    {
      // Dispatch FocusIn
      var vEventObject = new QxFocusEvent(QxConst.EVENT_TYPE_FOCUSIN, propValue);

      if (vBlurValid) {
        vEventObject.setRelatedTarget(propOldValue);
      };

      propValue.dispatchEvent(vEventObject);
      vEventObject.dispose();
    };
  };

  if (vBlurValid)
  {
    if (this.getActiveChild() == propOldValue) {
      this.setActiveChild(null);
    };

    propOldValue.setFocused(false);

    // Dispatch Blur
    var vEventObject = new QxFocusEvent(QxConst.EVENT_TYPE_BLUR, propOldValue);

    if (vFocusValid) {
      vEventObject.setRelatedTarget(propValue);
    };

    propOldValue.dispatchEvent(vEventObject);

    QxToolTipManager.handleBlur(vEventObject);
    vEventObject.dispose();
  };

  if (vFocusValid)
  {
    this.setActiveChild(propValue);
    propValue.setFocused(true);
    propValue.getTopLevelWidget().getEventManager().setFocusRoot(this);

    // Dispatch Focus
    var vEventObject = new QxFocusEvent(QxConst.EVENT_TYPE_FOCUS, propValue);

    if (vBlurValid) {
      vEventObject.setRelatedTarget(propOldValue);
    };

    propValue.dispatchEvent(vEventObject);

    QxToolTipManager.handleFocus(vEventObject);

    vEventObject.dispose();
  };

  // Flush Queues
  // Do we really need this?
  // QxWidget.flushGlobalQueues();

  return true;
};





/*
---------------------------------------------------------------------------
  LAYOUT IMPLEMENTATION
---------------------------------------------------------------------------
*/

proto._layoutImpl = null;

proto._createLayoutImpl = function() {
  return null;
};

proto.getLayoutImpl = function() {
  return this._layoutImpl;
};







/*
---------------------------------------------------------------------------
  CHILDREN MANAGMENT: MANAGE ALL
---------------------------------------------------------------------------
*/

/*!
  Return the array of all children
*/
proto.getChildren = function() {
  return this._children;
};

/*!
  Get children count
*/
proto.getChildrenLength = function() {
  return this.getChildren().length;
};

/*!
  Check if the widget has a children
*/
proto.hasChildren = function() {
  return this.getChildrenLength() > 0;
};

/*!
  Check if there are any childrens inside
*/
proto.isEmpty = function() {
  return this.getChildrenLength() == 0;
};

/*!
  Get the position of a children.
*/
proto.indexOf = function(vChild) {
  return this.getChildren().indexOf(vChild);
};

/*!
Check if the given QxWidget is a children.

#param des[QxWidget]: The widget which should be checked.
*/
proto.contains = function(vWidget)
{
  switch(vWidget)
  {
    case null:
      return false;

    case this:
      return true;

    default:
      // try the next parent of the widget (recursive until found)
      return this.contains(vWidget.getParent());
  };
};






/*
---------------------------------------------------------------------------
  CHILDREN MANAGMENT: MANAGE VISIBLE ONES

  uses a cached private property
---------------------------------------------------------------------------
*/

/*!
  Return the array of all visible children
  (which are configured as visible=true)
*/
proto._computeVisibleChildren = function()
{
  var vVisible = [];
  var vChildren = this.getChildren();
  var vLength = vChildren.length;

  for (var i=0; i<vLength; i++)
  {
    var vChild = vChildren[i];
    if (vChild._isDisplayable) {
      vVisible.push(vChild);
    };
  };

  return vVisible;
};

/*!
  Get length of visible children
*/
proto.getVisibleChildrenLength = function() {
  return this.getVisibleChildren().length;
};

/*!
  Check if the widget has any visible children
*/
proto.hasVisibleChildren = function() {
  return this.getVisibleChildrenLength() > 0;
};

/*!
  Check if there are any visible childrens inside
*/
proto.isVisibleEmpty = function() {
  return this.getVisibleChildrenLength() == 0;
};






/*
---------------------------------------------------------------------------
  CHILDREN MANAGMENT: ADD
---------------------------------------------------------------------------
*/

/*!
  Add/Append another widget. Allows to add multiple at
  one, a parameter could be a widget.
*/
proto.add = function()
{
  var vWidget;

  for (var i=0, l=arguments.length; i<l; i++)
  {
    vWidget = arguments[i];

    if (!(vWidget instanceof QxParent) && !(vWidget instanceof QxTerminator))
    {
      throw new Error("Invalid Widget: " + vWidget);
    }
    else
    {
      vWidget.setParent(this);
    };
  };

  return this;
};

proto.addAt = function(vChild, vIndex)
{
  if (QxUtil.isInvalidNumber(vIndex) || vIndex == -1) {
    throw new Error("Not a valid index for addAt(): " + vIndex);
  };

  if (vChild.getParent() == this)
  {
    var vChildren = this.getChildren();
    var vOldIndex = vChildren.indexOf(vChild);

    if (vOldIndex != vIndex)
    {
      if (vOldIndex != -1) {
        vChildren.removeAt(vOldIndex);
      };

      vChildren.insertAt(vChild, vIndex);

      if (this._initialLayoutDone)
      {
        this._invalidateVisibleChildren();
        this.getLayoutImpl().updateChildrenOnMoveChild(vChild, vIndex, vOldIndex);
      };
    };
  }
  else
  {
    vChild._insertIndex = vIndex;
    vChild.setParent(this);
  };
};

proto.addAtBegin = function(vChild) {
  return this.addAt(vChild, 0);
};

proto.addAtEnd = function(vChild)
{
  // we need to fix here, when the child is already inside myself, but
  // want to change its position
  var vLength = this.getChildrenLength();
  return this.addAt(vChild, vChild.getParent() == this ? vLength - 1 : vLength);
};

/*!
  Add a widget before another already inserted child
*/
proto.addBefore = function(vChild, vBefore)
{
  var vChildren = this.getChildren();
  var vTargetIndex = vChildren.indexOf(vBefore);

  if (vTargetIndex == -1) {
    throw new Error("Child to add before: " + vBefore + " is not inside this parent.");
  };

  var vSourceIndex = vChildren.indexOf(vChild);

  if (vSourceIndex == -1 || vSourceIndex > vTargetIndex) {
    vTargetIndex++;
  };

  return this.addAt(vChild, Math.max(0, vTargetIndex-1));
};

/*!
  Add a widget after another already inserted child
*/
proto.addAfter = function(vChild, vAfter)
{
  var vChildren = this.getChildren();
  var vTargetIndex = vChildren.indexOf(vAfter);

  if (vTargetIndex == -1) {
    throw new Error("Child to add after: " + vAfter + " is not inside this parent.");
  };

  var vSourceIndex = vChildren.indexOf(vChild);

  if (vSourceIndex != -1 && vSourceIndex < vTargetIndex) {
    vTargetIndex--;
  };

  return this.addAt(vChild, Math.min(vChildren.length, vTargetIndex+1));
};







/*
---------------------------------------------------------------------------
  CHILDREN MANAGMENT: REMOVE
---------------------------------------------------------------------------
*/

/*!
  Remove one or multiple childrens.
*/
proto.remove = function()
{
  var vWidget;

  for (var i=0, l=arguments.length; i<l; i++)
  {
    vWidget = arguments[i];

    if (!(vWidget instanceof QxParent) && !(vWidget instanceof QxTerminator))
    {
      throw new Error("Invalid Widget: " + vWidget);
    }
    else if (vWidget.getParent() == this)
    {
      vWidget.setParent(null);
    };
  };
};

proto.removeAt = function(vIndex)
{
  var vChild = this.getChildren()[vIndex];

  if (vChild)
  {
    delete o._insertIndex;

    vChild.setParent(null);
  };
};

/*!
  Remove all childrens.
*/
proto.removeAll = function()
{
  var cs = this.getChildren();
  var co = cs[0];

  while (co)
  {
    this.remove(co);
    co = cs[0];
  };
};






/*
---------------------------------------------------------------------------
  CHILDREN MANAGMENT: FIRST CHILD
---------------------------------------------------------------------------
*/

proto.getFirstChild = function() {
  return this.getChildren().getFirst();
};

proto.getFirstVisibleChild = function() {
  return this.getVisibleChildren().getFirst();
};

proto.getFirstActiveChild = function(vIgnoreClasses) {
  return QxWidget.getActiveSiblingHelper(null, this, 1, vIgnoreClasses, "first");
};






/*
---------------------------------------------------------------------------
  CHILDREN MANAGMENT: LAST CHILD
---------------------------------------------------------------------------
*/

proto.getLastChild = function() {
  return this.getChildren().getLast();
};

proto.getLastActiveChild = function(vIgnoreClasses) {
  return QxWidget.getActiveSiblingHelper(null, this, -1, vIgnoreClasses, "last");
};

proto.getLastVisibleChild = function() {
  return this.getVisibleChildren().getLast();
};






/*
---------------------------------------------------------------------------
  CHILDREN MANAGMENT: LOOP UTILS
---------------------------------------------------------------------------
*/

proto.forEachChild = function(vFunc)
{
  var ch=this.getChildren(), chc, i=-1;
  while(chc=ch[++i]) {
    vFunc.call(chc, i);
  };
};

proto.forEachVisibleChild = function(vFunc)
{
  var ch=this.getVisibleChildren(), chc, i=-1;
  while(chc=ch[++i]) {
    vFunc.call(chc, i);
  };
};






/*
---------------------------------------------------------------------------
  APPEAR/DISAPPEAR MESSAGES FOR CHILDREN
---------------------------------------------------------------------------
*/

proto._beforeAppear = function()
{
  QxWidget.prototype._beforeAppear.call(this);

  this.forEachVisibleChild(function() {
    if (this.isAppearRelevant()) {
      this._beforeAppear();
    };
  });
};

proto._afterAppear = function()
{
  QxWidget.prototype._afterAppear.call(this);

  this.forEachVisibleChild(function() {
    if (this.isAppearRelevant()) {
      this._afterAppear();
    };
  });
};

proto._beforeDisappear = function()
{
  QxWidget.prototype._beforeDisappear.call(this);

  this.forEachVisibleChild(function() {
    if (this.isAppearRelevant()) {
      this._beforeDisappear();
    };
  });
};

proto._afterDisappear = function()
{
  QxWidget.prototype._afterDisappear.call(this);

  this.forEachVisibleChild(function() {
    if (this.isAppearRelevant()) {
      this._afterDisappear();
    };
  });
};







/*
---------------------------------------------------------------------------
  INSERTDOM/REMOVEDOM MESSAGES FOR CHILDREN
---------------------------------------------------------------------------
*/

proto._beforeInsertDom = function()
{
  QxWidget.prototype._beforeInsertDom.call(this);

  this.forEachVisibleChild(function() {
    if (this.isAppearRelevant()) {
      this._beforeInsertDom();
    };
  });
};

proto._afterInsertDom = function()
{
  QxWidget.prototype._afterInsertDom.call(this);

  this.forEachVisibleChild(function() {
    if (this.isAppearRelevant()) {
      this._afterInsertDom();
    };
  });
};

proto._beforeRemoveDom = function()
{
  QxWidget.prototype._beforeRemoveDom.call(this);

  this.forEachVisibleChild(function() {
    if (this.isAppearRelevant()) {
      this._beforeRemoveDom();
    };
  });
};

proto._afterRemoveDom = function()
{
  QxWidget.prototype._afterRemoveDom.call(this);

  this.forEachVisibleChild(function() {
    if (this.isAppearRelevant()) {
      this._afterRemoveDom();
    };
  });
};







/*
---------------------------------------------------------------------------
  DISPLAYBLE HANDLING
---------------------------------------------------------------------------
*/

proto._handleDisplayableCustom = function(vDisplayable, vParent, vHint)
{
  this.forEachChild(function() {
    this._handleDisplayable();
  });
};







/*
---------------------------------------------------------------------------
  STATE QUEUE
---------------------------------------------------------------------------
*/

proto._addChildrenToStateQueue = function()
{
  this.forEachVisibleChild(function() {
    this.addToStateQueue();
  });
};

proto.recursiveAddToStateQueue = function()
{
  this.addToStateQueue();

  this.forEachVisibleChild(function() {
    this.recursiveAddToStateQueue();
  });
};

proto._recursiveAppearanceThemeUpdate = function(vNewAppearanceTheme, vOldAppearanceTheme)
{
  QxWidget.prototype._recursiveAppearanceThemeUpdate.call(this, vNewAppearanceTheme, vOldAppearanceTheme);

  this.forEachVisibleChild(function() {
    this._recursiveAppearanceThemeUpdate(vNewAppearanceTheme, vOldAppearanceTheme);
  });
};






/*
---------------------------------------------------------------------------
  CHILDREN QUEUE
---------------------------------------------------------------------------
*/

proto._addChildToChildrenQueue = function(vChild)
{
  if (!vChild._isInParentChildrenQueue && !vChild._isDisplayable) {
    this.warn("Ignoring invisible child: " + vChild);
  };

  if (!vChild._isInParentChildrenQueue && vChild._isDisplayable)
  {
    QxWidget.addToGlobalLayoutQueue(this);

    if (!this._childrenQueue) {
      this._childrenQueue = {};
    };

    this._childrenQueue[vChild.toHashCode()] = vChild;
  };
};

proto._removeChildFromChildrenQueue = function(vChild)
{
  if (this._childrenQueue && vChild._isInParentChildrenQueue)
  {
    delete this._childrenQueue[vChild.toHashCode()];

    if (QxUtil.isObjectEmpty(this._childrenQueue)) {
      QxWidget.removeFromGlobalLayoutQueue(this);
    };
  };
};

proto._flushChildrenQueue = function()
{
  if (!QxUtil.isObjectEmpty(this._childrenQueue))
  {
    this.getLayoutImpl().flushChildrenQueue(this._childrenQueue);
    delete this._childrenQueue;
  };
};







/*
---------------------------------------------------------------------------
  LAYOUT QUEUE
---------------------------------------------------------------------------
*/

proto._addChildrenToLayoutQueue = function(p)
{
  this.forEachChild(function() {
    this.addToLayoutChanges(p);
  });
};

proto._layoutChild = function(vChild)
{
  if (!vChild._isDisplayable)
  {
    this.warn("Want to render an invisible child: " + vChild + " -> omitting!");
    return;
  };

  // APPLY LAYOUT
  var vChanges = vChild._layoutChanges;

  // this.debug("Layouting " + vChild + ": " + QxUtil.convertObjectKeysToString(vChanges));

  try
  {
    if (vChanges.borderX) {
      this._applyBorderX(vChild, vChanges);
    };

    if (vChanges.borderY) {
      this._applyBorderY(vChild, vChanges);
    };
  }
  catch(ex)
  {
    this.error("Could not apply border to child " + vChild + ": " + ex, "_layoutChild");
  };

  try
  {
    if (vChanges.paddingLeft || vChanges.paddingRight) {
      vChild._applyPaddingX(this, vChanges);
    };

    if (vChanges.paddingTop || vChanges.paddingBottom) {
      vChild._applyPaddingY(this, vChanges);
    };
  }
  catch(ex)
  {
    this.error("Could not apply padding to child " + vChild + ": " + ex, "_layoutChild");
  };


  // WRAP TO LAYOUT ENGINE
  try
  {
    this.getLayoutImpl().layoutChild(vChild, vChanges);
  }
  catch(ex)
  {
    this.error("Could not layout child " + vChild + " through layout handler: " + ex, "_layoutChild");
  };


  // POST LAYOUT
  try
  {
    vChild._layoutPost(vChanges);
  }
  catch(ex)
  {
    this.error("Could not post layout child " + vChild + ": " + ex, "_layoutChild");
  };


  // DISPLAY DOM NODE
  try
  {
    // insert dom node (if initial flag enabled)
    if (vChanges.initial)
    {
      vChild._initialLayoutDone = true;
      QxWidget.addToGlobalDisplayQueue(vChild);
    };
  }
  catch(ex)
  {
    this.error("Could not handle display updates from layout flush for child " + vChild + ": " + ex, "_layoutChild");
  };


  // CLEANUP
  vChild._layoutChanges = {};

  delete vChild._isInParentLayoutQueue;
  delete this._childrenQueue[vChild.toHashCode()];
};

proto._layoutPost = QxUtil.returnTrue;

/*!
  Fix Operas Rendering Bugs
*/
if (QxClient.isOpera())
{
  proto._layoutChildOrig = proto._layoutChild;

  proto._layoutChild = function(vChild)
  {
    if (!vChild._initialLayoutDone || !vChild._layoutChanges.borderX || !vChild._layoutChanges.borderY) {
      return this._layoutChildOrig(vChild);
    };

    var vStyle = vChild.getElement().style;

    var vOldDisplay = vStyle.display;
    vStyle.display = QxConst.CORE_NONE;
    var vRet = this._layoutChildOrig(vChild);
    vStyle.display = vOldDisplay;

    return vRet;
  };
};






/*
---------------------------------------------------------------------------
  DIMENSION CACHE
---------------------------------------------------------------------------
*/

proto._computePreferredInnerWidth = function() {
  return this.getLayoutImpl().computeChildrenNeededWidth();
};

proto._computePreferredInnerHeight = function() {
  return this.getLayoutImpl().computeChildrenNeededHeight();
};

proto._changeInnerWidth = function(vNew, vOld)
{
  var vLayout = this.getLayoutImpl();

  if (vLayout.invalidateChildrenFlexWidth) {
    vLayout.invalidateChildrenFlexWidth();
  };

  this.forEachVisibleChild(function()
  {
    if (vLayout.updateChildOnInnerWidthChange(this) && this._recomputeBoxWidth())
    {
      this._recomputeOuterWidth();
      this._recomputeInnerWidth();
    };
  });
};

proto._changeInnerHeight = function(vNew, vOld)
{
  var vLayout = this.getLayoutImpl();

  if (vLayout.invalidateChildrenFlexHeight) {
    vLayout.invalidateChildrenFlexHeight();
  };

  this.forEachVisibleChild(function()
  {
    if (vLayout.updateChildOnInnerHeightChange(this) && this._recomputeBoxHeight())
    {
      this._recomputeOuterHeight();
      this._recomputeInnerHeight();
    };
  });
};

proto.getInnerWidthForChild = function(vChild) {
  return this.getInnerWidth();
};

proto.getInnerHeightForChild = function(vChild) {
  return this.getInnerHeight();
};







/*
---------------------------------------------------------------------------
  WIDGET FROM POINT SUPPORT
---------------------------------------------------------------------------
*/

proto.getWidgetFromPointHelper = function(x, y)
{
  var ch = this.getChildren();

  for (var chl=ch.length, i=0; i<chl; i++) {
    if (QxDom.getElementAbsolutePointChecker(ch[i].getElement(), x, y)) {
      return ch[i].getWidgetFromPointHelper(x, y);
    };
  };

  return this;
};







/*
---------------------------------------------------------------------------
  CLONE
---------------------------------------------------------------------------
*/

proto._cloneRecursive = function(cloneInstance)
{
  var ch = this.getChildren();
  var chl = ch.length;
  var cloneChild;

  for (var i=0; i<chl; i++)
  {
    cloneChild = ch[i].clone(true);
    cloneInstance.add(cloneChild);
  };
};





/*
---------------------------------------------------------------------------
  REMAPPING
---------------------------------------------------------------------------
*/

proto._remappingChildTable = [ "add", "remove", "addAt", "addAtBegin", "addAtEnd", "removeAt", "addBefore", "addAfter", "removeAll" ];
proto._remapStart = "return this._remappingChildTarget.";
proto._remapStop = ".apply(this._remappingChildTarget, arguments)";

proto.remapChildrenHandlingTo = function(vTarget)
{
  var t = this._remappingChildTable;

  this._remappingChildTarget = vTarget;

  for (var i=0, l=t.length, s; i<l; i++) {
    s = t[i]; this[s] = new Function(QxParent.prototype._remapStart + s + QxParent.prototype._remapStop);
  };
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

  if (this._layoutImpl)
  {
    this._layoutImpl.dispose();
    this._layoutImpl = null;
  };

  for (var i in this._childrenQueue) {
    delete this._childrenQueue[i];
  };

  this._childrenQueue = null;
  this._remappingChildTable = null;
  this._remappingChildTarget = null;

  if (this._children)
  {
    var chl = this._children.length;

    for (var i=chl-1; i>=0; i--)
    {
      this._children[i].dispose();
      this._children[i] = null;
    };

    this._children = null;
  };

  delete this._cachedVisibleChildren;

  // Remove Key Handler
  if (this.getFocusManager())
  {
    this.removeEventListener(QxConst.EVENT_TYPE_KEYDOWN, this._onfocuskeyevent);
    this.removeEventListener(QxConst.EVENT_TYPE_KEYPRESS, this._onfocuskeyevent);

    this.forceFocusManager(null);
  };

  return QxWidget.prototype.dispose.call(this);
};
