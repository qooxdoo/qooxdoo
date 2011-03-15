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
    this._video = new window.Video(source ? source : "");
    this.base(arguments, this._video);
  },


  members :
  {
    _video : null,

    /**
     * Whether the browser can play ogg format.
     * 
     * @return {Boolean}
     */
    canPlayOgg : function()
    {
      return this.canPlayType("audio/ogg");
    }
  }
});
