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

#package(frame)

************************************************************************ */

qx.OO.defineClass("qx.ui.embed.IframeEmbed", qx.ui.basic.Terminator, 
function(vSource)
{
  // **********************************************************************
  //   INIT
  // **********************************************************************
  qx.ui.basic.Terminator.call(this);

  qx.ui.embed.IframeEmbed.init();

  this.setSelectable(false);
  this.setTabIndex(0);

  var o = this;
  this.__onreadystatechange = function(e) { return o._onreadystatechange(e); };
  this.__onload = function(e) { return o._onload(e); };

  if (qx.util.Validation.isValid(vSource)) {
    this.setSource(vSource);
  };
});

qx.ui.embed.IframeEmbed.changeProperty({ name : "appearance", type : qx.Const.TYPEOF_STRING, defaultValue : "iframe" });






/*
---------------------------------------------------------------------------
  PROPERTIES
---------------------------------------------------------------------------
*/

qx.ui.embed.IframeEmbed.addProperty({ name : "source", type : qx.Const.TYPEOF_STRING });

qx.ui.embed.IframeEmbed.addProperty({ name : "frameName", type : qx.Const.TYPEOF_STRING });






/*
---------------------------------------------------------------------------
  INTERNAL PROPERTIES
---------------------------------------------------------------------------
*/

proto._iframeNode = null;

proto.getIframeNode = function() {
  return this._iframeNode;
};

proto.setIframeNode = function(vIframeNode) {
  return this._iframeNode = vIframeNode;
};







/*
---------------------------------------------------------------------------
  MODIFIER
---------------------------------------------------------------------------
*/

proto._modifyElement = function(propValue, propOldValue, propData)
{
  var iframeNode = this.getIframeNode();

  if (!iframeNode)
  {
    // clone proto element and assign iframe
    iframeNode = this.setIframeNode(qx.ui.embed.IframeEmbed._element.cloneNode(true));

    if (qx.sys.Client.isMshtml()) {
      iframeNode.onreadystatechange = this.__onreadystatechange;
    } else {
      iframeNode.onload = this.__onload;
    };
  };

  this._applyFrameName();
  this._applySource();

  propValue.appendChild(iframeNode);

  // create basic widget
  qx.ui.basic.Terminator.prototype._modifyElement.call(this, propValue, propOldValue, propData);

  return true;
};

proto._modifySource = function(propValue, propOldValue, propData)
{
  if(this.isCreated()) {
    this._applySource();
  };

  return true;
};

proto._applySource = function()
{
  var currentSource = this.getSource();

  if (qx.util.Validation.isInvalidString(currentSource)) {
    currentSource = qx.manager.object.ImageManager.buildUri("core/blank.gif");
  };

  this._isLoaded = false;
  this.getIframeNode().src = currentSource;
};

proto._applyFrameName = function()
{
  var vName = this.getFrameName();
  this.getIframeNode().name = qx.util.Validation.isValidString(vName) ? vName : qx.Const.CORE_EMPTY;
};

proto._modifyFrameName = function (propValue, propOldValue, propName, uniqModIds)
{
  if( this.isCreated()) {
    this._applyFrameName();
  };

  return true;
};







/*
---------------------------------------------------------------------------
  EVENT HANDLER
---------------------------------------------------------------------------
*/

proto._onreadystatechange = function()
{
  if (this.getIframeNode().readyState == "complete") {
    this.dispatchEvent(new qx.event.types.Event(qx.Const.EVENT_TYPE_LOAD), true);
  };
};

proto._onload = function()
{
  this._isLoaded = true;
  this.dispatchEvent(new qx.event.types.Event(qx.Const.EVENT_TYPE_LOAD), true);
};






/*
---------------------------------------------------------------------------
  WINDOW & DOCUMENT ACCESS
---------------------------------------------------------------------------
*/

if (qx.sys.Client.isMshtml())
{
  proto.getContentWindow = function()
  {
    if (this.isCreated()) {
      try { return this.getIframeNode().contentWindow; }
      catch (ex) {};
    };

    return null;
  };

  proto.getContentDocument = function()
  {
    var win = this.getContentWindow();
    if (win) {
      try { return win.document; }
      catch (ex) {};
    };

    return null;
  };
}
else
{
  proto.getContentWindow = function()
  {
    var doc = this.getContentDocument();
    return doc ? doc.defaultView : null;
  };

  proto.getContentDocument = function()
  {
    if (this.isCreated()) {
      try { return this.getIframeNode().contentDocument; }
      catch (ex) {};
    };

    return null;
  };
};







/*
---------------------------------------------------------------------------
  LOAD STATUS
---------------------------------------------------------------------------
*/

proto._isLoaded = false;

if (qx.sys.Client.isMshtml())
{
  proto.isLoaded = function()
  {
    var doc = this.getContentDocument();
    return doc ? doc.readyState == "complete" : false;
  };
}
else
{
  proto.isLoaded = function()
  {
    return this._isLoaded;
  };
};






/*
---------------------------------------------------------------------------
  DISPOSE
---------------------------------------------------------------------------
*/

proto.dispose = function()
{
  if (this.getDisposed()) {
    return;
  };

  if (this._iframeNode)
  {
    this._iframeNode.onreadystatechange = null;
    this._iframeNode.onload = null;

    this._iframeNode = null;
  };

  qx.ui.basic.Terminator.prototype.dispose.call(this);
};






/*
---------------------------------------------------------------------------
  INIT
---------------------------------------------------------------------------
*/
qx.ui.embed.IframeEmbed.init = function()
{
  if (qx.ui.embed.IframeEmbed._element) {
    return;
  };

  var f = qx.ui.embed.IframeEmbed._element = document.createElement("iframe");

  f.frameBorder = qx.Const.CORE_ZERO;
  f.frameSpacing = qx.Const.CORE_ZERO;

  f.marginWidth = qx.Const.CORE_ZERO;
  f.marginHeight = qx.Const.CORE_ZERO;

  f.width = qx.Const.CORE_HUNDREDPERCENT;
  f.height = qx.Const.CORE_HUNDREDPERCENT;

  f.hspace = qx.Const.CORE_ZERO;
  f.vspace = qx.Const.CORE_ZERO;

  f.border = qx.Const.CORE_ZERO;
  f.scrolling = qx.Const.CORE_AUTO;
  f.unselectable = "on";
  f.allowTransparency = "true";
};
