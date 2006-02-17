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

#package(flash)

************************************************************************ */

/*!
  Original non qooxdoo Version by Geoff Stearns
    Flash detection and embed - http://blog.deconcept.com/flashobject/
    FlashObject is (c) 2005 Geoff Stearns and is released under the MIT License
    http://www.opensource.org/licenses/mit-license.php

  Modified for qooxdoo by Sebastian Werner
    Based on version 1.2.3
    Relicensed under LGPL in assent of Geoff Stearns
*/

function QxFlash(vSource, vVersion)
{
  QxTerminator.call(this);

  // Use background handling of QxWidget instead
  this._params = {};
  this._variables = {};

  if(QxUtil.isValidString(vSource)) {
    this.setSource(vSource);
  };

  this.setVersion(QxUtil.isValidString(vVersion) ? vVersion : QxFlash.MINREQUIRED);
};

QxFlash.extend(QxTerminator, "QxFlash");

QxFlash.addProperty({ name : "source", type : QxConst.TYPEOF_STRING });
QxFlash.addProperty({ name : "version" });

QxFlash.addProperty({ name : "enableExpressInstall", type : QxConst.TYPEOF_BOOLEAN, defaultValue : false });
QxFlash.addProperty({ name : "enableDetection", type : QxConst.TYPEOF_BOOLEAN, defaultValue : true });
QxFlash.addProperty({ name : "redirectUrl", type : QxConst.TYPEOF_STRING });

QxFlash.addProperty({ name : "quality", type : QxConst.TYPEOF_STRING, impl : "param", defaultValue : "high", possibleValues : [ "low", "autolow", "autohigh", "medium", "high", "best" ] });
QxFlash.addProperty({ name : "scale", type : QxConst.TYPEOF_STRING, impl : "param", defaultValue : "showall", possibleValues : [ "showall", "noborder", "excactfit", "noscale" ] });
QxFlash.addProperty({ name : "wmode", type : QxConst.TYPEOF_STRING, impl : "param", defaultValue : "", possibleValues : [ "window", "opaque", "transparent" ] });
QxFlash.addProperty({ name : "play", type : QxConst.TYPEOF_BOOLEAN, impl : "param", defaultValue : true });
QxFlash.addProperty({ name : "loop", type : QxConst.TYPEOF_BOOLEAN, impl : "param", defaultValue : true });
QxFlash.addProperty({ name : "menu", type : QxConst.TYPEOF_BOOLEAN, impl : "param", defaultValue : true });

QxFlash.EXPRESSINSTALL = [6,0,65];
QxFlash.MINREQUIRED = "1";
QxFlash.PLAYERVERSION = null;
QxFlash.PLUGINKEY = "Shockwave Flash";
QxFlash.ACTIVEXKEY = "ShockwaveFlash.ShockwaveFlash";





/*
---------------------------------------------------------------------------
  PLAYER VERSION CACHE
---------------------------------------------------------------------------
*/

QxFlash.getPlayerVersion = function()
{
  if (QxFlash.PLAYERVERSION != null) {
    return QxFlash.PLAYERVERSION;
  };

  var vPlayerVersion = new QxFlashPlayerVersion(0,0,0);

  if(navigator.plugins && navigator.mimeTypes.length)
  {
    var x = navigator.plugins[QxFlash.PLUGINKEY];

    if(x && x.description) {
      vPlayerVersion = new QxFlashPlayerVersion(x.description.replace(/([a-z]|[A-Z]|\s)+/, '').replace(/(\s+r|\s+b[0-9]+)/, '.'));
    };
  }
  else if (window.ActiveXObject)
  {
    try {
      var axo = new ActiveXObject(QxFlash.ACTIVEXKEY);
       vPlayerVersion = new QxFlashPlayerVersion(axo.GetVariable("$version").split(QxConst.CORE_SPACE)[1].split(QxConst.CORE_COMMA));
    }
    catch (e) {};
  };

  return QxFlash.PLAYERVERSION = vPlayerVersion;
};






/*
---------------------------------------------------------------------------
  BASICS
---------------------------------------------------------------------------
*/

proto._version = null;
proto._source = "";

proto._applyElementData = function(el)
{
  QxTerminator.prototype._applyElementData.call(this, el);

  // Check for ExpressInstall
  this._expressInstall = false;

  if (this.getEnableExpressInstall())
  {
    // check to see if we need to do an express install
    var expressInstallReqVer = new QxFlashPlayerVersion(QxFlash.EXPRESSINSTALL);
    var installedVer = QxFlash.getPlayerVersion();

    if (installedVer.versionIsValid(expressInstallReqVer) && !installedVer.versionIsValid(this._version)) {
      this._expressInstall = true;
    };
  };

  // this.debug("ExpressInstall Enabled: " + this._expressInstall);

  // Apply HTML
  if(!this.getEnableDetection() || this._expressInstall || QxFlash.getPlayerVersion().versionIsValid(this._version))
  {
    el.innerHTML = this.generateHTML();
  }
  else
  {
    var redir = this.getRedirectUrl();

    if(redir != QxConst.CORE_EMPTY) {
      document.location.replace(redir);
    };
  };
};





/*
---------------------------------------------------------------------------
  MODIFIER
---------------------------------------------------------------------------
*/

proto._modifySource = function(propValue, propOldValue, propName)
{
  this._source = QxUtil.isValidString(propValue) ? QxImageManager.buildUri(propValue) : QxConst.CORE_EMPTY;
  return true;
};

proto._modifyVersion = function(propValue, propOldValue, propData)
{
  if (this._version)
  {
    this._version.dispose();
    this._version = null;
  };

  if (QxUtil.isValidString(propValue)) {
    this._version = new QxFlashPlayerVersion(propValue);
  };

  return true;
};

