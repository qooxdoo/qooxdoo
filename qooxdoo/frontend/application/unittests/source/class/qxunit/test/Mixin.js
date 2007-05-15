/* ************************************************************************

   qooxdoo - the new era of web development

   http://qooxdoo.org

   Copyright:
     2007 1&1 Internet AG, Germany, http://www.1and1.org

   License:
     LGPL: http://www.gnu.org/licenses/lgpl.html
     EPL: http://www.eclipse.org/org/documents/epl-v10.php
     See the LICENSE file in the project's top-level directory for details.

   Authors:
     * Fabian Jakobs (fjakobs)

************************************************************************ */

qx.Class.define("qxunit.test.Mixin", {
  extend: qxunit.TestCase,

  members : {

    testMixinBasic: function() {
      qx.Mixin.define("qxunit.MMix1", {
        statics: {
          foo: function() { return "foo"; }
        },
        members: {
          bar: function() { return "bar"; }
        },
        properties: {
          color: { _legacy: true }
        }
      });

      qx.Mixin.define("qxunit.MMix2", {
        members: {
          bar: function() { return "bar"; }
        }
      });

      qx.Class.define("qxunit.Mix", {
        extend: Object,
        include: qxunit.MMix1,
        construct: function() {}
      });
      this.assertEquals("foo", qxunit.MMix1.foo());
      this.assertEquals("bar", new qxunit.Mix().bar());
      var mix = new qxunit.Mix();
      mix.setColor("red");
      this.assertEquals("red", mix.getColor());

      this.assertExceptionDebugOn(function() {
        qx.Class.define("qxunit.Mix1", {
          extend: Object,
          include: [qxunit.MMix1, qxunit.MMix2],
          construct: function() {}
        });
      }, Error, "Overwriting member", "t1");

      this.assertExceptionDebugOn(function() {
        qx.Class.define("qxunit.Mix2", {
          extend: Object,
          include: qxunit.MMix1,
          construct: function() {},
          members: {
            bar: function() { return "bar"; }
          }
        });
      }, Error, "Overwriting member", "t2");

      // this is allowed
      qx.Class.define("qxunit.Mix3", {
        extend: Object,
        include: qxunit.MMix1,
        construct: function() {},
        statics: {
          foo: function() { return "foo"; }
        }
      });

      this.assertExceptionDebugOn(function() {
        qx.Class.define("qxunit.Mix4", {
          extend: Object,
          include: qxunit.MMix1,
          construct: function() {},
          properties: {
            color: { _legacy: true }
          }
        });
      }, Error, "already has a property", "t3");
    },


    testInclude: function() {

      qx.Mixin.define("qxunit.MLogger", {
        members: {
          log: function(msg) {
            return msg;
          }
        }
      });

      // normal usage
      qx.Class.define("qxunit.UseLog1", {
        extend: Object,
        construct: function() {}
      });
      qx.Class.include(qxunit.UseLog1, qxunit.MLogger);
      this.assertEquals("Juhu", new qxunit.UseLog1().log("Juhu"));

      // not allowed to overwrite!
      qx.Class.define("qxunit.UseLog2", {
        extend: Object,
        construct: function() {},
        members: {
          log: function() { return "foo"; }
        }
      });


      this.assertExceptionDebugOn(function() {
        qx.Class.include(qxunit.UseLog2, qxunit.MLogger);
      }, Error, "Overwriting member");

      // allowed to overwrite!
      qx.Class.define("qxunit.UseLog3", {
        extend: Object,
        construct: function() {},
        members: {
          log: function() { return "foo"; }
        }
      });

      this.assertEquals("foo", new qxunit.UseLog3().log("Juhu"));
      qx.Class.patch(qxunit.UseLog3, qxunit.MLogger);
      this.assertEquals("Juhu", new qxunit.UseLog3().log("Juhu"));

      // extended classes must have included methods as well
      qx.Class.define("qxunit.ExtendUseLog1", {
        extend : qxunit.UseLog1
      });
      this.assertEquals("Juhu", new qxunit.ExtendUseLog1().log("Juhu"));
    }
  }

});