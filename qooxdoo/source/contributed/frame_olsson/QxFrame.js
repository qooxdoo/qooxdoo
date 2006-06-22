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

function QxFrame(vCaption, vIcon)
{
  qx.ui.window.Window.call(this, vCaption, vIcon);
});


/*
------------------------------------------------------------------------------------
  PROPERTIES
------------------------------------------------------------------------------------
*/

/*!
  Appearance setting for the class.
*/
qx.OO.changeProperty({ name : "appearance", type : qx.constant.Type.STRING, defaultValue : "frame" });

/*!
  The main menu bar if any.
*/
qx.OO.addProperty({ name : "menuBar", type : qx.constant.Type.OBJECT, allowNull : true, instance : "qx.ui.menu.MenuBar" });

/*!
  The main tool bar if any.
*/
qx.OO.addProperty({ name : "toolBar", type : qx.constant.Type.OBJECT, allowNull : true, instance : "qx.ui.toolbar.ToolBar" });

/*!
  The status bar if any.
*/
qx.OO.addProperty({ name : "statusBar", type : qx.constant.Type.OBJECT, allowNull : true, instance : "QxStatusBar" });


/*
------------------------------------------------------------------------------------
  MODIFIERS
------------------------------------------------------------------------------------
*/

qx.Proto._modifyMenuBar = function(propValue, propOldValue, propData)
{
  if (propValue)
  {
    if(propOldValue) {
      this._layout.remove(propOldValue);
    }

    this._layout.addAfter(propValue, this._captionBar);
  }

  return true;
}

qx.Proto._modifyToolBar = function(propValue, propOldValue, propData)
{
  if (propValue)
  {
    if(propOldValue) {
      this._layout.remove(propOldValue);
    }

    var menuBar = this.getMenuBar();

    this._layout.addAfter(propValue, menubar ? menuBar : this._captionBar);
  }

  return true;
}

qx.Proto._modifyStatusBar = function(propValue, propOldValue, propData)
{
  if (propValue)
  {
    if(propOldValue) {
      this._layout.remove(propOldValue);
    }

    this._layout.addAtEnd(propValue);
  }

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
