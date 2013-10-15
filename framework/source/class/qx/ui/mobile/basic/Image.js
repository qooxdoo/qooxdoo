/* ************************************************************************

   qooxdoo - the new era of web development

   http://qooxdoo.org

   Copyright:
     2004-2011 1&1 Internet AG, Germany, http://www.1und1.de

   License:
     LGPL: http://www.gnu.org/licenses/lgpl.html
     EPL: http://www.eclipse.org/org/documents/epl-v10.php
     See the LICENSE file in the project's top-level directory for details.

   Authors:
     * Tino Butz (tbtz)

************************************************************************ */

/**
 * The image widget displays an image file.
 *
 * *Example*
 *
 * Here is a little example of how to use the widget.
 *
 * <pre class='javascript'>
 *   var image = new qx.ui.mobile.basic.Image("path/to/icon.png");
 *
 *   this.getRoot().add(image);
 * </pre>
 *
 * This example create a widget to display the image
 * <code>path/to/icon.png</code>.
 *
 */
qx.Class.define("qx.ui.mobile.basic.Image",
{
  extend : qx.ui.mobile.core.Widget,



  /*
  *****************************************************************************
     CONSTRUCTOR
  *****************************************************************************
  */

  /**
   * @param source {String?null} The URL of the image to display.
   */
  construct : function(source)
  {
    this.base(arguments);
    if (source) {
      this.setSource(source);
    } else {
      this.initSource();
    }

    qx.core.Init.getApplication().getRoot().addListener("changeScaleFactor", this._onChangeScaleFactor, this);
  },



  /*
  *****************************************************************************
     EVENTS
  *****************************************************************************
  */

  events :
  {
    /**
     * Fired if the image source can not be loaded.
     */
    loadingFailed : "qx.event.type.Event",


    /**
     * Fired if the image has been loaded.
     */
    loaded : "qx.event.type.Event"
  },


  statics :
  {
    /** @type {Array} Possible pixel ratios of the current device operating system */
    PIXEL_RATIOS : null
  },


  /*
  *****************************************************************************
     PROPERTIES
  *****************************************************************************
  */

  properties :
  {
    /**
     * The URL of the image to display.
     */
    source :
    {
      check : "String",
      nullable : true,
      init : null,
      apply : "_applySource"
    }
  },




  /*
  *****************************************************************************
     MEMBERS
  *****************************************************************************
  */

  members :
  {
    // overridden
    _getTagName : function() {
      return "img";
    },


    // property apply
    _applySource : function(value, old)
    {
      var source = value;
      var highResolutionSource = null;
      if (source && source.indexOf('data:') != 0) {
        var resourceManager = qx.util.ResourceManager.getInstance();

        // If a high resolution display was detected, search for a high resolution source.
        // Calculate the optimal ratio, based the the rem scale factor of the application and the device pixel ratio.
        var optimalRatio = qx.core.Environment.get("device.pixelRatio") * qx.core.Init.getApplication().getRoot().getScaleFactor();  
        if(optimalRatio > 1) {
          highResolutionSource = this._findHighResolutionSource(source, optimalRatio);
        }
        this._setStyle("width", resourceManager.getImageWidth(source) / 16 + "rem");
        this._setStyle("height", resourceManager.getImageHeight(source) / 16 + "rem");

        source = resourceManager.toUri(source);

        var ImageLoader = qx.io.ImageLoader;
        if (!ImageLoader.isFailed(source) && !ImageLoader.isLoaded(source)) {
          ImageLoader.load(source, this.__loaderCallback, this);
        }
      }
      this._setSource(source);
      if(highResolutionSource != null) {
        // Replace source through transparent pixel, for showing high resolution background image.
        this._setSource("data:image/gif;base64,R0lGODlhAQABAIAAAAAAAP///yH5BAEAAAAALAAAAAABAAEAAAIBRAA7");
      }
    },


    /**
    * Event handler for "changeScaleFactor" on application root.
    * Reloads the image source.
    */
    _onChangeScaleFactor : function() {
      this._applySource(this.getSource());
    },


    /**
    * Detects whether there is a high resolution image available.
    * A high resolution image is assumed to have the same file name as
    * the parameter source, but with a pixelRatio identifier before the file
    * extension, like "@2x".
    * Medium Resolution: "example.png", high resolution: "example@2x.png"
    * If an image with a higher resolution is available, the method
    * "_createHighResolutionOverlay" is called.
    *
    * @param source {String} source of the medium resolution image.
    * @param optimalRatio {Number} the optimalRatio calculated in relation to device pixel ratio and application's scale factor. 
    * @return {String} the source of the high resolution image.
    */
    _findHighResolutionSource : function(source, optimalRatio) {
      var pixelRatioCandidates = qx.ui.mobile.basic.Image.PIXEL_RATIOS;

      var highestRatio = null;

      // Search for the image for nearest available resolution.
      for (var i = 0; i < pixelRatioCandidates.length; i++) {
        var highResSource = this._getHighResolutionSource(source, pixelRatioCandidates[i]);
        if (highResSource != null && qx.util.ResourceManager.getInstance().has(highResSource)) {
          if (highestRatio == null || pixelRatioCandidates[i] > highestRatio) {
            highestRatio = pixelRatioCandidates[i];
          }

          if (pixelRatioCandidates[i] >= optimalRatio) {
            this._createHighResolutionOverlay(pixelRatioCandidates[i], source, highResSource);
            return highResSource;
          }
        }
      };

      // Use image with highest resolution available.
      if (highestRatio != null) {
        var highResSource = this._getHighResolutionSource(source, highestRatio);
        this._createHighResolutionOverlay(highestRatio, source, highResSource);
        return highResSource;
      }

      return null;
    },


    /**
    * Returns the source name for the high resolution image based on the passed 
    * parameters.
    * @param source {String} the source of the medium resolution image.
    * @param pixelRatio {Number} the pixel ratio of the high resolution image.  
    */
    _getHighResolutionSource : function(source, pixelRatio) {
      var fileExtIndex = source.lastIndexOf('.');
      if (fileExtIndex > -1) {
        var pixelRatioIdentifier = "@" + pixelRatio + "x";
        return source.slice(0, fileExtIndex) + pixelRatioIdentifier + source.slice(fileExtIndex);
      }
      return null;
    },


    /**
    * Creates an overlay for this image, which show the image defined by the parameter 'highResSource',
    * but has the same size and position as the image defined by parameter "source".
    * The original image widget is hidden by this method.
    *
    * @param pixelRatio {String} pixel ratio of the high resolution image.
    * @param source {String} Image source of the medium resolution image.
    * @param highResSource {String} Image source of the high resolution image.
    */
    _createHighResolutionOverlay : function(pixelRatio, source, highResSource) {
      this._setStyle("background-image","url("+qx.util.ResourceManager.getInstance().toUri(highResSource)+")");
      this._setStyle("background-size","100%");
      this._setStyle("background-repeat","no-repeat");
      this._setStyle("background-position","50% 50%");
    },


    /**
     * Event handler fired after the preloader has finished loading the icon
     *
     * @param source {String} Image source which was loaded
     * @param imageInfo {Map} Dimensions of the loaded image
     */
    __loaderCallback : function(source, imageInfo)
    {
      // Ignore the callback on already disposed images
      if (this.$$disposed === true) {
        return;
      }

      // Output a warning if the image could not loaded and quit
      if (imageInfo.failed)
      {
        this.warn("Image could not be loaded: " + source);
        this.fireEvent("loadingFailed");
      }
      else if (imageInfo.aborted)
      {
        // ignore the rest because it is aborted
        return;
      }
      else
      {
        this.fireEvent("loaded");
      }
      this._domUpdated();
    },


    /**
     * Sets the source attribute of the image tag.
     *
     * @param source {String} Image source which was loaded
     */
    _setSource : function(source)
    {
      this._setAttribute("src", source);
    },


    /**
     * Sets the attribute draggable to the given value "isDraggable".
     * @param isDraggable {Boolean} target value.
     */
    setDraggable : function(isDraggable) {
      if(isDraggable){
        this._setAttribute("draggable", "true");
      } else {
        this._setAttribute("draggable", "false");
      }
    }
  },


  defer : function(statics) {
    statics.PIXEL_RATIOS = ["1.5","2","3"];
  },


  destruct : function() {
    qx.core.Init.getApplication().getRoot().removeListener("changeScaleFactor", this._onChangeScaleFactor, this);
  }
});
