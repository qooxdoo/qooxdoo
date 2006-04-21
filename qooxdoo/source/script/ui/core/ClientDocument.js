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

#package(guicore)
#require(qx.dom.DomStyleSheet)
#post(qx.ui.core.ClientDocumentBlocker)
#post(qx.event.handler.FocusHandler)

************************************************************************ */

/*!
  This is the basic widget of all qooxdoo applications.

  qx.ui.core.ClientDocument is the parent of all children inside your application. It
  also handles their resizing and focus navigation. This widget will be automatically
  created through qx.client.ClientWindow.
*/
qx.ui.core.ClientDocument = function(vClientWindow)
{
  this._window = vClientWindow;
  this._document = this._window.getElement().document;

  // Init element
  this.setElement(this._document.body);

  // Needed hard-coded because otherwise the client document
  // would not be added initially to the state queue
  this.addToStateQueue();

  qx.ui.layout.CanvasLayout.call(this);

  // Don't use widget styles
  this._styleProperties = {};

  // Configure as focus root
  this.activateFocusRoot();

  // Cache current size
  this._cachedInnerWidth = this._document.body.offsetWidth;
  this._cachedInnerHeight = this._document.body.offsetHeight;

  // Add Resize Handler
  this.addEventListener(qx.Const.EVENT_TYPE_RESIZE, this._onresize);

  // Blocker and Dialog Support
  this._blocker = new qx.ui.core.ClientDocumentBlocker;
  this._modalWidgets = [];
  this._modalNativeWindow = null;

  // Blocker Events
  this._blocker.addEventListener(qx.Const.EVENT_TYPE_MOUSEDOWN, this.blockHelper, this);
  this._blocker.addEventListener(qx.Const.EVENT_TYPE_MOUSEUP, this.blockHelper, this);

  this.add(this._blocker);

  // Init Resize Helper
  /*
  if (qx.sys.Client.isGecko())
  {
    var o = this;
    this._resizeHelper = window.setInterval(function() { o._onresizehelper() }, 100);
  };
  */
};

qx.ui.core.ClientDocument.extend(qx.ui.layout.CanvasLayout, "qx.ui.core.ClientDocument");

qx.ui.core.ClientDocument.addProperty({ name : "globalCursor", type : qx.Const.TYPEOF_STRING });

qx.ui.core.ClientDocument.changeProperty({ name : "appearance", type : qx.Const.TYPEOF_STRING, defaultValue : "client-document" });





/*
---------------------------------------------------------------------------
  OVERWRITE WIDGET FUNCTIONS/PROPERTIES
---------------------------------------------------------------------------
*/

proto._modifyParent = qx.util.Return.returnTrue;
proto._modifyVisible = qx.util.Return.returnTrue;

proto._modifyElement = function(propValue, propOldValue, propData)
{
  this._isCreated = qx.util.Validation.isValidElement(propValue);

  if (propOldValue)
  {
    propOldValue._QxWidget = null;
  };

  if (propValue)
  {
    // add reference to widget instance
    propValue._QxWidget = this;

    // link element and style reference
    this._element = propValue;
    this._style = propValue.style;
  }
  else
  {
    this._element = null;
    this._style = null;
  };

  return true;
};

proto.getWindow = function() { return this._window; };
proto.getTopLevelWidget = qx.util.Return.returnThis;
proto.getDocumentElement = function() { return this._document; };
proto.getEventManager = function() { return this.getWindow().getEventManager(); };

proto.getParent = proto.getToolTip = qx.util.Return.returnNull;
proto.isMaterialized = proto.isSeeable = qx.util.Return.returnTrue;

proto._isDisplayable = true;
proto._hasParent = false;
proto._initialLayoutDone = true;









/*
---------------------------------------------------------------------------
  BLOCKER AND DIALOG SUPPORT
---------------------------------------------------------------------------
*/

proto.blockHelper = function(e)
{
  if (this._modalNativeWindow)
  {
    try
    {
      this._modalNativeWindow._window.focus();
    }
    catch(ex)
    {
      this.debug("Window seems to be closed already! => Releasing Blocker: (" + e.getType() + ")");
      this.release(this._modalNativeWindow);
    };
  };
};

proto.block = function(vActiveChild)
{
  // this.debug("BLOCK: " + vActiveChild.toHashCode());

  this._blocker.show();

  if (typeof qx.ui.window.Window === qx.Const.TYPEOF_FUNCTION && vActiveChild instanceof qx.ui.window.Window)
  {
    this._modalWidgets.push(vActiveChild);

    var vOrigIndex = vActiveChild.getZIndex();
    this._blocker.setZIndex(vOrigIndex);
    vActiveChild.setZIndex(vOrigIndex+1);
  }
  else if (typeof qx.client.NativeWindow === qx.Const.TYPEOF_FUNCTION && vActiveChild instanceof qx.client.NativeWindow)
  {
    this._modalNativeWindow = vActiveChild;
    this._blocker.setZIndex(1e7);
  };
};

