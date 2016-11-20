/* ************************************************************************

   qooxdoo - the new era of web development

   http://qooxdoo.org

   Copyright:
     2016 Zenesis Ltd http://www.zenesis.com

   License:
     MIT: https://opensource.org/licenses/MIT
     See the LICENSE file in the project's top-level directory for details.

   Authors:
     * John Spackman (john.spackman@zenesis.com)

 ************************************************************************ */
qx.Class.define("qx.test.core.MemoryManagement", {
  extend: qx.dev.unit.TestCase,

  members: {
    testEnvSetting: function() {
      var ClassDisposable = qx.Class.define(null, {
        extend: qx.core.Object,
        implement: [ qx.core.IDisposable ]
      });
      var ClassNotDisposable = qx.Class.define(null, {
        extend: qx.core.Object
      });
      this.assertTrue(qx.core.Environment.get("qx.automaticMemoryManagement"));
      
      var objDisposable = new ClassDisposable();
      var objNotDisposable = new ClassNotDisposable();
      this.assertIdentical(objDisposable, qx.core.ObjectRegistry.fromHashCode(objDisposable.toHashCode()));
      this.assertNull(qx.core.ObjectRegistry.fromHashCode(objNotDisposable.toHashCode()));
    }
  }
});
