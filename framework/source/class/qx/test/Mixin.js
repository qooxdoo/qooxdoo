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

qx.Class.define("qx.test.Mixin",
{
  extend : qx.dev.unit.TestCase,

  members :
  {
    testMixinBasic : function()
    {
      qx.Mixin.define("qx.MMix1",
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

      qx.Mixin.define("qx.MMix2",
      {
        members :
        {
          bar : function() {
            return "bar";
          }
        }
      });

      qx.Class.define("qx.Mix",
      {
        extend    : Object,
        include   : qx.MMix1,
        construct : function() {}
      });

      this.assertEquals("foo", qx.MMix1.foo());
      this.assertEquals("bar", new qx.Mix().bar());
      var mix = new qx.Mix();
      mix.setColor("red");
      this.assertEquals("red", mix.getColor());

      if (this.isDebugOn())
      {
        this.assertException(function()
        {
          qx.Class.define("qx.Mix1",
          {
            extend    : Object,
            include   : [ qx.MMix1, qx.MMix2 ],
            construct : function() {}
          });
        },
        Error, "Overwriting member", "t1");

        this.assertException(function()
        {
          qx.Class.define("qx.Mix2",
          {
            extend : Object,
            include : qx.MMix1,
            construct : function() {},

            members :
            {
              /**
               * TODOC
               *
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
      qx.Class.define("qx.Mix3",
      {
        extend : Object,
        include : qx.MMix1,
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
          qx.Class.define("qx.Mix4",
          {
            extend     : Object,
            include    : qx.MMix1,
            construct  : function() {},
            properties : { color : { } }
          });
        },
        Error, "already has a property", "t3");
      };
    },


    testInclude : function()
    {
      qx.Mixin.define("qx.MLogger",
      {
        members :
        {
          log : function(msg) {
            return msg;
          }
        }
      });

      // normal usage
      qx.Class.define("qx.UseLog1",
      {
        extend    : Object,
        construct : function() {}
      });

      qx.Class.include(qx.UseLog1, qx.MLogger);
      this.assertEquals("Juhu", new qx.UseLog1().log("Juhu"));

      // not allowed to overwrite!
      qx.Class.define("qx.UseLog2",
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
          qx.Class.include(qx.UseLog2, qx.MLogger);
        }, Error, "Overwriting member");
      };

      // allowed to overwrite!
      qx.Class.define("qx.UseLog3",
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

      this.assertEquals("foo", new qx.UseLog3().log("Juhu"));
      qx.Class.patch(qx.UseLog3, qx.MLogger);
      this.assertEquals("Juhu", new qx.UseLog3().log("Juhu"));

      // extended classes must have included methods as well
      qx.Class.define("qx.ExtendUseLog1", { extend : qx.UseLog1 });
      this.assertEquals("Juhu", new qx.ExtendUseLog1().log("Juhu"));
    },

    testPatchOverwritten : function()
    {
      qx.Class.define("qx.Patch1", {
        extend : qx.core.Object,

        members : {
          sayJuhu : function() { return "Juhu"; },

          foo : function() { return "foo"; }
        }
      });

      qx.Class.define("qx.Patch2", {
        extend : qx.core.Object,

        members : {
          sayJuhu : function() { return "Huhu"; },

          foo : function() {
            return "bar";
          }
        }

      });

      qx.Mixin.define("qx.MPatch",
      {
        members :
        {
          sayJuhu : function() { return this.base(arguments) + " Kinners"},

          foo : function(dontRecurs)
          {
            var s = "";
            if (!dontRecurs) {
              var b = new qx.Patch2();
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
          qx.Class.include(qx.Patch1, qx.MPatch)
        }, Error, new RegExp('Overwriting member ".*" of Class ".*" is not allowed!'));
      };

      qx.Class.patch(qx.Patch1, qx.MPatch);
      qx.Class.patch(qx.Patch2, qx.MPatch);

      var o = new qx.Patch1();
      this.assertEquals("Juhu Kinners", o.sayJuhu());

      var o = new qx.Patch2();
      this.assertEquals("Huhu Kinners", o.sayJuhu());


      // very special case with recursive calls from different classes to
      // the mixin member
      var o = new qx.Patch1();
      this.assertEquals("++bar__foo", o.foo());
    }
  }
});
