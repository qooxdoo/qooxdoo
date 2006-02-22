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

#package(image)
#require(QxImagePreloaderManager)

************************************************************************ */

/*!
  This is the preloader used from QxImage instances.
*/
function QxImagePreloader(vSource)
{
  if(QxImagePreloaderManager.has(vSource))
  {
    this.debug("Reuse QxImagePreloader in old-style!");
    this.debug("Please use QxImagePreloaderManager.create(source) instead!");

    return QxImagePreloaderManager.get(vSource);
  };

  QxTarget.call(this);

  // Create Image-Node
  this._element = new Image;

  // This is needed for wrapping event to the object
  this._element._QxImagePreloader = this;

  // Define handler if image events occurs
  this._element.onload = QxImagePreloader.__onload;
  this._element.onerror = QxImagePreloader.__onerror;

  // Set Source
  this._source = vSource;
  this._element.src = vSource;

  // Set PNG State
  if (QxClient.isMshtml()) {
    this._isPng = /\.png$/i.test(this._element.nameProp);
  };

  QxImagePreloaderManager.add(this);
};

QxImagePreloader.extend(QxTarget, "QxImagePreloader");





/*
---------------------------------------------------------------------------
  GETTER
---------------------------------------------------------------------------
*/

QxImagePreloader.get = function(vSource)
{

};






/*
---------------------------------------------------------------------------
  STATE MANAGERS
---------------------------------------------------------------------------
*/

proto._source = null;
proto._isLoaded = false;
proto._isErroneous = false;





/*
---------------------------------------------------------------------------
  CROSSBROWSER GETTERS
---------------------------------------------------------------------------
*/

proto.getUri = function() { return this._source; };
proto.getSource = function() { return this._source; };
proto.isLoaded = function() { return this._isLoaded; };
proto.isErroneous = function() { return this._isErroneous; };

// only used in mshtml: true when the image format is in png
proto._isPng = false;
proto.getIsPng = function() { return this._isPng; };

if(QxClient.isGecko())
{
  proto.getWidth = function() { return this._element.naturalWidth; };
  proto.getHeight = function() { return this._element.naturalHeight; };
}
else
{
  proto.getWidth = function() { return this._element.width; };
  proto.getHeight = function() { return this._element.height; };
};





/*
---------------------------------------------------------------------------
  EVENT MAPPING
---------------------------------------------------------------------------
*/

QxImagePreloader.__onload = function() { this._QxImagePreloader._onload(); };
QxImagePreloader.__onerror = function() { this._QxImagePreloader._onerror(); };

proto._onload = function()
{
  this._isLoaded = true;
  this._isErroneous = false;

  if (this.hasEventListeners(QxConst.EVENT_TYPE_LOAD)) {
    this.dispatchEvent(new QxEvent(QxConst.EVENT_TYPE_LOAD), true);
  };
};

proto._onerror = function()
{
  this.debug("Could not load: " + this._source);

  this._isLoaded = false;
  this._isErroneous = true;

  if (this.hasEventListeners(QxConst.EVENT_TYPE_ERROR)) {
    this.dispatchEvent(new QxEvent(QxConst.EVENT_TYPE_ERROR), true);
  };
};




/*
---------------------------------------------------------------------------
  DISPOSER
---------------------------------------------------------------------------
*/

proto.dispose = function()
{
  if(this.getDisposed()) {
    return;
  };

  if (this._element)
  {
    this._element.onload = this._element.onerror = null;
    this._element._QxImagePreloader = null;
    this._element = null;
  };

  this._isLoaded = this._isErroneous = this._isPng = false;

  return QxTarget.prototype.dispose.call(this);
};
