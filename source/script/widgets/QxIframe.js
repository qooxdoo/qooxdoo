function QxIframe(vSrc)
{
  QxWidget.call(this);

  this.setTabIndex(0);

  var o = this;
  this.__onreadystatechange = function(e) { return o._onreadystatechange(e); };
  this.__onload = function(e) { return o._onload(e); };

  if (isValid(vSrc)) {
    this.setSrc(vSrc);
  };
};

QxIframe.extend(QxWidget, "QxIframe");

QxIframe.addProperty({ name : "src", type : String, defaultValue : "javascript:void(0)" });


/*
  -------------------------------------------------------------------------------
    MODIFIER
  -------------------------------------------------------------------------------
*/

proto._realFrame = null;

proto._modifyElement = function(propValue, propOldValue, propName, uniqModIds)
{
  if (!this._realFrame)
  {
    // clone proto element and assign iframe
    this._realFrame = QxIframe._element.cloneNode(true);

    if ((new QxClient).isMshtml()) {
      this._realFrame.onreadystatechange = this.__onreadystatechange;
    } else {
      this._realFrame.onload = this.__onload;
    };
  };

  propValue.appendChild(this._realFrame);

  this._renderSrc();

  // create basic widget
  QxWidget.prototype._modifyElement.call(this, propValue, propOldValue, propName, uniqModIds);

  return true;
};

proto._modifySrc = function(propValue, propOldValue, propName, uniqModIds)
{
  if( this.isCreated()) {
    this._renderSrc();
  };

  return true;
};

proto.getIframe = function() {
  return this._realFrame;
};

proto._renderSrc = function()
{
  var currentSrc = this.getSrc();

  this._isLoaded = false;
  this._realFrame.src = isValid(currentSrc) ? currentSrc : "javascript:void(0)";
};

proto._onreadystatechange = function()
{
  if (this._realFrame.readyState == "complete") {
    this.dispatchEvent(new QxEvent("load"));
  };
};

proto._onload = function()
{
  this._isLoaded = true;
  this.dispatchEvent(new QxEvent("load"));
};

/*
  -------------------------------------------------------------------------------
    WINDOW & DOCUMENT ACCESS
  -------------------------------------------------------------------------------
*/

if ((new QxClient).isMshtml())
{
  proto.getContentWindow = function()
  {
    if (this.isCreated()) {
      try { return this.getElement().contentWindow; }
      catch (ex) {};
    };

    return null;
  };

  proto.getContentDocument = function()
  {
    var win = this.getContentWindow();
    return win ? win.document : null;
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
      try { return this.getElement().contentDocument; }
      catch (ex) {};
    };

    return null;
  };
};


/*
  -------------------------------------------------------------------------------
    LOAD STATUS
  -------------------------------------------------------------------------------
*/

proto._isLoaded = false;

if ((new QxClient).isMshtml())
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
  -------------------------------------------------------------------------------
    DISPOSE
  -------------------------------------------------------------------------------
*/

proto.dispose = function()
{
  if (this.getDisposed()) {
    return;
  };

  if (this.isCreated() && this._realFrame) {
    this.getElement().removeChild(this._realFrame);
  };

  this._realFrame = null;

  QxWidget.prototype.dispose.call(this);
};


/*
  -------------------------------------------------------------------------------
    INIT
  -------------------------------------------------------------------------------
*/
QxIframe.init = function()
{
  var f = QxIframe._element = document.createElement("iframe");

  f.frameBorder = "0";
  f.frameSpacing = "0";

  f.marginWidth = "0";
  f.marginHeight = "0";

  f.width = "100%";
  f.height = "100%";

  f.hspace = "0";
  f.vspace = "0";

  f.border = "0";
  f.scrolling = "auto";
  f.unselectable = "on";
  f.src = "javascript:void(0)";
  f.className = "QxIframeFrame";
  f.allowTransparency = "true";
};

QxIframe.init();