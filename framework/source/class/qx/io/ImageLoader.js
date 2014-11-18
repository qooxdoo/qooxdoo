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

************************************************************************ */

/**
 * The ImageLoader can preload and manage loaded image resources. It easily
 * handles multiple requests and supports callbacks for successful and failed
 * requests.
 *
 * After loading of an image the dimension of the image is stored as long
 * as the application is running. This is quite useful for in-memory layouting.
 *
 * Use {@link #load} to preload your own images.
 */
qx.Bootstrap.define("qx.io.ImageLoader",
{
  /*
  *****************************************************************************
     STATICS
  *****************************************************************************
  */

  statics :
  {
    /** @type {Map} Internal data structure to cache image sizes */
    __data : {},

    /** @type {Map} Default image size */
    __defaultSize :
    {
      width : null,
      height : null
    },

    /** @type {RegExp} Known image types */
    __knownImageTypesRegExp : /\.(png|gif|jpg|jpeg|bmp)\b/i,

    /** @type {RegExp} Image types of a data URL */
    __dataUrlRegExp : /^data:image\/(png|gif|jpg|jpeg|bmp)\b/i,

    /**
     * Whether the given image has previously been loaded using the
     * {@link #load} method.
     *
     * @param source {String}
     *   Image source to query
     *
     * @return {Boolean}
     *   <code>true</code>  the image is loaded
     *   <code>false</code> the image is not loaded
     */
    isLoaded : function(source)
    {
      var entry = this.__data[source];

      return !!(entry && entry.loaded);
    },

    /**
     * Whether the given image has previously been requested using the
     * {@link #load} method but failed.
     *
     * @param source {String}
     *   Image source to query
     *
     * @return {Boolean}
     *   <code>true</code>  the image loading failed
     *   <code>false</code> the image loading succeeded
     */
    isFailed : function(source)
    {
      var entry = this.__data[source];

      return !!(entry && entry.failed);
    },

    /**
     * Whether the given image is currently loading.
     *
     * @param source {String}
     *   Image source to query
     *
     * @return {Boolean}
     *   <code>true</code>  the image is loading.
     *   <code>false</code> the image is not loading.
     */
    isLoading : function(source)
    {
      var entry = this.__data[source];

      return !!(entry && entry.loading);
    },

    /**
     * Returns the format of a previously loaded image.
     *
     * @param source {String}
     *   Image source to query
     *
     * @return {String ? null}
     *   <code><format></code> the format of the image
     *   <code>null</code>     no format
     */
    getFormat : function(source)
    {
      var entry = this.__data[source];

      if (! entry || ! entry.format)
      {
        var result = this.__dataUrlRegExp.exec(source);

        if (result != null)
        {
          // If width and height aren't defined, provide some defaults.
          var width =
            (entry && qx.lang.Type.isNumber(entry.width)
             ? entry.width
             : this.__defaultSize.width);

          var height =
            (entry && qx.lang.Type.isNumber(entry.height)
             ? entry.height
             : this.__defaultSize.height);

          entry =
            {
              loaded : true,
              format : result[1],
              width  : width,
              height : height
            };
        }
      }

      return entry ? entry.format : null;
    },

    /**
     * Returns the size of a previously loaded image.
     *
     * @param source {String}
     *   Image source to query
     *
     * @return {Map}
     *   <code>{width : w, height : h}</code>
     *   width, height the dimension of the loaded image.
     *   null, null    the image is not yet loaded
     */
    getSize : function(source)
    {
      var entry = this.__data[source];

      return entry ? { width: entry.width, height: entry.height } : this.__defaultSize;
    },

    /**
     * Returns the image width.
     *
     * @param source {String}
     *   Image source to query
     *
     * @return {Integer}
     *   <code><width></code> the image is loaded
     *   <code>null</code>    the image is not loaded
     */
    getWidth : function(source)
    {
      var entry = this.__data[source];

      return entry ? entry.width : null;
    },

    /**
     * Returns the image height.
     *
     * @param source {String}
     *   Image source to query
     *
     * @return {Integer}
     *   <code><height></code> the image is loaded
     *   <code>null</code>     the image is not loaded
     */
    getHeight : function(source)
    {
      var entry = this.__data[source];

      return entry ? entry.height : null;
    },

    /**
     * Loads the given image. Supports a callback which is
     * executed when the image is loaded.
     *
     * This method works asychronously.
     *
     * @param source {String}
     *   Image source to load
     *
     * @param callback {Function}
     *   Callback function(url, data) to execute:
     *   <code><url></code>   source URL
     *   <code><data></code>  containing additional information about the image
     *
     * @param context {Object}
     *   Context in which the given callback should be executed
     */
    load : function(source, callback, context)
    {
      // Shorthand
      var entry = this.__data[source];

      if (!entry) {
        entry = this.__data[source] = {};
      }

      // Normalize context
      if (callback && !context) {
        context = window;
      }

      // Already known image source
      if (entry.loaded || entry.loading || entry.failed)
      {
        if (callback)
        {
          if (entry.loading) {
            entry.callbacks.push(callback, context);
          } else {
            callback.call(context, source, entry);
          }
        }
      }
      else
      {
        // Updating entry
        entry.loading = true;
        entry.callbacks = [];

        if (callback) {
          entry.callbacks.push(callback, context);
        }

        // Create image element
        var el = new Image();

        // Create common callback routine
        var boundCallback = qx.lang.Function.listener(this.__onload, this, el, source);

        // Assign callback to element
        el.onload = boundCallback;
        el.onerror = boundCallback;

        // Start loading of image
        el.src = source;

        // save the element for aborting
        entry.element = el;
      }
    },

    /**
     * Abort the loading for the given url.
     *
     * @param source {String}
     *   URL of the image to abort its loading.
     */
    abort : function (source)
    {
      var entry = this.__data[source];

      if (entry && !entry.loaded)
      {
        entry.aborted = true;

        var callbacks = entry.callbacks;
        var element = entry.element;

        // Cleanup listeners
        element.onload = element.onerror = null;

        // prevent further loading
        element.src = "";

        // Cleanup entry
        delete entry.callbacks;
        delete entry.element;
        delete entry.loading;

        for (var i=0, l=callbacks.length; i<l; i+=2) {
          callbacks[i].call(callbacks[i+1], source, entry);
        }
      }

      this.__data[source] = null;
    },

    /**
     * Internal event listener for all load/error events.
     *
     * @signature function(event, element, source)
     *
     * @param event {Event}
     *   Native event object
     *
     * @param element {Element}
     *   DOM element which represents the image
     *
     * @param source {String}
     *   The image source loaded
     */
    __onload : qx.event.GlobalError.observeMethod(function(event, element, source)
    {
      // Shorthand
      var entry = this.__data[source];

      var isImageAvailable = function(imgElem) {
        return (imgElem && imgElem.height !== 0);
      };

      // [BUG #7497]: IE11 doesn't properly emit an error event
      // when loading fails so augment success check
      if (event.type === "load" && isImageAvailable(element))
      {
        // Store dimensions
        entry.loaded = true;
        entry.width = this.__getWidth(element);
        entry.height = this.__getHeight(element);

        // try to determine the image format
        var result = this.__knownImageTypesRegExp.exec(source);

        if (result != null) {
          entry.format = result[1];
        }
      }
      else
      {
        entry.failed = true;
      }

      // Cleanup listeners
      element.onload = element.onerror = null;

      // Cache callbacks
      var callbacks = entry.callbacks;

      // Cleanup entry
      delete entry.loading;
      delete entry.callbacks;
      delete entry.element;

      // Execute callbacks
      for (var i=0, l=callbacks.length; i<l; i+=2) {
        callbacks[i].call(callbacks[i+1], source, entry);
      }
    }),

    /**
     * Returns the natural width of the given image element.
     *
     * @param element {Element}
     *   DOM element which represents the image
     *
     * @return {Integer}
     *   Image width
     */
    __getWidth : function(element) {
      return qx.core.Environment.get("html.image.naturaldimensions") ?
        element.naturalWidth : element.width;
    },

    /**
     * Returns the natural height of the given image element.
     *
     * @param element {Element}
     *   DOM element which represents the image
     *
     * @return {Integer}
     *   Image height
     */
    __getHeight : function(element) {
      return qx.core.Environment.get("html.image.naturaldimensions") ?
        element.naturalHeight : element.height;
    },

    /**
     * Dispose stored images.
     */
    dispose : function() {
      this.__data = {};
    }
  }
});
