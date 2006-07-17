/* ************************************************************************

   qooxdoo - the new era of web development

   Copyright:
     2004-2006 by 1&1 Internet AG, Germany
     http://www.1und1.de | http://www.1and1.com
     All rights reserved

   License:
     LGPL 2.1: http://creativecommons.org/licenses/LGPL/2.1/

   Internet:
     * http://qooxdoo.org

   Authors:
     * Sebastian Werner (wpbasti)
       <sebastian dot werner at 1und1 dot de>
     * Andreas Ecker (ecker)
       <andreas dot ecker at 1und1 dot de>

************************************************************************ */

/* ************************************************************************

#module(core)
#use(qx.event.handler.EventHandler)
#use(qx.ui.core.ClientDocument)

************************************************************************ */

/*!
  Client window implementation

  Mainly a reference for the window object of the browser
*/
qx.OO.defineClass("qx.client.ClientWindow", qx.core.Target, 
function()
{
  qx.core.Target.call(this);

  // Establish connection between Object and Node
  this._element = window;

  // Create Client Document
  this._clientDocument = new qx.ui.core.ClientDocument(this);

  // Create Event Manager
  this._eventManager = new qx.event.handler.EventHandler(this);

  // Init Client Document as Default Root
  this._eventManager.setFocusRoot(this._clientDocument);
});





/*
---------------------------------------------------------------------------
  UTILITIES
---------------------------------------------------------------------------
*/

qx.Proto.getEventManager = function() {
  return this._eventManager;
}

qx.Proto.getClientDocument = function() {
  return this._clientDocument;
}

qx.Proto.getElement = function() {
  return this._element;
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

  if (this._eventManager)
  {
    this._eventManager.dispose();
    this._eventManager = null;
  }

  if (this._clientDocument)
  {
    this._clientDocument.dispose();
    this._clientDocument = null;
  }

  this._element = null;

  return qx.core.Target.prototype.dispose.call(this);
}
