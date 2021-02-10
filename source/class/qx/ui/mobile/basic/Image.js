/* ************************************************************************

   qooxdoo - the new era of web development

   http://qooxdoo.org

   Copyright:
     2004-2013 1&1 Internet AG, Germany, http://www.1und1.de

   License:
     MIT: https://opensource.org/licenses/MIT
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

    if (qx.ui.mobile.basic.Image.ROOT === null) {
      qx.ui.mobile.basic.Image.ROOT = qx.core.Init.getApplication().getRoot();
    }

    if (source) {
      this.setSource(source);
    } else {
      this.initSource();
    }

    qx.ui.mobile.basic.Image.ROOT.addListener("changeAppScale", this._onChangeAppScale, this);
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
    /** @type {qx.ui.mobile.core.Root} the mobile application root */
    ROOT : null,


    /** @type {String} a 1px*1px sized transparent image. */
    PLACEHOLDER_IMAGE : null
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
    _applySource: function(value, old) {
      var resourceManager = qx.util.ResourceManager.getInstance();
      var source = value;

      if (source && source.indexOf('data:') != 0) {
        var uri = resourceManager.toUri(source);

        if (resourceManager.has(source)) {
          var highResSource = resourceManager.findHighResolutionSource(source, qx.ui.mobile.basic.Image.ROOT.getAppScale());
          if (highResSource) {
            this._createHighResolutionOverlay(highResSource,source);
            source = qx.ui.mobile.basic.Image.PLACEHOLDER_IMAGE;
            uri = resourceManager.toUri(highResSource);
          } else {
            source = uri;
          }
        }

        if (!qx.io.ImageLoader.isFailed(uri) && !qx.io.ImageLoader.isLoaded(uri)) {
          qx.io.ImageLoader.load(uri, this.__loaderCallback, this);
        }
      }

      this._setSource(source);
    },


    /**
    * Event handler for "changeAppScale" on application root.
    * Reloads the image source.
    */
    _onChangeAppScale : function() {
      this._applySource(this.getSource());
    },


    /**
    * Creates an overlay for this image which shows the image defined by the parameter 'highResSource',
    * but has the same size and position as the source image.
    * The original image widget is hidden by this method.
    *
    * @param highResSource {String} Image source of the high-resolution image.
    * @param lowResSource {String} Image source of the low-resolution image.
    */
    _createHighResolutionOverlay : function(highResSource, lowResSource) {
      // Replace the source through transparent pixel for making the high-resolution background image visible.
      var resourceManager = qx.util.ResourceManager.getInstance();
      this._setStyle("backgroundImage","url("+resourceManager.toUri(highResSource)+")");
      this._setStyle("backgroundSize","100%");
      this._setStyle("backgroundRepeat","no-repeat");
      this._setStyle("backgroundPosition","50% 50%");
      this._setStyle("width", resourceManager.getImageWidth(lowResSource) / 16 + "rem");
      this._setStyle("height", resourceManager.getImageHeight(lowResSource) / 16 + "rem");
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
    statics.PLACEHOLDER_IMAGE = "data:image/gif;base64,R0lGODlhAQABAIAAAAAAAP///yH5BAEAAAAALAAAAAABAAEAAAIBRAA7";
  },


  destruct : function() {
    qx.ui.mobile.basic.Image.ROOT.removeListener("changeAppScale", this._onChangeAppScale, this);
  }
});
