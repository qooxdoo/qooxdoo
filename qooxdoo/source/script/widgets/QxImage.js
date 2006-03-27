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
#package(guicore)
#post(QxImageManager)
#post(QxImagePreloader)

************************************************************************ */

/*!
  This widget is for all images in qooxdoo projects.
*/
function QxImage(vSource, vWidth, vHeight)
{
  QxTerminator.call(this);

  // Reset Alt and Title
  this.setHtmlProperty(QxImage.ATTR_ALT, QxConst.CORE_EMPTY);
  this.setHtmlProperty(QxImage.ATTR_TITLE, QxConst.CORE_EMPTY);

  // Apply constructor arguments
  this.setSource(QxUtil.isValid(vSource) ? vSource : QxImageManager.buildUri(QxConst.IMAGE_BLANK));

  // Dimensions
  this.setWidth(QxUtil.isValid(vWidth) ? vWidth : QxConst.CORE_AUTO);
  this.setHeight(QxUtil.isValid(vHeight) ? vHeight : QxConst.CORE_AUTO);

  // Prohibit selection
  this.setSelectable(false);
};

QxImage.extend(QxTerminator, "QxImage");

QxImage.ATTR_ALT = QxConst.KEY_ALT;
QxImage.ATTR_TITLE = "title";

QxImage.BORDER_NONE = "0 none";
QxImage.RESET_VALIGN = "top";


/*
---------------------------------------------------------------------------
  PROPERTIES
---------------------------------------------------------------------------
*/

/*!
  The source uri of the image.
*/
QxImage.addProperty({ name : "source", type : QxConst.TYPEOF_STRING });

/*!
  The assigned preloader instance of the image.
*/
QxImage.addProperty({ name : "preloader", type : QxConst.TYPEOF_OBJECT });

/*!
  The loading status.

  True if the image is loaded correctly. False if no image is loaded
  or the one that should be loaded is currently loading or not available.
*/
QxImage.addProperty({ name : "loaded", type : QxConst.TYPEOF_BOOLEAN, defaultValue : false });

/*!
  Should the image be maxified in it's own container?
*/
QxImage.addProperty({ name : "resizeToInner", type : QxConst.TYPEOF_BOOLEAN, defaultValue : false });

/*!
  Appearance of the widget
*/
QxImage.changeProperty({ name : "appearance", type : QxConst.TYPEOF_STRING, defaultValue : "image" });





/*
---------------------------------------------------------------------------
  EVENT MAPPERS
---------------------------------------------------------------------------
*/

proto._onload = function() {
  this.setLoaded(true);
};

proto._onerror = function()
{
  this.debug("Could not load: " + this.getSource());

  this.setLoaded(false);

  if (this.hasEventListeners(QxConst.EVENT_TYPE_ERROR)) {
    this.dispatchEvent(new QxEvent(QxConst.EVENT_TYPE_ERROR), true);
  };
};





/*
---------------------------------------------------------------------------
  DISPLAYBLE HANDLING
---------------------------------------------------------------------------
*/

proto._beforeAppear = function()
{
  var vSource = this.getSource();

  if (QxUtil.isValidString(vSource)) {
    QxImageManager._sources[vSource]++;
  };

  return QxTerminator.prototype._beforeAppear.call(this);
};

proto._beforeDisappear = function()
{
  var vSource = this.getSource();

  if (QxUtil.isValidString(vSource))
  {
    if (QxImageManager._sources[vSource] == 1)
    {
      delete QxImageManager._sources[vSource];
    }
    else
    {
      QxImageManager._sources[vSource]--;
    };
  };

  return QxTerminator.prototype._beforeDisappear.call(this);
};





/*
---------------------------------------------------------------------------
  MODIFIERS
---------------------------------------------------------------------------
*/

proto._modifySource = function(propValue, propOldValue, propData)
{
  if (propValue && typeof QxImageManager._sources[propValue] === QxConst.TYPEOF_UNDEFINED) {
    QxImageManager._sources[propValue] = 0;
  };

  if (propOldValue)
  {
    if (QxImageManager._sources[propValue] == 1)
    {
      delete QxImageManager._sources[propValue];
    }
    else
    {
      QxImageManager._sources[propValue]--;
    };
  };

  if (this.isCreated())
  {
    if (propValue)
    {
      this.setPreloader(QxImagePreloaderManager.create(QxImageManager.buildUri(propValue)));
    }
    else if (propOldValue)
    {
      this._resetContent();
      this.setPreloader(null);
    };
  };

  return true;
};

