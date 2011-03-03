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
     * Adrian Olaru (adrianolaru)

************************************************************************ */


/**
 * EXPERIMENTAL - NOT READY FOR PRODUCTION
 *
 * Audio media object to play sounds.
 *
 * For more information see:
 * http://www.w3.org/TR/geolocation-API
 */
qx.Class.define("qx.bom.media.Audio",
{
  extend : qx.bom.media.Abstract,

  /**
   * @param source {String} the source url to the sound file. 
   */
  construct : function(source)
  {
    this._audio = new window.Audio(source ? source : "");
    this.base(arguments, this._audio);
  },


  members :
  {
    _audio : null,

    /**
     * Whether the browser can play ogg format.
     * 
     * @return {Boolean}
     */
    canPlayOgg : function()
    {
      return this.canPlayType("audio/ogg");
    },


    /**
     * Whether the browser can play mp3 format.
     * 
     * @return {Boolean}
     */
    canPlayMp3 : function()
    {
      return this.canPlayType("audio/mpeg");
    },


    /**
     * Whether the browser can play wave format.
     * 
     * @return {Boolean}
     */
    canPlayWav : function()
    {
      return this.canPlayType("audio/x-wav");
    },


    /**
     * Whether the browser can play au format.
     * 
     * @return {Boolean}
     */
    canPlayAu : function()
    {
      return this.canPlayType("audio/basic");
    },


    /**
     * Whether the browser can play aif format.
     * 
     * @return {Boolean}
     */
    canPlayAif : function()
    {
      return this.canPlayType("audio/x-aiff");
    }
  }
});
