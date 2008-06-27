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
  extend : qx.dev.unit.TestCase,

  members :
  {
    testMixinBasic : function()
    {
      qx.Mixin.define("testrunner.MMix1",
      {
        statics :
        {
          foo : function() {
            return "foo";
          }
        },

        members :
        {
          bar : function() {
            return "bar";
          }
        },

        properties : { color : { } }
      });

      qx.Mixin.define("testrunner.MMix2",
      {
        members :
        {
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

      if (this.isDebugOn())
      {
        this.assertException(function()
        {
          qx.Class.define("testrunner.Mix1",
          {
            extend    : Object,
            include   : [ testrunner.MMix1, testrunner.MMix2 ],
            construct : function() {}
          });
        },
        Error, "Overwriting member", "t1");

        this.assertException(function()
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
      };

      // this is allowed
      qx.Class.define("testrunner.Mix3",
      {
        extend : Object,
        include : testrunner.MMix1,
        construct : function() {},

        statics :
        {
          foo : function() {
            return "foo";
          }
        }
      });

      if (this.isDebugOn())
      {
        this.assertException(function()
        {
          qx.Class.define("testrunner.Mix4",
          {
            extend     : Object,
            include    : testrunner.MMix1,
            construct  : function() {},
            properties : { color : { } }
          });
        },
        Error, "already has a property", "t3");
      };
    },


    testInclude : function()
    {
      qx.Mixin.define("testrunner.MLogger",
      {
        members :
        {
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
          log : function() {
            return "foo";
          }
        }
      });

      if (this.isDebugOn())
      {
        this.assertException(function() {
          qx.Class.include(testrunner.UseLog2, testrunner.MLogger);
        }, Error, "Overwriting member");
      };

      // allowed to overwrite!
      qx.Class.define("testrunner.UseLog3",
      {
        extend : Object,
        construct : function() {},

        members :
        {
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
    },

    testPatchOverwritten : function()
    {
      qx.Class.define("testrunner.Patch1", {
        extend : qx.core.Object,

        members : {
          sayJuhu : function() { return "Juhu"; },

          foo : function() { return "foo"; }
        }
      });

      qx.Class.define("testrunner.Patch2", {
        extend : qx.core.Object,

        members : {
          sayJuhu : function() { return "Huhu"; },

          foo : function() {
            return "bar";
          }
        }

      });

      qx.Mixin.define("testrunner.MPatch",
      {
        members :
        {
          sayJuhu : function() { return this.base(arguments) + " Kinners"},

          foo : function(dontRecurs)
          {
            var s = "";
            if (!dontRecurs) {
              var b = new testrunner.Patch2();
              s += "++" + b.foo(true) + "__";
            }

            s += this.base(arguments);
            return s;
          }
        }
      });


      if (this.isDebugOn())
      {
        this.assertException(function() {
          qx.Class.include(testrunner.Patch1, testrunner.MPatch)
        }, Error, new RegExp('Overwriting member ".*" of Class ".*" is not allowed!'));
      };

      qx.Class.patch(testrunner.Patch1, testrunner.MPatch);
      qx.Class.patch(testrunner.Patch2, testrunner.MPatch);

      var o = new testrunner.Patch1();
      this.assertEquals("Juhu Kinners", o.sayJuhu());

      var o = new testrunner.Patch2();
      this.assertEquals("Huhu Kinners", o.sayJuhu());


      // very special case with recursive calls from different classes to
      // the mixin member
      var o = new testrunner.Patch1();
      this.assertEquals("++bar__foo", o.foo());
    }
  }
});
