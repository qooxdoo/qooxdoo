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

************************************************************************ */

function QxXmlHttpLoader()
{
  QxTarget.call(this);

  if (!QxXmlHttpLoader._ok) {
    throw new Error("Your Browser does not support XML-HTTP!");
  };

  // Object wrapper to events (needed for DOM events)
  var o = this;
  this.__onreadystatechange = function() { o._onreadystatechange(); };
  this.__onload = function() { o._onload(); };

  this.__onreadystatefix = function () {
    o.req.readyState = 4;
    o._onreadystatechange();
  };
};

QxXmlHttpLoader.extend(QxTarget, "QxXmlHttpLoader");

/*
-----------------------------------------------------------------
The XMLHTTP-Object:
http://developer.apple.com/internet/webcontent/xmlhttpreq.html
-----------------------------------------------------------------

Functions:
---------------
abort()
Stops the current request

getAllResponseHeaders()
Returns complete set of headers (labels and values) as a string

getResponseHeader("headerLabel")
Returns the string value of a single header label

open("method", "URL"[, asyncFlag[, "userName"[, "password"]]])
Assigns destination URL, method, and other optional attributes of a pending request

send(content)
Transmits the request, optionally with postable string or DOM object data

setRequestHeader("label", "value")
Assigns a label/value pair to the header to be sent with a request


Properties:
----------------
onreadystatechange
Event handler for an event that fires at every state change

readyState
Object status integer:
  0 = uninitialized
  1 = loading
  2 = loaded
  3 = interactive
  4 = complete

responseText
  String version of data returned from server process

responseXML
  DOM-compatible document object of data returned from server process

status
  Numeric code returned by server, such as 404 for "Not Found" or 200 for "OK"

statusText
  String message accompanying the status code
*/


// Do this once per load to reduce execution time
QxXmlHttpLoader._http = window.XMLHttpRequest ? true : false;
QxXmlHttpLoader._activex = window.ActiveXObject && !QxClient.isOpera() ? true : false;
QxXmlHttpLoader._activexobj = null;
QxXmlHttpLoader._ok = QxXmlHttpLoader._http || QxXmlHttpLoader._activex;


QxXmlHttpLoader.addProperty({ name : "requestMethod",   type : QxConst.TYPEOF_STRING, defaultValue : "GET" });

// Try to find valid Microsoft implementation of XMLHTTP
if (QxXmlHttpLoader._activex)
{
  var servers = ["MSXML2", "Microsoft", "MSXML", "MSXML3"];
  for (var i=0; i<servers.length; i++)
  {
    try
    {
      var o = new ActiveXObject(servers[i] + ".XMLHTTP");
      QxXmlHttpLoader._activexobj = servers[i];
      o = null;
    } catch(ex) {};
  };
};

QxXmlHttpLoader.addProperty({ name : "xml" });

// add an empty hash for request headers
proto._requestHeaders = {};


proto.removeRequestHeader = function(headerName) {
  delete this._requestHeaders[headerName];
  return true;
};

proto.setRequestHeader = function(headerName, headerValue) {
  this._requestHeaders[headerName] = headerValue;
  return true;
};

proto._applyHeaders = function() {
  if ( !this.req ) return;

  var vHeaders = this._requestHeaders;
  var headerName;

  for (headerName in vHeaders) {
  this.req.setRequestHeader(headerName,vHeaders[headerName]);
  }
};

// add an empty hash for request Properties
//
proto._requestProperties = {};

proto.removeRequestProperty = function(propName) {
  delete this._requestProperties[propName];
  return true;
};

proto.setRequestProperty = function(propName, propValue) {
  this._requestProperties[propName] = propValue;
  return true;
};

proto._applyRequestProperties = function(vUrl) {
  var vProperties = this._requestProperties;
  var propName;

  if ( vUrl != null ) {
    vUrl += ( vUrl.indexOf("?") ==  -1 ) ? "?" : "&";
  }
  else vUrl = "";

  for (propName in vProperties) {
    vUrl += propName + "=" + encodeURIComponent(vProperties[propName]) + "&";
  }

  return vUrl;

};

