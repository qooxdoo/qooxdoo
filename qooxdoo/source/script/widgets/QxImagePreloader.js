/*!
  This is the preloader used from QxImage instances.
*/
function QxImagePreloader(vSource)
{
  var m = new QxImagePreloaderManager();

  if(m.has(vSource)) {
    return m.get(vSource);
  };

  QxTarget.call(this);

  // Create Image-Node
  this._element = new Image();

  // This is needed for wrapping event to the object
  this._element._QxImagePreloader = this;

  // Define handler if image events occurs
  this._element.onload = QxImagePreloader.__onload;
  this._element.onerror = QxImagePreloader.__onerror;

  // Set Source
  this._source = vSource;
  this._element.src = vSource;

  // Set PNG State
  if ((new QxClient).isMshtml()) {
    this._isPng = /\.png$/i.test(this._element.nameProp);
  };

  m.add(this);
};

QxImagePreloader.extend(QxTarget, "QxImagePreloader");




/*
------------------------------------------------------------------------------------
  STATE MANAGERS
------------------------------------------------------------------------------------
*/

proto._source = null;
proto._isLoaded = false;

// only available in mshtml: true when the image is in png format
proto._isPng = false;




/*
------------------------------------------------------------------------------------
  CROSSBROWSER GETTERS
------------------------------------------------------------------------------------
*/

proto.getUri = function() { return this._source; };

if((new QxClient).isGecko())
{
  proto.getWidth = function() { return this._element.naturalWidth; };
  proto.getHeight = function() { return this._element.naturalHeight; };
  proto.getIsLoaded = function() { return this._isLoaded = this._element.complete; };
}
else if((new QxClient).isMshtml())
{
  proto.getWidth = function() { return this._element.width; };
  proto.getHeight = function() { return this._element.height; };
  proto.getIsLoaded = function() { return this._element.readyState == "complete"; };
  proto.getIsPng = function() { return this._isPng; };
}
else
{
  proto.getWidth = function() { return this._element.width; };
  proto.getHeight = function() { return this._element.height; };
  proto.getIsLoaded = function() { return this._isLoaded = this._element.complete; };
};





/*
------------------------------------------------------------------------------------
  EVENT MAPPING
------------------------------------------------------------------------------------
*/

QxImagePreloader.__onload = function() { this._QxImagePreloader._onload(); };
QxImagePreloader.__onerror = function() { this._QxImagePreloader._onerror(); };

proto._onload = function()
{
  this._isLoaded = true;

  if (this.hasEventListeners("load")) {
    this.dispatchEvent(new QxEvent("load"));
  };
};

proto._onerror = function()
{
  this._isLoaded = false;

  if (this.hasEventListeners("error")) {
    this.dispatchEvent(new QxEvent("error"));
  };
};




/*
------------------------------------------------------------------------------------
  DISPOSER
------------------------------------------------------------------------------------
*/

proto.dispose = function()
{
  if(this.getDisposed()) {
    return;
  };
  
  QxTarget.prototype.dispose.call(this);

  if (this._element)
  {
    this._element.onload = this._element.onerror = null;
    this._element._QxImagePreloader = null;
    this._element = null;
  };

  this._isLoaded = this._isPng = false;
  return true;
};