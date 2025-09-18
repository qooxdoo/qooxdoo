/* ************************************************************************

   qooxdoo - the new era of web development

   http://qooxdoo.org

   Copyright:
     2007-2008 1&1 Internet AG, Germany, http://www.1und1.de

   License:
     MIT: https://opensource.org/licenses/MIT
     See the LICENSE file in the project's top-level directory for details.

   Authors:
     * Fabian Jakobs (fjakobs)

************************************************************************ */

/**
 * @ignore(qx.test.propA, qx.test.propB)
 */

qx.Class.define("qx.test.util.PropertyUtil", {
  extend: qx.test.ui.LayoutTestCase,

  members: {
    setUp() {
      this.button = new qx.ui.form.Button();
      this.getRoot().add(this.button);
      this.flush();
    },

    tearDown() {
      super.tearDown();
      this.button.destroy();
    },

    testGetProperties() {
      qx.Class.define("qx.test.propA", {
        extend: qx.core.Object,
        properties: {
          a: {}
        }
      });

      qx.Class.define("qx.test.propB", {
        extend: qx.test.propA,
        properties: {
          b: {}
        }
      });

      // check getProperties
      this.assertKeyInMap(
        "a",
        qx.util.PropertyUtil.getProperties(qx.test.propA)
      );

      this.assertKeyInMap(
        "b",
        qx.util.PropertyUtil.getProperties(qx.test.propB)
      );

      // check getAllProperties
      this.assertKeyInMap(
        "a",
        qx.util.PropertyUtil.getAllProperties(qx.test.propB)
      );

      this.assertKeyInMap(
        "b",
        qx.util.PropertyUtil.getAllProperties(qx.test.propB)
      );

      delete qx.test.propB;
      delete qx.test.propA;
    }
  }
});
