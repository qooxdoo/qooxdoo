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

#asset(qx/test/audio.ogg)

************************************************************************ */

qx.Class.define("qx.test.bom.media.Audio",
{
  extend : qx.test.bom.media.MediaTestCase,
  include: [qx.dev.unit.MRequirements],

  members :
  {
    _getSrc: function() {
      return qx.util.ResourceManager.getInstance().toUri("qx/test/audio.ogg");
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
