/* ************************************************************************

   qooxdoo - the new era of web interface development

   Copyright:
     (C) 2004-2005 by Schlund + Partner AG, Germany
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

#package(ajax)
#require(QxTimer)

************************************************************************ */

/*!
  Helper class for data transfer from server to client
*/
function QxData(c)
{
  QxTarget.call(this);

  this._requestQueue = [];
  this._storeQueue = [];

  this._cache = {};

  this._interval = new QxTimer(25);
  this._processRequestQueue = false;

  var o = this;
  this._interval.addEventListener(QxConst.EVENT_TYPE_INTERVAL, function() {
    o.checkProcess();
  });
};

QxData.extend(QxTarget, "QxData");

proto.loadData = function(dataKey)
{
  if (this.getDisposed()) {
    return;
  };

  this._requestQueue.push(dataKey);

  if (!this._interval.getEnabled()) {
    this._interval.start();
  };
};

proto.checkProcess = function()
{
  if (this.getDisposed()) {
    return;
  };

  if (this._processRequestQueue) {
    return;
  };

  this._processRequestQueue = true;

  while(this._requestQueue.length > 0) {
    this.process(this._requestQueue.shift(), new QxXmlHttpLoader);
  };

  this._processRequestQueue = false;

  this._interval.stop();
};

proto.process = function(dataKey, loader)
{
  if (this.getDisposed()) {
    return;
  };

  this._storeQueue.push(dataKey);

  var o = this;
  loader.addEventListener("complete", function(e) {
    o.processComplete(e.getData());
    loader.dispose();
  });

  loader.load(this.makeRequest(dataKey));
  // sending xmlRequest... (callback := processComplete)
};

/*!
  This handles the dataKey and generates the request URI
  Extend QxData and overwrite this function!
*/
proto.makeRequest = function(dataKey)
{

  var t = dataKey.indexOf("[");
  var p0 = dataKey.substring(0, t);
  var p1 = dataKey.substring(t+1, dataKey.length-1);

  return "data/" + p0 + "/" + p1 + ".xml" + "?r=" + Math.round(Math.random()^Math.random()*100000);
};

proto.processComplete = function(xmlData)
{

  var req = this.getRequest(xmlData);
  var res = this.parseData(req, xmlData);

  this.mergeCacheData(res);

  this.dispatchEvent(new QxDataEvent("update" + req.toFirstUp(), this), true);
};

proto.getRequest = function(xmlData)
{
  return xmlData.documentElement.getElementsByTagName("PfxRequest")[0].getElementsByTagName("PfxSoap")[0].getAttribute("reqname");
};

proto.getResultXml = function(xmlData)
{
  return xmlData.documentElement.getElementsByTagName("PfxResult")[0];
};

proto.mapXmlToObject = function(xmlFrag)
{
  var r = {};
  var c = xmlFrag.childNodes;

  for (var i=0; i<c.length; i++) {
    if (c[i].nodeType == 1) {
      r[c[i].tagName] = c[i].firstChild.nodeValue;
    };
  };

  return r;
};

proto.parseData = function(req, xmlData)
{
  var handler = this["_parseData_" + req];

  if (typeof handler != QxConst.TYPEOF_FUNCTION) {
    throw new Error("QxData: The Parser function is not defined: _parseData_" + req + "!");
  };

  return handler.call(this, xmlData);
};

proto.mergeCacheData = function(res)
{
  for (i in res) {
    this._cache[i] = res[i];
  };
};

proto.dispose = function()
{
  if(this._disposed) {
    return;
  };

  QxObject.prototype.dispose.call(this);

  if (typeof this._requestQueue == QxConst.TYPEOF_OBJECT) {
    for (var i=0; i<this._requestQueue.length; i++) {
      delete this._requestQueue[i];
    };
  };

  delete this._requestQueue;

  if (typeof this._storeQueue == QxConst.TYPEOF_OBJECT) {
    for (var i=0; i<this._storeQueue.length; i++) {
      delete this._storeQueue[i];
    };
  };

  delete this._storeQueue;

  if (typeof this._cache == QxConst.TYPEOF_OBJECT) {
    for (i in this._cache) {
      delete this._cache[i];
    };
  };

  this._cache = null;

  if (this._interval) {
    this._interval.dispose();
  };

  this._interval = null;

  this._processRequestQueue = null;
};
