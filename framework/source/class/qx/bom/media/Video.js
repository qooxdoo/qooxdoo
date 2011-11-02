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
     * Adrian Olaru (adrianolaru)

************************************************************************ */


/**
 * EXPERIMENTAL - NOT READY FOR PRODUCTION
 *
 * Media object for playing videos.
 */
qx.Class.define("qx.bom.media.Video",
{
  extend : qx.bom.media.Abstract,

  /**
   * @param source {String} the source url to the sound file.
   */
  construct : function(source)
  {
    this._video = document.createElement("video");
    if (source) {
      this._video.src = source;
    }
    this.base(arguments, this._video);
  },


  members :
  {
    _video : null,


    /**
     * Gets the width of the video element.
     *
     * @return {Number} the width of the video element
     */
    getWidth: function() {
      return this._video.width;
    },

    /**
     * Sets the width of the video element.
     *
     * @param value {Number} The new value of width.
     */
    setWidth: function(value) {
      this._video.width = value;
    },


    /**
     * Gets the height of the video element.
     *
     * @return {Number} the height of the video element
     */
    getHeight: function() {
      return this._video.height;
    },


    /**
     * Sets the height of the video element.
     *
     * @param value {Number} The new value of height.
     */
    setHeight: function(value) {
      this._video.height = value;
    },


    /**
     * Gets the width of the video.
     *
     * @return {Number} the width of the video
     */
    getVideoWidth: function() {
      return this._video.videoWidth;
    },


    /**
     * Gets the height of the video.
     *
     * @return {Number} the height of the video
     */
    getVideoHeight: function() {
      return this._video.videoHeight;
    },


    /**
     * Gets the poster of the video.
     *
     * @return {String} the URL of an image to act as the video poster
     */
    getPoster: function() {
      return this._video.poster;
    },


    /**
     * Sets the poster of the video.
     *
     * @param value {String} The new value of poster.
     */
    setPoster: function(value) {
      this._video.poster = value;
    }
  }
});
