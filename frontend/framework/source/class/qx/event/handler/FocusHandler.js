/* ************************************************************************

   qooxdoo - the new era of web development

   http://qooxdoo.org

   Copyright:
     2004-2006 by 1&1 Internet AG, Germany, http://www.1and1.org

   License:
     LGPL 2.1: http://www.gnu.org/licenses/lgpl.html

   Authors:
     * Sebastian Werner (wpbasti)
     * Andreas Ecker (ecker)

************************************************************************ */

/* ************************************************************************

#module(eventcore)
#use(qx.dom.DomLocation)
#use(qx.event.type.FocusEvent)
#use(qx.manager.object.PopupManager)
#use(qx.manager.object.ToolTipManager)

************************************************************************ */

/*!
  This object gets an instance in vAll qx.client.ClientWindows and manage the focus handling for it.
*/
qx.OO.defineClass("qx.event.handler.FocusHandler", qx.core.Target,
function(vWidget)
{
  qx.core.Target.call(this);

  if (qx.util.Validation.isValidObject(vWidget)) {
    this._attachedWidget = vWidget;
  }
});

qx.event.handler.FocusHandler.mouseFocus = false;




/*
---------------------------------------------------------------------------
  UTILITIES
---------------------------------------------------------------------------
*/

qx.Proto.getAttachedWidget = function() {
  return this._attachedWidget;
}






/*
---------------------------------------------------------------------------
  TAB-EVENT HANDLING
---------------------------------------------------------------------------
*/

// Check for TAB pressed
// * use keydown on mshtml
// * use keypress on vAll other (correct) browsers
// = same behaviour
qx.event.handler.FocusHandler.tabEventType = qx.sys.Client.isMshtml() ? qx.constant.Event.KEYDOWN : qx.constant.Event.KEYPRESS;

qx.Proto._onkeyevent = function(vContainer, vEvent)
{
  if (vEvent.getKeyCode() != qx.event.type.KeyEvent.keys.tab || vEvent.getType() != qx.event.handler.FocusHandler.tabEventType) {
    return;
  }

  qx.event.handler.FocusHandler.mouseFocus = false;

  var vCurrent = this.getAttachedWidget().getFocusedChild();

  // Support shift key to reverse widget detection order
  if(!vEvent.getShiftKey()) {
    var vNext = vCurrent ? this.getWidgetAfter(vContainer, vCurrent) : this.getFirstWidget(vContainer);
  } else {
    var vNext = vCurrent ? this.getWidgetBefore(vContainer, vCurrent) : this.getLastWidget(vContainer);
  }

  // If there was a widget found, focus it
  if(vNext)
  {
    vNext.setFocused(true);
    vNext._ontabfocus();
  }

  vEvent.stopPropagation();
  vEvent.preventDefault();
}

qx.Proto.compareTabOrder = function(c1, c2)
{
  // Sort-Check #1: Tab-Index
  if(c1 == c2) {
    return 0;
  }

  var t1 = c1.getTabIndex();
  var t2 = c2.getTabIndex();

  // The following are some ideas to handle focus after tabindex.

  // Sort-Check #2: Top-Position
  if(t1 != t2) {
    return t1 - t2;
  }

  var y1 = qx.dom.DomLocation.getPageBoxTop(c1.getElement());
  var y2 = qx.dom.DomLocation.getPageBoxTop(c2.getElement());

  if(y1 != y2) {
    return y1 - y2;
  }

  // Sort-Check #3: Left-Position
  var x1 = qx.dom.DomLocation.getPageBoxLeft(c1.getElement());
  var x2 = qx.dom.DomLocation.getPageBoxLeft(c2.getElement());

  if(x1 != x2) {
    return x1 - x2;
  }

  // Sort-Check #4: zIndex
  var z1 = c1.getZIndex();
  var z2 = c2.getZIndex();

  if(z1 != z2) {
    return z1 - z2;
  }

  return 0;
}






/*
---------------------------------------------------------------------------
  UTILITIES FOR TAB HANDLING
---------------------------------------------------------------------------
*/

qx.Proto.getFirstWidget = function(vParentContainer) {
  return this._getFirst(vParentContainer, null);
}

qx.Proto.getLastWidget = function(vParentContainer) {
  return this._getLast(vParentContainer, null);
}

qx.Proto.getWidgetAfter = function(vParentContainer, vWidget)
{
  if(vParentContainer == vWidget) {
    return this.getFirstWidget(vParentContainer);
  }

  if(vWidget.getAnonymous()) {
    vWidget = vWidget.getParent();
  }

  if(vWidget == null) {
    return [];
  }

  var vAll = [];

  this._getAllAfter(vParentContainer, vWidget, vAll);

  vAll.sort(this.compareTabOrder);

  return vAll.length > 0 ? vAll[0] : this.getFirstWidget(vParentContainer);
}

