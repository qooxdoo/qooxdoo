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

#package(core)
#post(qx.event.handler.EventHandler)
#post(qx.ui.core.ClientDocument)

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
  this._element._QxClientWindow = this;

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
};

qx.Proto.getClientDocument = function() {
  return this._clientDocument;
};

qx.Proto.getElement = function() {
  return this._element;
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

  if (this._eventManager)
  {
    this._eventManager.dispose();
    this._eventManager = null;
  };

  if (this._clientDocument)
  {
    this._clientDocument.dispose();
    this._clientDocument = null;
  };

  if (this._element)
  {
    this._element._QxClientWindow = null;
    this._element = null;
  };

  return qx.core.Target.prototype.dispose.call(this);
};