proto._modifyPreloader = function(propValue, propOldValue, propData)
{
  if (propOldValue)
  {
    // remove event connection
    propOldValue.removeEventListener(QxConst.EVENT_TYPE_LOAD, this._onload, this);
    propOldValue.removeEventListener(QxConst.EVENT_TYPE_ERROR, this._onerror, this);
  };

  if (propValue)
  {
    // Register to image manager
    QxImageManager.add(this);

    // Omit  here, otherwise the later setLoaded(true)
    // will not be executed (prevent recursion)

    // Changed: Use forceLoaded instead of setLoaded => should be faster
    this.forceLoaded(false);

    if (propValue.isErroneous())
    {
      this._onerror();
    }
    else if (propValue.isLoaded())
    {
      this.setLoaded(true);
    }
    else
    {
      propValue.addEventListener(QxConst.EVENT_TYPE_LOAD, this._onload, this);
      propValue.addEventListener(QxConst.EVENT_TYPE_ERROR, this._onerror, this);
    };
  }
  else
  {
    // Remove from image manager
    QxImageManager.remove(this);

    this.setLoaded(false);
  };

  return true;
};

proto._modifyLoaded = function(propValue, propOldValue, propData)
{
  if (propValue && this.isCreated())
  {
    this._applyContent();
  }
  else if (!propValue)
  {
    this._invalidatePreferredInnerWidth();
    this._invalidatePreferredInnerHeight();
  };

  return true;
};

proto._modifyElement = function(propValue, propOldValue, propData)
{
  if (propValue)
  {
    if (!this._image)
    {
      this._image = new Image;

      // Possible alternative for MSHTML for PNG images
      // But it seems not to be faster
      // this._image = document.createElement(QxConst.CORE_DIV);

      // this costs much performance, move setup to blank gif to error handling
      // is this SSL save?
      // this._image.src = QxImageManager.buildUri(QxConst.IMAGE_BLANK);

      this._image.style.border = QxImage.BORDER_NONE;
      this._image.style.verticalAlign = QxImage.RESET_VALIGN;

      if (!QxClient.isMshtml()) {
        this._applyEnabled();
      };
    };

    propValue.appendChild(this._image);
  };

  // call widget implmentation
  QxTerminator.prototype._modifyElement.call(this, propValue, propOldValue, propData);

  if (propValue)
  {
    // initialisize preloader
    var vSource = this.getSource();
    if (QxUtil.isValidString(vSource)) {
      this.setPreloader(QxImagePreloaderManager.create(QxImageManager.buildUri(vSource)));
    };
  };

  return true;
};





/*
---------------------------------------------------------------------------
  CLIENT OPTIMIZED MODIFIERS
---------------------------------------------------------------------------
*/

proto._postApply = function()
{
  if (!this.getLoaded()) {
    return;
  };

  this._postApplyDimensions();
  this._updateContent();
};

if (QxClient.isMshtml())
{
  QxImage.IMGLOADER_START = "progid:DXImageTransform.Microsoft.AlphaImageLoader(src='";
  QxImage.IMGLOADER_STOP = "',sizingMethod='scale')";
  QxImage.FILTER_GRAY = "Gray() Alpha(Opacity=30)";

  proto._modifyEnabled = function(propValue, propOldValue, propData)
  {
    if (this._image) {
      this._applyEnabled();
    };

    return QxTerminator.prototype._modifyEnabled.call(this, propValue, propOldValue, propData);
  };

  proto._updateContent = function(vSource)
  {
    var i = this._image;
    var pl = this.getPreloader();

    if (pl.getIsPng() && this.getEnabled())
    {
      i.src = QxImageManager.buildUri(QxConst.IMAGE_BLANK);
      i.style.filter = QxImage.IMGLOADER_START + (vSource || pl.getSource()) + QxImage.IMGLOADER_STOP;
    }
    else
    {
      i.src = vSource || pl.getSource();
      i.style.filter = this.getEnabled() ? QxConst.CORE_EMPTY : QxImage.FILTER_GRAY;
    };
  };

  proto._resetContent = function()
  {
    var i = this._image;

    i.src = QxImageManager.buildUri(QxConst.IMAGE_BLANK);
    i.style.filter = QxConst.CORE_EMPTY;
  };

  proto._applyEnabled = proto._postApply;
}
else
{
  proto._postApply = function()
  {
    if (!this.getLoaded()) {
      return;
    };

    this._postApplyDimensions();
    this._updateContent();
  };

  proto._updateContent = function(vSource) {
    this._image.src = vSource || this.getPreloader().getSource();
  };

  proto._resetContent = function() {
    this._image.src = QxImageManager.buildUri(QxConst.IMAGE_BLANK);
  };

  proto._applyEnabled = function()
  {
    if (this._image)
    {
      var o = this.getEnabled() ? QxConst.CORE_EMPTY : 0.3;
      var s = this._image.style;

      s.opacity = s.KhtmlOpacity = s.MozOpacity = o;
    };
  };

  proto._modifyEnabled = function(propValue, propOldValue, propData)
  {
    if (this._image) {
      this._applyEnabled();
    };

    return QxTerminator.prototype._modifyEnabled.call(this, propValue, propOldValue, propData);
  };
};







