/* ************************************************************************

   qooxdoo - the new era of web development

   http://qooxdoo.org

   Copyright:
     2004-2008 1&1 Internet AG, Germany, http://www.1und1.de

   License:
     LGPL: http://www.gnu.org/licenses/lgpl.html
     EPL: http://www.eclipse.org/org/documents/epl-v10.php
     See the LICENSE file in the project's top-level directory for details.

   Authors:
     * Fabian Jakobs (fjakobs)
     * Sebastian Werner (wpbasti)

************************************************************************ */

/**
 * The image class displays an image file
 *
 * This class supports image clipping, which means that multiple images can be combined
 * into one large image and only the relevant part is shown.
 *
 * *Example*
 *
 * Here is a little example of how to use the widget.
 *
 * <pre class='javascript'>
 *   var image = new qx.ui.basic.Image("icon/32/actions/format-justify-left.png");
 *
 *   this.getRoot().add(image);
 * </pre>
 *
 * This example create a widget to display the image
 * <code>icon/32/actions/format-justify-left.png</code>.
 *
 * *External Documentation*
 *
 * <a href='http://qooxdoo.org/documentation/0.8/widget/Image' target='_blank'>
 * Documentation of this widget in the qooxdoo wiki.</a>
 */
qx.Class.define("qx.ui.basic.Image",
{
  extend : qx.ui.core.Widget,



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
    }
  },




  /*
  *****************************************************************************
     PROPERTIES
  *****************************************************************************
  */

  properties :
  {
    /** The URL of the image */
    source :
    {
      check : "String",
      init : null,
      nullable : true,
      event : "changeSource",
      apply : "_applySource",
      themeable : true
    },


    /**
     * Whether the image should be scaled to the given dimensions
     *
     * This is disabled by default because it prevents the usage
     * of image clipping when enabled.
     */
    scale :
    {
      check : "Boolean",
      init : false,
      themeable : true,
      apply : "_applyScale"
    },


    // overridden
    appearance :
    {
      refine : true,
      init : "image"
    },


    // overridden
    allowShrinkX :
    {
      refine : true,
      init : false
    },


    // overridden
    allowShrinkY :
    {
      refine : true,
      init : false
    },


    // overridden
    allowGrowX :
    {
      refine : true,
      init : false
    },


    // overridden
    allowGrowY :
    {
      refine : true,
      init : false
    }
  },



  /*
  *****************************************************************************
     MEMBERS
  *****************************************************************************
  */

  members :
  {
    __width : null,
    __height : null,



    /*
    ---------------------------------------------------------------------------
      WIDGET API
    ---------------------------------------------------------------------------
    */

    // overridden
    _createContentElement : function() {
      return new qx.html.Image();
    },


    // overridden
    _getContentHint : function()
    {
      return {
        width : this.__width || 0,
        height : this.__height || 0
      };
    },





    /*
    ---------------------------------------------------------------------------
      IMAGE API
    ---------------------------------------------------------------------------
    */

    // property apply, overridden
    _applyEnabled : function(value, old)
    {
      this.base(arguments, value, old);

      if (this.getSource()) {
        this._styleSource();
      }
    },


    // property apply
    _applySource : function(value) {
      this._styleSource();
    },


    // property apply
    _applyScale : function(value)
    {
      var el = this.getContentElement();
      el.setScale(value);
    },


    /**
     * Applies the source to the clipped image instance or preload
     * a image to detect sizes and apply it afterwards.
     *
     * @return {void}
     */
    _styleSource : function()
    {
      var source = qx.util.AliasManager.getInstance().resolve(this.getSource());
      var el = this.getContentElement();

      if (!source)
      {
        el.resetSource();
        return;
      }

      // Detect if the image registry knows this image
      if (qx.util.ResourceManager.getInstance().has(source)) {
        this.__setManagedImage(el, source);
      } else if (qx.io2.ImageLoader.isLoaded(source)) {
        this.__setUnmanagedImage(el, source);
      } else {
        this.__loadUnmanagedImage(el, source);
      }
    },


    /**
     * Use the ResourceManager to set a managed image
     *
     * @param el {Element} image DOM element
     * @param source {String} source path
     * @return {void}
     */
    __setManagedImage : function(el, source)
    {
      var ResourceManager = qx.util.ResourceManager.getInstance();

      // Try to find a disabled image in registry
      if (!this.getEnabled())
      {
        var disabled = source.replace(/\.([a-z]+)$/, "-disabled.$1");
        if (ResourceManager.has(disabled))
        {
          source = disabled;
          this.addState("replacement");
        }
        else
        {
          this.removeState("replacement");
        }
      }

      // Optimize case for enabled changes when no disabled image was found
      if (el.getSource() === source) {
        return;
      }

      // Apply source
      el.setSource(source);

      // Compare with old sizes and relayout if necessary
      this.__updateContentHint(ResourceManager.getImageWidth(source),
        ResourceManager.getImageHeight(source));
    },


    /**
     * Use the infos of the ImageLoader to set an unmanaged image
     *
     * @param el {Element} image DOM element
     * @param source {String} source path
     * @return {void}
     */
    __setUnmanagedImage : function(el, source)
    {
      var ImageLoader = qx.io2.ImageLoader;

      // Apply source
      el.setSource(source);

      // Compare with old sizes and relayout if necessary
      var width = ImageLoader.getWidth(source);
      var height = ImageLoader.getHeight(source);
      this.__updateContentHint(width, height);
    },


    /**
     * Use the ImageLoader to load an unmanaged image
     *
     * @param el {Element} image DOM element
     * @param source {String} source path
     * @return {void}
     */
    __loadUnmanagedImage : function(el, source)
    {
      var ImageLoader = qx.io2.ImageLoader;

      if (qx.core.Variant.isSet("qx.debug", "on"))
      {
        // loading external images via HTTP/HTTPS is a common usecase
        if (!qx.lang.String.startsWith(source.toLowerCase(), "http"))
        {
          var self = this.self(arguments);

          if (!self.__warned) {
            self.__warned = {};
          }

          if (!self.__warned[source])
          {
            this.debug("try to load a unmanaged relative image: " + source);
            self.__warned[source] = true;
          }
        }
      }

      // only try to load the image if it not already failed
      if(!ImageLoader.isFailed(source)) {
        ImageLoader.load(source, this.__loaderCallback, this);
      } else {
        if (el != null) {
          el.resetSource();
        }
      }
    },


    /**
     * Event handler fired after the preloader has finished loading the icon
     *
     * @param source {String} Image source which was loaded
     * @param imageInfo {Map} Dimensions of the loaded image
     * @return {void}
     */
    __loaderCallback : function(source, imageInfo)
    {
      // Ignore when the source has already been modified
      if (source !== qx.util.AliasManager.getInstance().resolve(this.getSource())) {
        return;
      }

      // Output a warning if the image could not loaded and quit
      if (imageInfo.failed) {
        this.warn("Image could not be loaded: " + source);
      }

      // Update image (again)
      this._styleSource();
    },


    /**
     * Updates the content hint when the image size has been changed
     *
     * @param width {Integer} width of the image
     * @param height {Integer} height of the image
     * @return {void}
     */
    __updateContentHint : function(width, height)
    {
      // Compare with old sizes and relayout if necessary
      if (width !== this.__width || height !== this.__height)
      {
        this.__width = width;
        this.__height = height;

        qx.ui.core.queue.Layout.add(this);
      }
    }
  }
});