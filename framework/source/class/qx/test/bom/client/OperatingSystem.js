/* ************************************************************************

 qooxdoo - the new era of web development

 http://qooxdoo.org

 Copyright:
 2007-2012 1&1 Internet AG, Germany, http://www.1und1.de

 License:
 LGPL: http://www.gnu.org/licenses/lgpl.html
 EPL: http://www.eclipse.org/org/documents/epl-v10.php
 See the LICENSE file in the project's top-level directory for details.

 Authors:
 * Christopher Zuendorf (czuendorf)

 ************************************************************************ */

qx.Class.define("qx.test.bom.client.OperatingSystem",
  {
    extend : qx.dev.unit.TestCase,

    members :
    {

      testUsageOfGetName: function () {
        this.assertNotEquals("", qx.bom.client.OperatingSystem.getName());
      },

      testUsageOfGetVersion: function () {
        if (qx.bom.client.OperatingSystem.getName() !== "linux") {
          this.assertNotEquals("", qx.bom.client.OperatingSystem.getVersion());
        }
      }
    }
  });