proto._modifyParam = function(propValue, propOldValue, propData)
{
  this.setParam(propData.name, propValue.toString());
  return true;
};





/*
---------------------------------------------------------------------------
  OVERWRITE BACKGROUND COLOR HANDLING
---------------------------------------------------------------------------
*/

proto._modifyBackgroundColor = function(propValue, propOldValue, propData)
{
  if (propOldValue) {
    propOldValue.remove(this);
  };

  if (propValue)
  {
    this._applyBackgroundColor(propValue.getHex());
    propValue.add(this);
  }
  else
  {
    this._resetBackgroundColor();
  };

  return true;
};

proto._applyBackgroundColor = function(vNewValue) {
  this.setParam("bgcolor", vNewValue);
};




/*
---------------------------------------------------------------------------
  PARAMS
---------------------------------------------------------------------------
*/

proto.setParam = function(name, value){
  this._params[name] = value;
};

proto.getParam = function(name){
  return this._params[name];
};

proto.getParams = function() {
  return this._params;
};





/*
---------------------------------------------------------------------------
  VARIABLES
---------------------------------------------------------------------------
*/

proto.setVariable = function(name, value){
  this._variables[name] = value;
};

proto.getVariable = function(name){
  return this._variables[name];
};

proto.getVariables = function(){
  return this._variables;
};





/*
---------------------------------------------------------------------------
  HTML UTILITIES
---------------------------------------------------------------------------
*/

proto.generateParamTags = function()
{
  var vParams = this.getParams();
  var vParamTags = [];

  for (var vKey in vParams)
  {
    vParamTags.push("<param name='");
    vParamTags.push(vKey);
    vParamTags.push("' value='");
    vParamTags.push(vParams[vKey]);
    vParamTags.push("'/>");
  };

  return vParamTags.join(QxConst.CORE_EMPTY);
};

proto.getVariablePairs = function()
{
  var variables = this.getVariables();
  var variablePairs = [];

  for (var key in variables) {
    variablePairs.push(key + QxConst.CORE_EQUAL + variables[key]);
  };

  return variablePairs.join(QxConst.CORE_AMPERSAND);
};






/*
---------------------------------------------------------------------------
  HTML GENERATOR
---------------------------------------------------------------------------
*/

// Netscape Plugin Architecture
if (navigator.plugins && navigator.mimeTypes && navigator.mimeTypes.length)
{
  proto.generateHTML = function()
  {
    var html = [];

    // Express Install Handling
    if (this._expressInstall)
    {
      document.title = document.title.slice(0, 47) + ' - Flash Player Installation';

      this.addVariable('MMredirectURL', escape(window.location));
      this.addVariable('MMdoctitle', document.title);
      this.addVariable('MMplayerType', 'PlugIn');
    };

    html.push("<embed type='application/x-shockwave-flash' width='100%' height='100%' src='");
    html.push(this._source);
    html.push(QxConst.CORE_SINGLEQUOTE);

    var params = this.getParams();

    for (var key in params)
    {
      html.push(QxConst.CORE_SPACE);
      html.push(key);
      html.push(QxConst.CORE_EQUAL);
      html.push(QxConst.CORE_SINGLEQUOTE);
      html.push(params[key]);
      html.push(QxConst.CORE_SINGLEQUOTE);
    };

    var pairs = this.getVariablePairs();

    if (pairs.length > 0)
    {
      html.push(QxConst.CORE_SPACE);
      html.push("flashvars");
      html.push(QxConst.CORE_EQUAL);
      html.push(QxConst.CORE_SINGLEQUOTE);
      html.push(pairs);
      html.push(QxConst.CORE_SINGLEQUOTE);
    };

    html.push("></embed>");

    return html.join(QxConst.CORE_EMPTY);
  };
}

// Internet Explorer ActiveX Architecture
else
{
  proto.generateHTML = function()
  {
    var html = [];

    // Express Install Handling
    if (this._expressInstall)
    {
      document.title = document.title.slice(0, 47) + ' - Flash Player Installation';

      this.addVariable("MMredirectURL", escape(window.location));
      this.addVariable("MMdoctitle", document.title);
      this.addVariable("MMplayerType", "ActiveX");
    };

    html.push("<object classid='clsid:D27CDB6E-AE6D-11cf-96B8-444553540000' width='100%' height='100%'>");
    html.push("<param name='movie' value='");
    html.push(this._source);
    html.push("'/>");

    var tags = this.generateParamTags();

    if(tags.length > 0) {
      html.push(tags);
    };

    var pairs = this.getVariablePairs();

    if(pairs.length > 0)
    {
      html.push("<param name='flashvars' value='");
      html.push(pairs);
      html.push("'/>");
    };

    html.push("</object>");

    return html.join(QxConst.CORE_EMPTY);
  };
};






/*
---------------------------------------------------------------------------
  METHODS TO GIVE THE LAYOUTERS INFORMATIONS
---------------------------------------------------------------------------
*/

proto._isWidthEssential = QxUtil.returnTrue;
proto._isHeightEssential = QxUtil.returnTrue;




/*
---------------------------------------------------------------------------
  PREFERRED DIMENSIONS
---------------------------------------------------------------------------
*/

proto._computePreferredInnerWidth = QxUtil.returnZero;
proto._computePreferredInnerHeight = QxUtil.returnZero;





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

  delete this._source;
  delete this._params;
  delete this._variables;

  if (this._version)
  {
    this._version.dispose();
    this._version = null;
  };

  QxWidget.prototype.dispose.call(this);
};
