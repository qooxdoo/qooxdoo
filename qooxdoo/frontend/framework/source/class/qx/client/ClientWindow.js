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

#module(uicore)

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
