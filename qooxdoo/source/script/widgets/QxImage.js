/*!
  This widget is for all images in qooxdoo projects.
*/
function QxImage(vSource, vWidth, vHeight)
{
  QxTerminator.call(this);

  this.setTagName("IMG");
  this.setCanSelect(false);
  
  // Load default placeholder image.
  this.setHtmlProperty("src", QxImage._blank);

  if (isValid(vWidth)) {
    this.setWidth(vWidth);
  };

  if (isValid(vHeight)) {
    this.setHeight(vHeight);
  };
  
  if (isValid(vSource)) {
    this.setSource(vSource);
  };
};

QxImage.extend(QxTerminator, "QxImage");



/*
------------------------------------------------------------------------------------
  PROPERTIES
------------------------------------------------------------------------------------
*/

/*!
  The source uri of the image.
*/
QxImage.addProperty({ name : "source", type : String });

/*!
  The assigned preloader instance of the image.
*/
QxImage.addProperty({ name : "preloader", type : Object });

/*!
  The loading status.

  True if the image is loaded correctly. False if no image is loaded
  or the one that should be loaded is currently loading or not available.
*/
QxImage.addProperty({ name : "loaded", type : Boolean, defaultValue : false });




/*
------------------------------------------------------------------------------------
  STATIC CONFIGURATION
------------------------------------------------------------------------------------
*/

QxImage._blank = "../../images/core/blank.gif";



/*
------------------------------------------------------------------------------------
  EVENT MAPPERS
------------------------------------------------------------------------------------
*/

proto._onload = function() { this.setLoaded(true); };

proto._onerror = function() 
{ 
  this.setLoaded(false);
  
  if (this.hasEventListeners("error")) {
    this.dispatchEvent(new QxEvent("error"), true);
  };
  
  throw new Error("Image path is not valid: " + this.getSource());
};




/*
------------------------------------------------------------------------------------
  MODIFIERS
------------------------------------------------------------------------------------
*/

proto._modifySource = function(propValue, propOldValue, propName, uniqModIds)
{
  if (propValue || propOldValue)
  {
    // Omit uniqModIds here, otherwise the later setLoaded(true)
    // will not be executed (recursion preventation)
    this.setLoaded(false);

    if (propValue)
    {
      this.setPreloader(new QxImagePreloader(propValue), uniqModIds);
    }
    else if (propOldValue)
    {
      this.setPreloader(null, uniqModIds);
    };
  };

  return true;
};

proto._modifyPreloader = function(propValue, propOldValue, propName, uniqModIds)
{
  if (propOldValue)
  {
    propOldValue.removeEventListener("load", this._onload, this);
    propOldValue.removeEventListener("error", this._onerror, this);
  };

  if (propValue)
  {
    if (propValue.getIsLoaded())
    {
      this.setLoaded(true, uniqModIds);
    }
    else
    {
      propValue.addEventListener("load", this._onload, this);
      propValue.addEventListener("error", this._onerror, this);
    };
  };

  return true;
};

proto._modifyLoaded = function(propValue, propOldValue, propName, uniqModIds)
{
  if (propValue && this.isCreated())
  {
    this._apply();
  }
  else
  {
    // Outer changed
    this._outerChanged("unload");
  };

  return true;
};

proto._modifyElement = function(propValue, propOldValue, propName, uniqModIds)
{
  QxWidget.prototype._modifyElement.call(this, propValue, propOldValue, propName, uniqModIds);

  if (propValue && this.getLoaded()) {
    this._apply();
  };

  return true;
};




/*
------------------------------------------------------------------------------------
  CLIENT OPTIMIZED MODIFIERS
------------------------------------------------------------------------------------
*/

if ((new QxClient).isMshtml())
{
  proto._modifyOpacity = function() {
    throw new Error("Mshtml did not support opacity on images!");
  };

  proto._postApply = function(vEnabled)
  {
    if (this.getPreloader().getIsPng() && vEnabled)
    {
      this.setHtmlProperty("src", QxImage._blank);
      this.setStyleProperty("filter", "progid:DXImageTransform.Microsoft.AlphaImageLoader(src='" + this.getSource() + "',sizingMethod='scale')");
    }
    else
    {
      this.setHtmlProperty("src", this.getSource());
      vEnabled ? this.removeStyleProperty("filter") : this.setStyleProperty("filter", "Gray() Alpha(Opacity=50)");
    };
  };

  proto._apply = function()
  {
    var pl = this.getPreloader();
    
    if (this.getHeight() == null) {
      this.setStyleProperty("pixelHeight", pl.getHeight());
    };

    if (this.getWidth() == null) {
      this.setStyleProperty("pixelWidth", pl.getWidth());
    };

    // Apply
    this._postApply(this.getEnabled());

    // Invalidate Preferred
    this._invalidatePreferred(); 

    // Outer changed
    this._outerChanged("load");
    
    // should we call here something to fix the layout
    // if the image has changed and the size is different now...
    if (this.hasEventListeners("load")) {
      this.dispatchEvent(new QxEvent("load"), true);
    };
  };

  proto._modifyEnabled = function(propValue, propOldValue, propName, uniqModIds)
  {
    QxWidget.prototype._modifyEnabled.call(this, propValue, propOldValue, propName, uniqModIds);

    // Apply
    this._postApply(propValue);
    return true;
  };
}
else
{
  proto._apply = function()
  {
    this.setHtmlProperty("src", this.getSource());

    // Invalidate Preferred
    this._invalidatePreferred();    

    // Outer changed
    this._outerChanged("load");
    
    // should we call here something to fix the layout
    // if the image has changed and the size is different now...
    if (this.hasEventListeners("load")) {
      this.dispatchEvent(new QxEvent("load"), true);
    };
  };

  proto._modifyEnabled = function(propValue, propOldValue, propName, uniqModIds)
  {
    this.setOpacity(propValue ? 1 : 0.5, uniqModIds);
    return QxWidget.prototype._modifyEnabled.call(this, propValue, propOldValue, propName, uniqModIds);
  };
};





/*
------------------------------------------------------------------------------------
  PREFERRED DIMENSIONS
------------------------------------------------------------------------------------
*/

/*!
  Get the preferred width of the widget.

  Simplified from the implementation used in QxWidget. We need only to do a
  call to the preloader. This is so simple - we need not any caching here.
*/
proto.getPreferredWidth = function() {
  return this.getLoaded() ? this.getPreloader().getWidth() : 0;
};

/*!
  Get the preferred height of the widget.

  Simplified from the implementation used in QxWidget. We need only to do a
  call to the preloader. This is so simple - we need not any caching here.
*/
proto.getPreferredHeight = function() {
  return this.getLoaded() ? this.getPreloader().getHeight() : 0;
};



/*
------------------------------------------------------------------------------------
  DISPOSER
------------------------------------------------------------------------------------
*/

proto.dispose = function()
{
  if (this.getDisposed()) {
    return true;
  };
  
  return QxWidget.prototype.dispose.call(this);
};
