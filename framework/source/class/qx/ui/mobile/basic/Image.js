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
    PIXEL_RATIOS : null,

    /** @type {String} CSS rule for the high resolution overlay */
    HIGH_RES_CSS_RULE : "",

    /** @type {CSSStyleSheet} CSS stylesheet containing high resolution overlay elements */
    STYLESHEET : null
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
      if (source && source.indexOf('data:') != 0) {
        var resourceManager = qx.util.ResourceManager.getInstance();

        // If a high resolution display is available, search for a high resolution source.
        if(qx.core.Environment.get("device.pixelRatio") > 1) {
          var highResolutionSource = this._findHighResolutionSource(source);
          if(highResolutionSource != null) {
            source = highResolutionSource;
          }
        }
        source = resourceManager.toUri(source);

        var ImageLoader = qx.io.ImageLoader;
        if (!ImageLoader.isFailed(source) && !ImageLoader.isLoaded(source)) {
          ImageLoader.load(source, this.__loaderCallback, this);
        }
      }
      this._setSource(source);
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
    * @return {String} the source of the high resolution image.
    */
    _findHighResolutionSource : function(source) {
      var pixelRatioCandidates = qx.ui.mobile.basic.Image.PIXEL_RATIOS;
      for (var i = 0; i < pixelRatioCandidates.length; i++) {
        var targetPixelRatio = pixelRatioCandidates[i];

        var fileExtIndex = source.lastIndexOf('.');
        if (fileExtIndex > -1) {
          var pixelRatioIdentifier = "@" + targetPixelRatio + "x";
          var highResSource = source.slice(0, fileExtIndex) + pixelRatioIdentifier + source.slice(fileExtIndex);

          if (qx.util.ResourceManager.getInstance().has(highResSource)) {
            this._createHighResolutionOverlay(targetPixelRatio, source, highResSource);
            return highResSource;
          }
        }
      };
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
      var resourceManager = qx.util.ResourceManager.getInstance();

      var scale = (1 / pixelRatio);
      scale = (Math.round(scale * 100) / 100);

      // Activate sub-pixel rendering on iOS
      if (qx.core.Environment.get("os.name") == "ios") {
        scale = scale + 0.01;
      }

      var srcWidth = resourceManager.getImageWidth(source);
      var srcHeight = resourceManager.getImageHeight(source);
      var highResSrcWidth = resourceManager.getImageWidth(highResSource);
      var highResSrcHeight = resourceManager.getImageHeight(highResSource);

      var offsetX = (highResSrcWidth - srcWidth) / 2;
      var offsetY = (highResSrcHeight - srcHeight) / 2;

      // Fix image size to lower resolution image size.
      this._setAttribute("width", srcWidth);
      this._setAttribute("height", srcHeight);

      var selector = "#" + this.getId() + ":before";
      var values = [highResSrcWidth, highResSrcHeight, resourceManager.toUri(highResSource), -offsetY, -offsetX, scale];
      var entry = qx.lang.String.format(qx.ui.mobile.basic.Image.HIGH_RES_CSS_RULE, values);

      qx.bom.Stylesheet.addRule(qx.ui.mobile.basic.Image.STYLESHEET, selector, entry);

      this.addCssClass("no-content");
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
    statics.STYLESHEET = qx.bom.Stylesheet.createElement();

    if(qx.core.Environment.get("device.pixelRatio") > 1) {
      if (qx.core.Environment.get("os.name") == "ios") {
        statics.PIXEL_RATIOS = ["2"];
      } else {
        statics.PIXEL_RATIOS = [qx.core.Environment.get("device.pixelRatio"),"3","2","1.5"];
      }
    }

    var transform = qx.core.Environment.get("css.transform");
    if (transform) {
      statics.HIGH_RES_CSS_RULE = "width:%1px; height:%2px; background-image: url('%3'); top:%4px; left:%5px; " + qx.bom.Style.getCssName(transform.name) + ":scale(%6);";
    }
  }
});
