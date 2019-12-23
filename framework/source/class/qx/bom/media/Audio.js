/* ************************************************************************

   qooxdoo - the new era of web development

   http://qooxdoo.org

   Copyright:
     2004-2011 1&1 Internet AG, Germany, http://www.1und1.de

   License:
     MIT: https://opensource.org/licenses/MIT
     See the LICENSE file in the project's top-level directory for details.

   Authors:
     * Tino Butz (tbtz)
     * Adrian Olaru (adrianolaru)

************************************************************************ */


/**
 *
 * Media object for playing sounds.
 * 
 * NOTE: Instances of this class must be disposed of to free resources
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


  members : {
    _audio : null
  }
});

