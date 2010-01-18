/* ************************************************************************

   qooxdoo - the new era of web development

   http://qooxdoo.org

   Copyright:
     2004-2009 1&1 Internet AG, Germany, http://www.1und1.de

   License:
     LGPL: http://www.gnu.org/licenses/lgpl.html
     EPL: http://www.eclipse.org/org/documents/epl-v10.php
     See the LICENSE file in the project's top-level directory for details.

   Authors:
     * Sebastian Werner (wpbasti)
     * Christian Schmidt (chris_schmidt)

************************************************************************ */

/**
 * This class has been moved to {@link qx.io.ImageLoader}
 *
 * @deprecated This class has been moved to 'qx.io.ImageLoader'
 */
qx.Class.define("qx.io2.ImageLoader",
{
  statics :
  {
    /**
     * Whether the given image has previously been loaded using the
     * {@link #load} method.
     *
     * @param source {String} Image source to query
     * @return {Boolean} <code>true</code> when the image is loaded
     *
     * @deprecated Use 'qx.io.ImageLoader.isLoaded' instead.
     */
    isLoaded : function(source)
    {
      qx.log.Logger.deprecatedMethodWarning(
        arguments.callee,
        "Use 'qx.io.ImageLoader.isLoaded' instead."
      );

      return qx.io.ImageLoader.isLoaded(source);
    },


    /**
     * Whether the given image has previously been requested using the
     * {@link #load} method but failed.
     *
     * @param source {String} Image source to query
     * @return {Boolean} <code>true</code> when the image loading failed
     *
     * @deprecated Use 'qx.io.ImageLoader.isFailed' instead.
     */
    isFailed : function(source)
    {
      qx.log.Logger.deprecatedMethodWarning(
        arguments.callee,
        "Use 'qx.io.ImageLoader.isFailed' instead."
      );

      return qx.io.ImageLoader.isFailed(source);
    },


    /**
     * Whether the given image is currently loading.
     *
     * @param source {String} Image source to query
     * @return {Boolean} <code>true</code> when the image is loading in the moment.
     *
     * @deprecated Use 'qx.io.ImageLoader.isLoading' instead.
     */
    isLoading : function(source)
    {
      qx.log.Logger.deprecatedMethodWarning(
        arguments.callee,
        "Use 'qx.io.ImageLoader.isLoading' instead."
      );

      return qx.io.ImageLoader.isLoading(source);
    },


    /**
     * Returns the format of a previously loaded image
     *
     * @param source {String} Image source to query
     * @return {String ? null} The format of the image or <code>null</code>
     *
     * @deprecated Use 'qx.io.ImageLoader.getFormat' instead.
     */
    getFormat : function(source)
    {
      qx.log.Logger.deprecatedMethodWarning(
        arguments.callee,
        "Use 'qx.io.ImageLoader.getFormat' instead."
      );

      return qx.io.ImageLoader.getFormat(source);
    },


    /**
     * Returns the size of a previously loaded image
     *
     * @param source {String} Image source to query
     * @return {Map} The dimension of the image. If the image is not yet loaded,
     *    the dimensions are given as nullxnull pixel.
     *
     * @deprecated Use 'qx.io.ImageLoader.getSize' instead.
     */
    getSize : function(source) {
      qx.log.Logger.deprecatedMethodWarning(
        arguments.callee,
        "Use 'qx.io.ImageLoader.getSize' instead."
      );

      return qx.io.ImageLoader.getSize(source);
    },


    /**
     * Returns the image width
     *
     * @param source {String} Image source to query
     * @return {Boolean} The width or <code>null</code> when the image is not loaded
     *
     * @deprecated Use 'qx.io.ImageLoader.getWidth' instead.
     */
    getWidth : function(source)
    {
      qx.log.Logger.deprecatedMethodWarning(
        arguments.callee,
        "Use 'qx.io.ImageLoader.getWidth' instead."
      );

      return qx.io.ImageLoader.getWidth(source);
    },


    /**
     * Returns the image height
     *
     * @param source {String} Image source to query
     * @return {Boolean} The height or <code>null</code> when the image is not loaded
     *
     * @deprecated Use 'qx.io.ImageLoader.getHeight' instead.
     */
    getHeight : function(source)
    {
      qx.log.Logger.deprecatedMethodWarning(
        arguments.callee,
        "Use 'qx.io.ImageLoader.getHeight' instead."
      );

      return qx.io.ImageLoader.getHeight(source);
    },


    /**
     * Loads the given image. Supports a callback which is
     * executed when the image is loaded.
     *
     * This method works asychronous.
     *
     * @param source {String} Image source to load
     * @param callback {Function} Callback function to execute
     * @param context {Object} Context in which the given callback should be executed
     *
     * @deprecated Use 'qx.io.ImageLoader.load' instead.
     */
    load : function(source, callback, context)
    {
      qx.log.Logger.deprecatedMethodWarning(
        arguments.callee,
        "Use 'qx.io.ImageLoader.load' instead."
      );

      qx.io.ImageLoader.load(source, callback, context);
    }
  }
});
