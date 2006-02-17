/* ****************************************************************************

   qooxdoo - the new era of web interface development

   Copyright:
     (C) 2004-2006 by Schlund + Partner AG, Germany
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

function QxFrame(vCaption, vIcon)
{
  QxWindow.call(this, vCaption, vIcon);
};

QxFrame.extend(QxWindow, "QxFrame");



/*
------------------------------------------------------------------------------------
  PROPERTIES
------------------------------------------------------------------------------------
*/

/*!
  The main menu bar if any.
*/
QxFrame.addProperty({ name : "menuBar", type : QxConst.TYPEOF_OBJECT, allowNull : true, instance : QxMenuBar });

/*!
  The status bar if any.
*/
QxFrame.addProperty({ name : "statusBar", type : QxConst.TYPEOF_OBJECT, allowNull : true});//, instance : QxStatusBar }); //gets an error when instance is used???


/*
------------------------------------------------------------------------------------
  MODIFIERS
------------------------------------------------------------------------------------
*/

proto._modifyMenuBar = function(propValue, propOldValue, propData)
{
  if (propValue)
  {
    this._layout.addAfter(this.getMenuBar(), this._captionBar);
  }
  else
  {
    this._layout.remove(this.getMenuBar());
  };

  return true;
};

proto._modifyStatusBar = function(propValue, propOldValue, propData)
{
  if (propValue)
  {
    this._layout.addAtEnd(this.getStatusBar());
  }
  else
  {
    this._layout.remove(this.getStatusBar());
  };

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