proto.load = function(url)
{
  try
  {
    this.req = QxXmlHttpLoader._activex ? new ActiveXObject(QxXmlHttpLoader._activexobj + ".XMLHTTP") : new XMLHttpRequest();

    // opera 7.6 beta1 does not support this
    if (typeof this.req.abort != QxConst.TYPEOF_UNDEFINED) {
      this.req.abort();
    };

    this.req.onreadystatechange = this.__onreadystatechange;

    // this works also in gecko based browsers
    // this.req.onload = this.__onload;

    // some versions of Moz do not support the readyState property
    // and the onreadystate event, so we patch it!

    if (this.req.readyState == null) {
      this.req.readyState = 1;
      req.addEventListener(QxConst.EVENT_TYPE_LOAD, this.__onreadystatefix, false);
    };

    var method = this.getRequestMethod();

    // append the request properties to the request url
    // if the method is of type GET
    if ( method == "GET" )
      url = this._applyRequestProperties(url);

    this.req.open(method, url, true);

    // apply request headers to the request object
    //
    this._applyHeaders();

    // if the request method is POST
    // create a property list and use it as argument to the send
    // method
    var data = null;
    if ( method == "POST" )
      data = this._applyRequestProperties();

    return QxXmlHttpLoader._activex ? this.req.send(data) : this.req.send(data);
  }
  catch(e)
  {
    throw new Error("Your browser does not support XML-HTTP:\n" + e);
  };
};

proto._onload = function()
{

};

proto._onreadystatechange = function()
{
  switch(this.req.readyState)
  {
    case 1:
      if (this.hasEventListeners("init")) {
        this.dispatchEvent(new QxEvent("init"), true);
      };

      //this.debug("[1/4] About to send request.");
      break;


    case 2:
      if (this.hasEventListeners("connect")) {
        this.dispatchEvent(new QxEvent("connect"), true);
      };

      //this.debug("[2/4] Connection to server established.");

      // msxml does not have the status property available at
      // this stage and gives "unknown error" if the property is
      // accessed
      //
      if (!QxXmlHttpLoader._activex)
        // Check HTTP State
        if (this.req.status != 200 && this.req.status != 0)
        {
          // opera 7.6 beta1 does not support this
          if (typeof this.req.abort != QxConst.TYPEOF_UNDEFINED)
            this.req.abort();

          throw new Error("File request failed: " + this.req.statusText + " [" + this.req.status + "]");
        };

      break;


    case 3:
      if (this.hasEventListeners("download")) {
        this.dispatchEvent(new QxEvent("download"), true);
      };

      try
      {
        var l = this.req.getResponseHeader("Content-Length");
        if (typeof l != QxConst.TYPEOF_NUMBER) {
          l = NaN;
        };
      }
      catch(ex)
      {
        var l = NaN;
      };

      //this.debug("[3/4] Downloading data: " + l);
      break;


    case 4:
      if (this.hasEventListeners("done")) {
        this.dispatchEvent(new QxEvent("done"), true);
      };

      //this.debug("[4/4] Downloading done.");

      // Check HTTP State
      if (this.req.status != 200 && this.req.status != 0)
      {
        // be nice to opera 7.6beta1
        if (this.req.abort) {
          this.req.abort();
        };

        throw new Error("File request failed: " + this.req.statusText + " [" + this.req.status + "]");
      };

      if (this.req.responseXML)
      {
        // Typical behaviour on file:// on mshtml
        // Could we check this with something like: /^file\:/.test(path); ?
        // No browser check here, because it doesn't seem to break other browsers
        if (!this.req.responseXML.documentElement)
        {
            // Clear xml file declaration, this breaks non unicode files (like ones with Umlauts)
            var s = String(this.req.responseText).replace(/<\?xml[^\?]*\?>/, QxConst.CORE_EMPTY);
            this.req.responseXML.loadXML(s);
        };

        // Re-check if fixed...
        if (!this.req.responseXML.documentElement) {
            throw new Error("Missing Document Element!");
        };

        if (this.req.responseXML.documentElement.tagName == "parseerror") {
            throw new Error("XML-File is not well-formed!");
        };

        // Dispatch complete event
        this.dispatchEvent(new QxDataEvent("complete", this.req.responseXML), true);
     }
     else
     {
       this.dispatchEvent(new QxDataEvent("complete", this.req.responseText), true);
     };
  };
};

proto.dispose = function()
{
  if (this._disposed) {
    return;
  };

  if (this.req)
  {
    // Next line of code was supposed to fix a IE memory leak. Unfortunately,
    // it lets IE consume more and more memory by each request.
    // this.req.onreadystatechange = null;

    // this seems to be ok
    this.req = null;
  };

  this.__onreadystatechange = null;

  return QxTarget.prototype.dispose.call(this);
};
