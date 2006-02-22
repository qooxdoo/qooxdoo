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

#package(toolbar)
#post(QxToolBarPart)

************************************************************************ */

function QxToolBar()
{
  QxHorizontalBoxLayout.call(this);

  this.addEventListener(QxConst.EVENT_TYPE_KEYDOWN, this._onkeydown);
};

QxToolBar.extend(QxHorizontalBoxLayout, "QxToolBar");



/*
---------------------------------------------------------------------------
  PROPERTIES
---------------------------------------------------------------------------
*/

QxToolBar.addProperty({ name : "openMenu", type : QxConst.TYPEOF_OBJECT, instance : "QxMenu" });

/*!
  Appearance of the widget
*/
QxToolBar.changeProperty({ name : "appearance", type : QxConst.TYPEOF_STRING, defaultValue : "toolbar" });









/*
---------------------------------------------------------------------------
  UTILITIES
---------------------------------------------------------------------------
*/

proto.getAllButtons = function()
{
  var vChildren = this.getChildren();
  var vLength = vChildren.length;
  var vDeepChildren = [];
  var vCurrent;

  for (var i=0; i<vLength; i++)
  {
    vCurrent = vChildren[i];

    if (vCurrent instanceof QxToolBarMenuButton)
    {
      vDeepChildren.push(vCurrent);
    }
    else if (vCurrent instanceof QxToolBarPart)
    {
      vDeepChildren = vDeepChildren.concat(vCurrent.getChildren());
    };
  };

  return vDeepChildren;
};







/*
---------------------------------------------------------------------------
  EVENTS
---------------------------------------------------------------------------
*/

/*!
  Wraps key events to target functions
*/
proto._onkeydown = function(e)
{
  switch(e.getKeyCode())
  {
    case QxKeyEvent.keys.left:
      return this._onkeydown_left(e);

    case QxKeyEvent.keys.right:
      return this._onkeydown_right(e);
  };
};

proto._onkeydown_left = function(e)
{
  var vMenu = this.getOpenMenu();
  if (!vMenu) {
    return;
  };

  var vOpener = vMenu.getOpener();
  if (!vOpener) {
    return;
  };

  var vChildren = this.getAllButtons();
  var vChildrenLength = vChildren.length;
  var vIndex = vChildren.indexOf(vOpener);
  var vCurrent;
  var vPrevButton = null;

  for (var i=vIndex-1; i>=0; i--)
  {
    vCurrent = vChildren[i];

    if (vCurrent instanceof QxToolBarMenuButton && vCurrent.getEnabled())
    {
      vPrevButton = vCurrent;
      break;
    };
  };

  // If none found, try again from the begin (looping)
  if (!vPrevButton)
  {
    for (var i=vChildrenLength-1; i>vIndex; i--)
    {
      vCurrent = vChildren[i];

      if (vCurrent instanceof QxToolBarMenuButton && vCurrent.getEnabled())
      {
        vPrevButton = vCurrent;
        break;
      };
    };
  };

  if (vPrevButton)
  {
    // hide other menus
    QxMenuManager.update();

    // show previous menu
    vPrevButton._showMenu(true);
  };
};

proto._onkeydown_right = function(e)
{
  var vMenu = this.getOpenMenu();
  if (!vMenu) {
    return;
  };

  var vOpener = vMenu.getOpener();
  if (!vOpener) {
    return;
  };

  var vChildren = this.getAllButtons();
  var vChildrenLength = vChildren.length;
  var vIndex = vChildren.indexOf(vOpener);
  var vCurrent;
  var vNextButton = null;

  for (var i=vIndex+1; i<vChildrenLength; i++)
  {
    vCurrent = vChildren[i];

    if (vCurrent instanceof QxToolBarMenuButton && vCurrent.getEnabled())
    {
      vNextButton = vCurrent;
      break;
    };
  };

  // If none found, try again from the begin (looping)
  if (!vNextButton)
  {
    for (var i=0; i<vIndex; i++)
    {
      vCurrent = vChildren[i];

      if (vCurrent instanceof QxToolBarMenuButton && vCurrent.getEnabled())
      {
        vNextButton = vCurrent;
        break;
      };
    };
  };

  if (vNextButton)
  {
    // hide other menus
    QxMenuManager.update();

    // show next menu
    vNextButton._showMenu(true);
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

  this.removeEventListener(QxConst.EVENT_TYPE_KEYDOWN, this._onkeydown);

  return QxHorizontalBoxLayout.prototype.dispose.call(this);
};
