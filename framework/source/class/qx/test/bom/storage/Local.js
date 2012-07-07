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

qx.Class.define("qx.test.bom.storage.Local",
{
  extend : qx.test.bom.storage.WebStorageTestCase,
  include: [qx.dev.unit.MRequirements],

  members: {
    _getStorage: function() {
      return qx.bom.Storage.getLocal();
    }
  }
});
