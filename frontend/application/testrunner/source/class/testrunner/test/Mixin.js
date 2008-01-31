/* ************************************************************************

   qooxdoo - the new era of web development

   http://qooxdoo.org

   Copyright:
     2007-2008 1&1 Internet AG, Germany, http://www.1und1.de

   License:
     LGPL: http://www.gnu.org/licenses/lgpl.html
     EPL: http://www.eclipse.org/org/documents/epl-v10.php
     See the LICENSE file in the project's top-level directory for details.

   Authors:
     * Fabian Jakobs (fjakobs)

************************************************************************ */

qx.Class.define("testrunner.test.Mixin",
{
  extend : testrunner.TestCase,

  members :
  {
    /**
     * TODOC
     *
     * @type member
     * @return {void}
     */
    testMixinBasic : function()
    {
      qx.Mixin.define("testrunner.MMix1",
      {
        statics :
        {
          /**
           * TODOC
           *
           * @type static
           * @return {string} TODOC
           */
          foo : function() {
            return "foo";
          }
        },

        members :
        {
          /**
           * TODOC
           *
           * @type member
           * @return {string} TODOC
           */
          bar : function() {
            return "bar";
          }
        },

        properties : { color : { _legacy : true } }
      });

      qx.Mixin.define("testrunner.MMix2",
      {
        members :
        {
          /**
           * TODOC
           *
           * @type member
           * @return {string} TODOC
           */
          bar : function() {
            return "bar";
          }
        }
      });

      qx.Class.define("testrunner.Mix",
      {
        extend    : Object,
        include   : testrunner.MMix1,
        construct : function() {}
      });

      this.assertEquals("foo", testrunner.MMix1.foo());
      this.assertEquals("bar", new testrunner.Mix().bar());
      var mix = new testrunner.Mix();
      mix.setColor("red");
      this.assertEquals("red", mix.getColor());

      this.assertExceptionDebugOn(function()
      {
        qx.Class.define("testrunner.Mix1",
        {
          extend    : Object,
          include   : [ testrunner.MMix1, testrunner.MMix2 ],
          construct : function() {}
        });
      },
      Error, "Overwriting member", "t1");

      this.assertExceptionDebugOn(function()
      {
        qx.Class.define("testrunner.Mix2",
        {
          extend : Object,
          include : testrunner.MMix1,
          construct : function() {},

          members :
          {
            /**
             * TODOC
             *
             * @type member
             * @return {string} TODOC
             */
            bar : function() {
              return "bar";
            }
          }
        });
      },
      Error, "Overwriting member", "t2");

      // this is allowed
      qx.Class.define("testrunner.Mix3",
      {
        extend : Object,
        include : testrunner.MMix1,
        construct : function() {},

        statics :
        {
          /**
           * TODOC
           *
           * @type static
           * @return {string} TODOC
           */
          foo : function() {
            return "foo";
          }
        }
      });

      this.assertExceptionDebugOn(function()
      {
        qx.Class.define("testrunner.Mix4",
        {
          extend     : Object,
          include    : testrunner.MMix1,
          construct  : function() {},
          properties : { color : { _legacy : true } }
        });
      },
      Error, "already has a property", "t3");
    },


    /**
     * TODOC
     *
     * @type member
     * @return {void}
     */
    testInclude : function()
    {
      qx.Mixin.define("testrunner.MLogger",
      {
        members :
        {
          /**
           * TODOC
           *
           * @type member
           * @param msg {var} TODOC
           * @return {var} TODOC
           */
          log : function(msg) {
            return msg;
          }
        }
      });

      // normal usage
      qx.Class.define("testrunner.UseLog1",
      {
        extend    : Object,
        construct : function() {}
      });

      qx.Class.include(testrunner.UseLog1, testrunner.MLogger);
      this.assertEquals("Juhu", new testrunner.UseLog1().log("Juhu"));

      // not allowed to overwrite!
      qx.Class.define("testrunner.UseLog2",
      {
        extend : Object,
        construct : function() {},

        members :
        {
          /**
           * TODOC
           *
           * @type member
           * @return {string} TODOC
           */
          log : function() {
            return "foo";
          }
        }
      });

      this.assertExceptionDebugOn(function() {
        qx.Class.include(testrunner.UseLog2, testrunner.MLogger);
      }, Error, "Overwriting member");

      // allowed to overwrite!
      qx.Class.define("testrunner.UseLog3",
      {
        extend : Object,
        construct : function() {},

        members :
        {
          /**
           * TODOC
           *
           * @type member
           * @return {string} TODOC
           */
          log : function() {
            return "foo";
          }
        }
      });

      this.assertEquals("foo", new testrunner.UseLog3().log("Juhu"));
      qx.Class.patch(testrunner.UseLog3, testrunner.MLogger);
      this.assertEquals("Juhu", new testrunner.UseLog3().log("Juhu"));

      // extended classes must have included methods as well
      qx.Class.define("testrunner.ExtendUseLog1", { extend : testrunner.UseLog1 });
      this.assertEquals("Juhu", new testrunner.ExtendUseLog1().log("Juhu"));
    }
  }
});
