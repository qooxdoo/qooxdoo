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

#module(frame)

************************************************************************ */

qx.OO.defineClass("qx.ui.embed.Iframe", qx.ui.basic.Terminator,
function(vSource)
{
  // **********************************************************************
  //   INIT
  // **********************************************************************
  qx.ui.basic.Terminator.call(this);

  qx.ui.embed.Iframe.init();

  this.setSelectable(false);
  this.setTabIndex(0);

  var o = this;
  this.__onreadystatechange = function(e) { return o._onreadystatechange(e); }
  this.__onload = function(e) { return o._onload(e); }

  if (qx.util.Validation.isValid(vSource)) {
    this.setSource(vSource);
  }
});

qx.OO.changeProperty({ name : "appearance", type : qx.constant.Type.STRING, defaultValue : "iframe" });






/*
---------------------------------------------------------------------------
  PROPERTIES
---------------------------------------------------------------------------
*/

qx.OO.addProperty({ name : "source", type : qx.constant.Type.STRING });

qx.OO.addProperty({ name : "frameName", type : qx.constant.Type.STRING });






/*
---------------------------------------------------------------------------
  INTERNAL PROPERTIES
---------------------------------------------------------------------------
*/

qx.Proto._iframeNode = null;

qx.Proto.getIframeNode = function() {
  return this._iframeNode;
}

qx.Proto.setIframeNode = function(vIframeNode) {
  return this._iframeNode = vIframeNode;
}





/*
---------------------------------------------------------------------------
  METHODS
---------------------------------------------------------------------------
*/

qx.Proto.reload = function() {
  this._applySource();
}





/*
---------------------------------------------------------------------------
  MODIFIER
---------------------------------------------------------------------------
*/

qx.Proto._modifyElement = function(propValue, propOldValue, propData)
{
  var iframeNode = this.getIframeNode();

  if (!iframeNode)
  {
    // clone proto element and assign iframe
    iframeNode = this.setIframeNode(qx.ui.embed.Iframe._element.cloneNode(true));

    if (qx.sys.Client.isMshtml()) {
      iframeNode.onreadystatechange = this.__onreadystatechange;
    } else {
      iframeNode.onload = this.__onload;
    }
  }

  this._applyFrameName();
  this._applySource();

  propValue.appendChild(iframeNode);

  // create basic widget
  qx.ui.basic.Terminator.prototype._modifyElement.call(this, propValue, propOldValue, propData);

  return true;
}

qx.Proto._modifySource = function(propValue, propOldValue, propData)
{
  if(this.isCreated()) {
    this._applySource();
  }

  return true;
}

qx.Proto._applySource = function()
{
  var currentSource = this.getSource();

  if (qx.util.Validation.isInvalidString(currentSource)) {
    currentSource = qx.manager.object.ImageManager.buildUri("static/image/blank.gif");
  }

  this._isLoaded = false;
  this.getIframeNode().src = currentSource;
}

qx.Proto._applyFrameName = function()
{
  var vName = this.getFrameName();
  this.getIframeNode().name = qx.util.Validation.isValidString(vName) ? vName : qx.constant.Core.EMPTY;
}

qx.Proto._modifyFrameName = function (propValue, propOldValue, propName, uniqModIds)
{
  if( this.isCreated()) {
    this._applyFrameName();
  }

  return true;
}







/*
---------------------------------------------------------------------------
  EVENT HANDLER
---------------------------------------------------------------------------
*/

qx.Proto._onreadystatechange = function()
{
  if (this.getIframeNode().readyState == "complete") {
    this.dispatchEvent(new qx.event.type.Event(qx.constant.Event.LOAD), true);
  }
}

qx.Proto._onload = function()
{
  this._isLoaded = true;
  this.dispatchEvent(new qx.event.type.Event(qx.constant.Event.LOAD), true);
}






/*
---------------------------------------------------------------------------
  WINDOW & DOCUMENT ACCESS
---------------------------------------------------------------------------
*/

if (qx.sys.Client.isMshtml())
{
  qx.Proto.getContentWindow = function()
  {
    if (this.isCreated()) {
      try { return this.getIframeNode().contentWindow; }
      catch (ex) {}
    }

    return null;
  }

  qx.Proto.getContentDocument = function()
  {
    var win = this.getContentWindow();
    if (win) {
      try { return win.document; }
      catch (ex) {}
    }

    return null;
  }
}
else
{
  qx.Proto.getContentWindow = function()
  {
    var doc = this.getContentDocument();
    return doc ? doc.defaultView : null;
  }

  qx.Proto.getContentDocument = function()
  {
    if (this.isCreated()) {
      try { return this.getIframeNode().contentDocument; }
      catch (ex) {}
    }

    return null;
  }
}







/*
---------------------------------------------------------------------------
  LOAD STATUS
---------------------------------------------------------------------------
*/

qx.Proto._isLoaded = false;

if (qx.sys.Client.isMshtml())
{
  qx.Proto.isLoaded = function()
  {
    var doc = this.getContentDocument();
    return doc ? doc.readyState == "complete" : false;
  }
}
else
{
  qx.Proto.isLoaded = function()
  {
    return this._isLoaded;
  }
}






/*
---------------------------------------------------------------------------
  DISPOSE
---------------------------------------------------------------------------
*/

qx.Proto.dispose = function()
{
  if (this.getDisposed()) {
    return;
  }

  if (this._iframeNode)
  {
    this._iframeNode.onreadystatechange = null;
    this._iframeNode.onload = null;

    this._iframeNode = null;
  }

  qx.ui.basic.Terminator.prototype.dispose.call(this);
}






/*
---------------------------------------------------------------------------
  INIT
---------------------------------------------------------------------------
*/
qx.ui.embed.Iframe.init = function()
{
  if (qx.ui.embed.Iframe._element) {
    return;
  }

  var f = qx.ui.embed.Iframe._element = document.createElement("iframe");

  f.frameBorder = qx.constant.Core.ZERO;
  f.frameSpacing = qx.constant.Core.ZERO;

  f.marginWidth = qx.constant.Core.ZERO;
  f.marginHeight = qx.constant.Core.ZERO;

  f.width = qx.constant.Core.HUNDREDPERCENT;
  f.height = qx.constant.Core.HUNDREDPERCENT;

  f.hspace = qx.constant.Core.ZERO;
  f.vspace = qx.constant.Core.ZERO;

  f.border = qx.constant.Core.ZERO;
  f.scrolling = qx.constant.Core.AUTO;
  f.unselectable = "on";
  f.allowTransparency = "true";
}
