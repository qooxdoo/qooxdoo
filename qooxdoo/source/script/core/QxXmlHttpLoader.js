/* ********************************************************************
   Class: QxXmlHttpLoader
******************************************************************** */

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
QxXmlHttpLoader._activex = window.ActiveXObject && !(new QxClient).isOpera() ? true : false;
QxXmlHttpLoader._activexobj = null;
QxXmlHttpLoader._ok = QxXmlHttpLoader._http || QxXmlHttpLoader._activex;

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

/*!
  Load the xml document returned via http request to url.  If vhash is defined, send a post using key/value pairs in vhash as query variable names/values.
*/
proto.load = function(url,vhash)
{
  try
  {
    this.req = QxXmlHttpLoader._activex ? new ActiveXObject(QxXmlHttpLoader._activexobj + ".XMLHTTP") : new XMLHttpRequest();
  
    // opera 7.6 beta1 does not support this
    if (typeof this.req.abort != "undefined") {
      this.req.abort();
    };

    this.req.onreadystatechange = this.__onreadystatechange;

    // this works also in gecko based browsers
    // this.req.onload = this.__onload;
    
    // some versions of Moz do not support the readyState property
    // and the onreadystate event, so we patch it!
    
    if (this.req.readyState == null) {
      this.req.readyState = 1;
      req.addEventListener("load", this.__onreadystatefix, false);
    };

    // if vhash is defined, go with a POST
    // otherwise use previous behavior (GET)
    if ((typeof(vhash) == 'object')&&
        (vhash != null)&&
        (typeof(vhash.length) == 'number'))
    {
      var i = 0;
      var reqstr = '';
      for (var k in vhash)
      {
        var v = vhash[k];
        if (i > 0) reqstr += '&';
        reqstr += k + '=' + v;
        i++;
      }
      this.req.open('POST', url, true);
    
      this.req.setRequestHeader("Method", "POST " + url + " HTTP/1.1");
      this.req.setRequestHeader("Content-Type", "application/x-www-form-urlencoded");
    
      return this.req.send(reqstr);
    }
    else
    {
      this.req.open("GET", url, true);
      return QxXmlHttpLoader._activex ? this.req.send() : this.req.send(null);
    }
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
        this.dispatchEvent(new QxEvent("init"));
      };
      
      //this.debug("[1/4] About to send request.");
      break;
      
      
    case 2:
      if (this.hasEventListeners("connect")) {
        this.dispatchEvent(new QxEvent("connect"));
      };
      
      //this.debug("[2/4] Connection to server established.");
      
      // Check HTTP State
      //   * typeof checks added by FRM, 20050816 to silence ie6 *
      //   *   complaint of "unspecified error"                  *
      if ((typeof(this.req) == 'object')&&
          (typeof(this.req.status) == 'number')&&
          (this.req.status != 200)&&
          (this.req.status != 0))
      {
        // opera 7.6 beta1 does not support this
        if (typeof this.req.abort != "undefined")
          this.req.abort();
        
        throw new Error("File request failed: " + this.req.statusText + " [" + this.req.status + "]");
      };
      
      break;
      
      
    case 3:
      if (this.hasEventListeners("download"))
        this.dispatchEvent(new QxEvent("download"));
        
      try
      {
        var l = this.req.getResponseHeader("Content-Length");
        if (typeof l != "number") {
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
        this.dispatchEvent(new QxEvent("done"));
      };
      
      //this.debug("[4/4] Downloading done.");

      // Check HTTP State
      //   * typeof checks added by FRM, 20050816 to silence ie6 *
      //   *   complaint of "unspecified error"                  *
      if ((typeof(this.req) == 'object')&&
          (typeof(this.req.status) == 'number')&&
          (this.req.status != 200)&&
          (this.req.status != 0))
      {
        // be nice to opera 7.6beta1
        if (this.req.abort) {
          this.req.abort();
        };
        
        throw new Error("File request failed: " + this.req.statusText + " [" + this.req.status + "]");
      };

      // Typical behaviour on file:// on mshtml
      // Could we check this with something like: /^file\:/.test(path); ? 
      // No browser check here, because it doesn't seem to break other browsers
      //    * test for this.req.responseXML's objecthood added by *
      //    * FRM, 20050816                                       *
      if ((typeof(this.req.responseXML) == 'object')&&(this.req.responseXML != null))
      {
        if (!this.req.responseXML.documentElement) 
        {
          // Clear xml file declaration, this breaks non unicode files (like ones with Umlauts)
          var s = String(this.req.responseText).replace(/<\?xml[^\?]*\?>/, "");
          //alert('xml: ' + s);
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
        throw new Error("Response was not a valid xml document");
        //throw new Error("Response was not a valid xml document [" + this.req.responseText + "]");
      }
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
