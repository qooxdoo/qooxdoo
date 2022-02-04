/* ************************************************************************

   qooxdoo - the new era of web development

   http://qooxdoo.org

   Copyright:
     2007-2011 1&1 Internet AG, Germany, http://www.1und1.de

   License:
     MIT: https://opensource.org/licenses/MIT
     See the LICENSE file in the project's top-level directory for details.

   Authors:
     * Adrian Olaru (adrianolaru)

************************************************************************ */

qx.Class.define("qx.test.bom.storage.Session", {
  extend: qx.test.bom.storage.WebStorageTestCase,
  include: [qx.dev.unit.MRequirements],

  members: {
    _getStorage() {
      return qx.bom.Storage.getSession();
    }
  }
});