qx.Proto.getWidgetBefore = function(vParentContainer, vWidget)
{
  if(vParentContainer == vWidget) {
    return this.getLastWidget(vParentContainer);
  }

  if(vWidget.getAnonymous()) {
    vWidget = vWidget.getParent();
  }

  if(vWidget == null) {
    return [];
  }

  var vAll = [];

  this._getAllBefore(vParentContainer, vWidget, vAll);

  vAll.sort(this.compareTabOrder);

  var vChildrenLength = vAll.length;
  return vChildrenLength > 0 ? vAll[vChildrenLength-1] : this.getLastWidget(vParentContainer);
}

qx.Proto._getAllAfter = function(vParent, vWidget, vArray)
{
  var vChildren = vParent.getChildren();
  var vCurrentChild;
  var vChildrenLength = vChildren.length;

  for (var i = 0; i < vChildrenLength; i++)
  {
    vCurrentChild = vChildren[i];

    if(!(vCurrentChild instanceof qx.ui.core.Parent) && !(vCurrentChild instanceof qx.ui.basic.Terminator)) {
      continue;
    }

    if(vCurrentChild.isFocusable() && vCurrentChild.getTabIndex() > 0 && this.compareTabOrder(vWidget, vCurrentChild) < 0) {
      vArray.push(vChildren[i]);
    }

    if(!vCurrentChild.isFocusRoot() && vCurrentChild instanceof qx.ui.core.Parent) {
      this._getAllAfter(vCurrentChild, vWidget, vArray);
    }
  }
}

qx.Proto._getAllBefore = function(vParent, vWidget, vArray)
{
  var vChildren = vParent.getChildren();
  var vCurrentChild;
  var vChildrenLength = vChildren.length;

  for (var i = 0; i < vChildrenLength; i++)
  {
    vCurrentChild = vChildren[i];

    if(!(vCurrentChild instanceof qx.ui.core.Parent) && !(vCurrentChild instanceof qx.ui.basic.Terminator)) {
      continue;
    }

    if(vCurrentChild.isFocusable() && vCurrentChild.getTabIndex() > 0 && this.compareTabOrder(vWidget, vCurrentChild) > 0) {
      vArray.push(vCurrentChild);
    }

    if(!vCurrentChild.isFocusRoot() && vCurrentChild instanceof qx.ui.core.Parent) {
      this._getAllBefore(vCurrentChild, vWidget, vArray);
    }
  }
}

qx.Proto._getFirst = function(vParent, vFirstWidget)
{
  var vChildren = vParent.getChildren();
  var vCurrentChild;
  var vChildrenLength = vChildren.length;

  for (var i = 0; i < vChildrenLength; i++)
  {
    vCurrentChild = vChildren[i];

    if(!(vCurrentChild instanceof qx.ui.core.Parent) && !(vCurrentChild instanceof qx.ui.basic.Terminator)) {
      continue;
    }

    if(vCurrentChild.isFocusable() && vCurrentChild.getTabIndex() > 0)
    {
      if(vFirstWidget == null || this.compareTabOrder(vCurrentChild, vFirstWidget) < 0) {
        vFirstWidget = vCurrentChild;
      }
    }

    if(!vCurrentChild.isFocusRoot() && vCurrentChild instanceof qx.ui.core.Parent) {
      vFirstWidget = this._getFirst(vCurrentChild, vFirstWidget);
    }
  }

  return vFirstWidget;
}

qx.Proto._getLast = function(vParent, vLastWidget)
{
  var vChildren = vParent.getChildren();
  var vCurrentChild;
  var vChildrenLength = vChildren.length;

  for (var i = 0; i < vChildrenLength; i++)
  {
    vCurrentChild = vChildren[i];

    if(!(vCurrentChild instanceof qx.ui.core.Parent) && !(vCurrentChild instanceof qx.ui.basic.Terminator)) {
      continue;
    }

    if(vCurrentChild.isFocusable() && vCurrentChild.getTabIndex() > 0)
    {
      if(vLastWidget == null || this.compareTabOrder(vCurrentChild, vLastWidget) > 0) {
        vLastWidget = vCurrentChild;
      }
    }

    if(!vCurrentChild.isFocusRoot() && vCurrentChild instanceof qx.ui.core.Parent) {
      vLastWidget = this._getLast(vCurrentChild, vLastWidget);
    }
  }

  return vLastWidget;
}







/*
---------------------------------------------------------------------------
  DISPOSER
---------------------------------------------------------------------------
*/

qx.Proto.dispose = function()
{
  if (this.getDisposed()) {
    return;
  }

  this._attachedWidget = null;

  qx.core.Target.prototype.dispose.call(this);
}
