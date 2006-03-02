/* ****************************************************************************

   qooxdoo - the new era of web interface development

   Version:
     $Id$

   Copyright:
     (C) 2004-2005 by Schlund + Partner AG, Germany
         All rights reserved

   License:
     LGPL 2.1: http://creativecommons.org/licenses/LGPL/2.1/

   Internet:
     * http://qooxdoo.oss.schlund.de

   Authors:
     * Kent Olsson (kols)
       <kent dot olsson at chello dot se>

**************************************************************************** */

/* ****************************************************************************

#package(window)

**************************************************************************** */

function QxDialog(vCaption, vIcon)
{
  QxWindow.call(this, vCaption, vIcon);

  this.setAppearance("dialog");
};

QxDialog.extend(QxWindow, "QxDialog");


/*
---------------------------------------------------------------------------
  PROPERTIES
---------------------------------------------------------------------------
*/

/*!
  Should be window be modal (this disable minimize and maximize buttons)
*/
QxDialog.addProperty({ name : "modal", type : QxConst.TYPEOF_BOOLEAN, defaultValue : false });

/*
---------------------------------------------------------------------------
  MODIFIERS
---------------------------------------------------------------------------
*/

proto._modifyModal = function(propValue, propOldValue, propData)
{
  // Inform blocker
  if (this._initialLayoutDone && this.getVisibility() && this.getDisplay())
  {
    var vTop = this.getTopLevelWidget();
    propValue ? vTop.block(this) : vTop.release(this);
  };

  // Disallow minimize and close for modal dialogs
  this._closeButtonManager();
  this._minimizeButtonManager();

  return true;
};

proto._minimizeButtonManager = function()
{
  this._minimizeButton.setEnabled(this.getAllowMinimize() && !this.getModal());

  return true;
};

proto._closeButtonManager = function()
{
  this._closeButton.setEnabled(this.getAllowClose() && !this.getModal());

  return true;
};


/*
------------------------------------------------------------------------------------
  DISPOSER
------------------------------------------------------------------------------------
*/

proto.dispose = function()
{
  if (this.getDisposed()) {
    return true;
  };

  return QxWindow.prototype.dispose.call(this);
};
