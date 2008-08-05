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
     * Sebastian Werner (wpbasti)
     * Andreas Ecker (ecker)

************************************************************************ */

/**
 * This class preloads one image and provides information about this image
 * after it is loaded.
 *
 * This class should not be used directly. Better use {@link qx.legacy.io.image.PreloaderManager}:
 *
 * <pre class='javascript'>
 * qx.legacy.io.image.PreloaderManager.getInstance().create(imageUrl)
 * </pre>
 */
qx.Class.define("qx.legacy.io.image.Preloader",
{
  extend : qx.core.Object,

  events :
  {
    /** Dispatched after the images has successfully been loaded */
    "load" : "qx.event.type.Event",

    /** Dispatched if the image could not be loaded */
    "error" : "qx.event.type.Event"
  },




  /*
  *****************************************************************************
     CONSTRUCTOR
  *****************************************************************************
  */

  /**
   * @param imageUrl {String} URL of the image to pre load
   */
  construct : function(imageUrl)
  {
    if (qx.legacy.io.image.PreloaderManager.getInstance().has(imageUrl))
    {
      this.debug("Reuse qx.legacy.io.image.Preloader in old-style!");
      this.debug("Please use qx.legacy.io.image.PreloaderManager.getInstance().create(source) instead!");

      return qx.legacy.io.image.PreloaderManager.getInstance().get(imageUrl);
    }

    this.base(arguments);

    // Create Image-Node
    // Does not work with document.createElement("img") in Webkit. Interesting.
    // Compare this to the bug in qx.ui.basic.Image.
    this._element = new Image;

    // Define handler if image events occurs
    this._element.onload = qx.lang.Function.bind(this.__onload, this);
    this._element.onerror = qx.lang.Function.bind(this.__onerror, this);

    // Set Source
    this._source = imageUrl;
    this._element.src = qx.util.ResourceManager.toUri(imageUrl);

    // Set PNG State
    if (qx.core.Variant.isSet("qx.client", "mshtml")) {
      this._isPng = /\.png$/i.test(this._element.nameProp);
    }

    qx.legacy.io.image.PreloaderManager.getInstance().add(this);
  },




  /*
  *****************************************************************************
     MEMBERS
  *****************************************************************************
  */

  members :
  {
    /*
    ---------------------------------------------------------------------------
      STATE MANAGERS
    ---------------------------------------------------------------------------
    */

    _source : null,
    _isLoaded : false,
    _isErroneous : false,




    /*
    ---------------------------------------------------------------------------
      CROSSBROWSER GETTERS
    ---------------------------------------------------------------------------
    */

    /**
     * Get the full URI of the image
     *
     * @return {String} The URI of the image
     */
    getUri : function() {
      return this._source;
    },


    /**
     * Get the full URI of the image
     *
     * @return {String} The URI of the image
     */
    getSource : function() {
      return this._source;
    },


    /**
     * Check whether the image is already loaded
     *
     * @return {Boolean} Whether the image is already loaded
     */
    isLoaded : function() {
      return this._isLoaded;
    },


    /**
     * Check whether the loading of the image failed
     *
     * @return {Boolean} Whether the loading of the image failed
     */
    isErroneous : function() {
      return this._isErroneous;
    },

    // only used in mshtml: true when the image format is in png
    _isPng : false,


    /**
     * Check whether the image format if PNG
     *
     * @return {Boolean} whether the image format if PNG
     */
    getIsPng : function() {
      // TODO should be renamedto isPng to be consistent with the rest of the framework.
      return this._isPng;
    },


    /**
     * Return the width of the image in pixel.
     *
     * @return {Integer} The width of the image in pixel.
     * @signature function()
     */
    getWidth : qx.core.Variant.select("qx.client",
    {
      "gecko" : function() {
        return this._element.naturalWidth;
      },

      "default" : function() {
        return this._element.width;
      }
    }),


    /**
     * Return the height of the image in pixel.
     *
     * @return {Integer} The height of the image in pixel.
     * @signature function()
     */
    getHeight : qx.core.Variant.select("qx.client",
    {
      "gecko" : function() {
        return this._element.naturalHeight;
      },

      "default" : function() {
        return this._element.height;
      }
    }),


    /**
     * Load handler
     *
     * @return {void}
     */
    __onload : function()
    {
      if (this._isLoaded || this._isErroneous) {
        return;
      }

      this._isLoaded = true;
      this._isErroneous = false;

      this.fireEvent("load");
    },


    /**
     * Error handler
     *
     * @return {void}
     */
    __onerror : function()
    {
      if (this._isLoaded || this._isErroneous) {
        return;
      }

      this.debug("Could not load: " + this._source);

      this._isLoaded = false;
      this._isErroneous = true;

      this.fireEvent("error");
    }
  },




  /*
  *****************************************************************************
     DESTRUCTOR
  *****************************************************************************
  */

  destruct : function()
  {
    if (this._element)
    {
      this._element.onload = this._element.onerror = null;
    }

    this._disposeFields("_element", "_isLoaded", "_isErroneous", "_isPng");
  }
});
