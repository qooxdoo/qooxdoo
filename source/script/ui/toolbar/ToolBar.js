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
#post(qx.ui.toolbar.ToolBarPart)

************************************************************************ */

qx.OO.defineClass("qx.ui.toolbar.ToolBar", qx.ui.layout.HorizontalBoxLayout, 
function()
{
  qx.ui.layout.HorizontalBoxLayout.call(this);

  this.addEventListener(qx.Const.EVENT_TYPE_KEYDOWN, this._onkeydown);
});



/*
---------------------------------------------------------------------------
  PROPERTIES
---------------------------------------------------------------------------
*/

qx.ui.toolbar.ToolBar.addProperty({ name : "openMenu", type : qx.Const.TYPEOF_OBJECT, instance : "qx.ui.menu.Menu" });

/*!
  Appearance of the widget
*/
qx.ui.toolbar.ToolBar.changeProperty({ name : "appearance", type : qx.Const.TYPEOF_STRING, defaultValue : "toolbar" });









/*
---------------------------------------------------------------------------
  UTILITIES
---------------------------------------------------------------------------
*/

qx.Proto.getAllButtons = function()
{
  var vChildren = this.getChildren();
  var vLength = vChildren.length;
  var vDeepChildren = [];
  var vCurrent;

  for (var i=0; i<vLength; i++)
  {
    vCurrent = vChildren[i];

    if (vCurrent instanceof qx.ui.toolbar.ToolBarMenuButton)
    {
      vDeepChildren.push(vCurrent);
    }
    else if (vCurrent instanceof qx.ui.toolbar.ToolBarPart)
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
qx.Proto._onkeydown = function(e)
{
  switch(e.getKeyCode())
  {
    case qx.event.types.KeyEvent.keys.left:
      return this._onkeydown_left(e);

    case qx.event.types.KeyEvent.keys.right:
      return this._onkeydown_right(e);
  };
};

qx.Proto._onkeydown_left = function(e)
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

    if (vCurrent instanceof qx.ui.toolbar.ToolBarMenuButton && vCurrent.getEnabled())
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

      if (vCurrent instanceof qx.ui.toolbar.ToolBarMenuButton && vCurrent.getEnabled())
      {
        vPrevButton = vCurrent;
        break;
      };
    };
  };

  if (vPrevButton)
  {
    // hide other menus
    qx.manager.object.MenuManager.update();

    // show previous menu
    vPrevButton._showMenu(true);
  };
};

qx.Proto._onkeydown_right = function(e)
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

    if (vCurrent instanceof qx.ui.toolbar.ToolBarMenuButton && vCurrent.getEnabled())
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

      if (vCurrent instanceof qx.ui.toolbar.ToolBarMenuButton && vCurrent.getEnabled())
      {
        vNextButton = vCurrent;
        break;
      };
    };
  };

  if (vNextButton)
  {
    // hide other menus
    qx.manager.object.MenuManager.update();

    // show next menu
    vNextButton._showMenu(true);
  };
};







/*
---------------------------------------------------------------------------
  DISPOSER
---------------------------------------------------------------------------
*/

qx.Proto.dispose = function()
{
  if (this.getDisposed()) {
    return;
  };

  this.removeEventListener(qx.Const.EVENT_TYPE_KEYDOWN, this._onkeydown);

  return qx.ui.layout.HorizontalBoxLayout.prototype.dispose.call(this);
};
