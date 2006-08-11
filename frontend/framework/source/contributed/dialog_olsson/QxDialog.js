/* ****************************************************************************

   qooxdoo - the new era of web development

   Version:
     $Id$

   Copyright:
     (C) 2004-2005 by Schlund + Partner AG, Germany
         All rights reserved

   License:
     LGPL 2.1: http://creativecommons.org/licenses/LGPL/2.1/

   Internet:
     * http://qooxdoo.org

   Authors:
     * Kent Olsson (kols)
       <kent dot olsson at chello dot se>

**************************************************************************** */

/* ****************************************************************************

#module(window)

**************************************************************************** */

function QxDialog(vCaption, vIcon)
{
  qx.ui.window.Window.call(this, vCaption, vIcon);
});


/*
---------------------------------------------------------------------------
  PROPERTIES
---------------------------------------------------------------------------
*/


/*!
  Appearance setting for the class.
*/
qx.OO.changeProperty({ name : "appearance", type : qx.constant.Type.STRING, defaultValue : "dialog" });

/*!
  Should be window be modal (this disable minimize and maximize buttons)
*/
qx.OO.addProperty({ name : "modal", type : qx.constant.Type.BOOLEAN, defaultValue : false });

/*
---------------------------------------------------------------------------
  MODIFIERS
---------------------------------------------------------------------------
*/

qx.Proto._modifyModal = function(propValue, propOldValue, propData)
{
  // Inform blocker
  if (this._initialLayoutDone && this.getVisibility() && this.getDisplay())
  {
    var vTop = this.getTopLevelWidget();
    propValue ? vTop.block(this) : vTop.release(this);
  }

  // Disallow minimize and close for modal dialogs
  this._closeButtonManager();
  this._minimizeButtonManager();

  return true;
}

qx.Proto._minimizeButtonManager = function()
{
  this._minimizeButton.setEnabled(this.getAllowMinimize() && !this.getModal());

  return true;
}

qx.Proto._closeButtonManager = function()
{
  this._closeButton.setEnabled(this.getAllowClose() && !this.getModal());

  return true;
}


/*
------------------------------------------------------------------------------------
  DISPOSER
------------------------------------------------------------------------------------
*/

qx.Proto.dispose = function()
{
  if (this.getDisposed()) {
    return true;
  }

  return qx.ui.window.Window.prototype.dispose.call(this);
}