/*
---------------------------------------------------------------------------
  PREFERRED DIMENSIONS: INNER
---------------------------------------------------------------------------
*/

proto._computePreferredInnerWidth = function()
{
  if (this.getLoaded())
  {
    return this.getPreloader().getWidth();
  }
  else if (QxUtil.isValidString(this.getSource()))
  {
    var vPreloader = QxImagePreloaderManager.get(QxImageManager.buildUri(this.getSource()));

    if (vPreloader && vPreloader.isLoaded()) {
      return vPreloader.getWidth();
    };
  };

  return 0;
};

proto._computePreferredInnerHeight = function()
{
  if (this.getLoaded())
  {
    return this.getPreloader().getHeight();
  }
  else if (QxUtil.isValidString(this.getSource()))
  {
    var vPreloader = QxImagePreloaderManager.get(QxImageManager.buildUri(this.getSource()));

    if (vPreloader && vPreloader.isLoaded()) {
      return vPreloader.getHeight();
    };
  };

  return 0;
};







/*
---------------------------------------------------------------------------
  APPLY
---------------------------------------------------------------------------
*/

proto._applyContent = function()
{
  QxTerminator.prototype._applyContent.call(this);

  // Images load asyncron, so we need to force flushing here
  // to get an up-to-date view when an image is loaded.
  QxWidget.flushGlobalQueues();
};

if (QxClient.isMshtml())
{
  proto._postApplyDimensions = function()
  {
    try
    {
      var vImageStyle = this._image.style;

      if (this.getResizeToInner())
      {
        vImageStyle.pixelWidth = this.getInnerWidth();
        vImageStyle.pixelHeight = this.getInnerHeight();
      }
      else
      {
        vImageStyle.pixelWidth = this.getPreferredInnerWidth();
        vImageStyle.pixelHeight = this.getPreferredInnerHeight();
      };
    }
    catch(ex)
    {
      this.error(ex, "_postApplyDimensions");
    };
  };
}
else
{
  proto._postApplyDimensions = function()
  {
    try
    {
      var vImageNode = this._image;

      if (this.getResizeToInner())
      {
        vImageNode.width = this.getInnerWidth();
        vImageNode.height = this.getInnerHeight();
      }
      else
      {
        vImageNode.width = this.getPreferredInnerWidth();
        vImageNode.height = this.getPreferredInnerHeight();
      };
    }
    catch(ex)
    {
      this.error(ex, "_postApplyDimensions");
    };
  };
};




/*
---------------------------------------------------------------------------
  CHANGES IN DIMENSIONS
---------------------------------------------------------------------------
*/

if (QxClient.isMshtml())
{
  proto._changeInnerWidth = function(vNew, vOld)
  {
    if (this.getResizeToInner()) {
      this._image.style.pixelWidth = vNew;
    };
  };

  proto._changeInnerHeight = function(vNew, vOld)
  {
    if (this.getResizeToInner()) {
      this._image.style.pixelHeight = vNew;
    };
  };
}
else
{
  proto._changeInnerWidth = function(vNew, vOld)
  {
    if (this.getResizeToInner()) {
      this._image.width = vNew;
    };
  };

  proto._changeInnerHeight = function(vNew, vOld)
  {
    if (this.getResizeToInner()) {
      this._image.height = vNew;
    };
  };
};





/*
---------------------------------------------------------------------------
  DISPOSER
---------------------------------------------------------------------------
*/

proto.dispose = function()
{
  if (this.getDisposed()) {
    return true;
  };

  var vPreloader = this.getPreloader();
  if (vPreloader)
  {
    // remove event connection
    vPreloader.removeEventListener(QxConst.EVENT_TYPE_LOAD, this._onload, this);
    vPreloader.removeEventListener(QxConst.EVENT_TYPE_ERROR, this._onerror, this);

    this.forcePreloader(null);
  };

  if (this._image)
  {
    // Remove leaking filter attribute before leaving page
    this._image.style.filter = QxConst.CORE_EMPTY;
    this._image = null;
  };

  QxImageManager.remove(this);

  return QxTerminator.prototype.dispose.call(this);
};
