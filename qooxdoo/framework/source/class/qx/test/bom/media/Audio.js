/* ************************************************************************

   qooxdoo - the new era of web development

   http://qooxdoo.org

   Copyright:
     2007-2011 1&1 Internet AG, Germany, http://www.1und1.de

   License:
     LGPL: http://www.gnu.org/licenses/lgpl.html
     EPL: http://www.eclipse.org/org/documents/epl-v10.php
     See the LICENSE file in the project's top-level directory for details.

   Authors:
     * Adrian Olaru (adrianolaru)

************************************************************************ */

/* ************************************************************************

#asset(qx/test/media/*)

************************************************************************ */

qx.Class.define("qx.test.bom.media.Audio",
{
  extend : qx.test.bom.media.MediaTestCase,
  include: [qx.dev.unit.MRequirements],

  members :
  {
    _getSrc: function() {
      if (qx.core.Environment.get("html.audio.mp3")) {
        return qx.util.ResourceManager.getInstance().toUri("qx/test/media/knock.mp3");
      } else if(qx.core.Environment.get("html.audio.ogg")) {
        return qx.util.ResourceManager.getInstance().toUri("qx/test/media/knock.ogg");
      } else if(qx.core.Environment.get("html.audio.wav")) {
        return qx.util.ResourceManager.getInstance().toUri("qx/test/media/knock.wav");
      }
    },

    _createMedia: function() {
      return new qx.bom.media.Audio(this._src);
    },

    _checkFeature: function() {
      this.require(["audio"]);
    },

    hasAudio: function() {
      return qx.core.Environment.get("html.audio");
    }
  }
});