proto.release = function(vActiveChild)
{
  // this.debug("RELEASE: " + vActiveChild.toHashCode());

  if (vActiveChild)
  {
    if (typeof qx.client.NativeWindow === qx.Const.TYPEOF_FUNCTION && vActiveChild instanceof qx.client.NativeWindow)
    {
      this._modalNativeWindow = null;
    }
    else
    {
      this._modalWidgets.remove(vActiveChild);
    };
  };

  var l = this._modalWidgets.length;
  if (l == 0)
  {
    this._blocker.hide();
  }
  else
  {
    var oldActiveChild = this._modalWidgets[l-1];

    var o = oldActiveChild.getZIndex();
    this._blocker.setZIndex(o);
    oldActiveChild.setZIndex(o+1);
  };
};








/*
---------------------------------------------------------------------------
  CSS API
---------------------------------------------------------------------------
*/

proto.createStyleElement = function(vCssText) {
  return qx.dom.DomStyleSheet.createElement(vCssText);
};

proto.addCssRule = function(vSheet, vSelector, vStyle) {
  return qx.dom.DomStyleSheet.addRule(vSheet, vSelector, vStyle);
};

proto.removeCssRule = function(vSheet, vSelector) {
  return qx.dom.DomStyleSheet.removeRule(vSheet, vSelector);
};

proto.removeAllCssRules = function(vSheet) {
  return qx.dom.DomStyleSheet.removeAllRules(vSheet);
};






/*
---------------------------------------------------------------------------
  CSS FIX
---------------------------------------------------------------------------
*/

qx.dom.DomStyleSheet.createElement("html,body{margin:0;border:0;padding:0;} html{border:0 none;} *{box-sizing:border-box;-moz-box-sizing: border-box;} img{box-sizing:content-box;-moz-box-sizing:content-box;}");

if (qx.core.Settings.enableApplicationLayout) {
  qx.dom.DomStyleSheet.createElement("html,body{width:100%;height:100%;overflow:hidden;}");
};





/*
---------------------------------------------------------------------------
  GLOBAL CURSOR SUPPORT
---------------------------------------------------------------------------
*/

proto._modifyGlobalCursor = function(propValue, propOldValue, propData)
{
  if (!this._globalCursorStyleSheet) {
    this._globalCursorStyleSheet = this.createStyleElement();
  };

  // Selector based remove does not work with the "*" selector in mshtml
  // this.removeCssRule(this._globalCursorStyleSheet, qx.Const.CORE_STAR);

  this.removeAllCssRules(this._globalCursorStyleSheet);

  if (propValue) {
    this.addCssRule(this._globalCursorStyleSheet, qx.Const.CORE_STAR, "cursor:" + propValue + " !important");
  };

  return true;
};





/*
---------------------------------------------------------------------------
  WINDOW RESIZE HANDLING
---------------------------------------------------------------------------
*/

proto._onresize = function(e)
{
  // Hide popups, tooltips, ...
  if (typeof qx.manager.object.PopupManager !== qx.Const.TYPEOF_UNDEFINED) {
    qx.manager.object.PopupManager.update();
  };

  // Update children
  this._recomputeInnerWidth();
  this._recomputeInnerHeight();

  // Flush queues
  qx.ui.core.Widget.flushGlobalQueues();
};

// This was an idea to allow mozilla more realtime document resize updates
// but it seems so, that mozilla stops javascript execution while the user
// resize windows. Bad.

/*
proto._onresizehelper = function()
{
  // Test for changes
  var t1 = this._recomputeInnerWidth();
  var t2 = this._recomputeInnerHeight();

  // Flush queues
  if (t1 || t2) {
    qx.ui.core.Widget.flushGlobalQueues();
  };
};
*/

proto._computeInnerWidth = function() {
  return this._document.body.offsetWidth;
};

proto._computeInnerHeight = function() {
  return this._document.body.offsetHeight;
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

  delete this._window;
  delete this._document;
  delete this._modalWidgets;
  delete this._modalNativeWindow;

  this._globalCursorStyleSheet = null;

  if (this._blocker)
  {
    this._blocker.removeEventListener(qx.Const.EVENT_TYPE_MOUSEDOWN, this.blockHelper, this);
    this._blocker.removeEventListener(qx.Const.EVENT_TYPE_MOUSEUP, this.blockHelper, this);

    this._blocker.dispose();
    this._blocker = null;
  };

  /*
  if (this._resizeHelper)
  {
    window.clearInterval(this._resizeHelper);
    this._resizeHelper = null;
  };
  */

  return qx.ui.layout.CanvasLayout.prototype.dispose.call(this);
};
