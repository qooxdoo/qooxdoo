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
 * @ignore(qx.ExtendUseLog1, qx.Mix, qx.MLogger, qx.MMix1, qx.MMix1.foo)
 * @ignore(qx.MMix2, qx.MPatch, qx.Patch1, qx.Patch2, qx.UseLog1, qx.UseLog2)
 * @ignore(qx.UseLog3)
 */


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
          data : null,

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
          sayJuhu : function() { return this.base(arguments) + " Kinners";},

          /** @lint ignoreUndeclaredPrivates(__b) */
          foo : function(dontRecurs)
          {
            var s = "";
            if (!dontRecurs) {
              this.__b = new qx.Patch2();
              s += "++" + this.__b.foo(true) + "__";
            }

            s += this.base(arguments);
            return s;
          }
        }
      });


      if (this.isDebugOn())
      {
        this.assertException(function() {
          qx.Class.include(qx.Patch1, qx.MPatch);
        }, Error, new RegExp('Overwriting member ".*" of Class ".*" is not allowed!'));
      };

      qx.Class.patch(qx.Patch1, qx.MPatch);
      qx.Class.patch(qx.Patch2, qx.MPatch);

      var o = new qx.Patch1();
      this.assertEquals("Juhu Kinners", o.sayJuhu());
      o.dispose();

      var o = new qx.Patch2();
      this.assertEquals("Huhu Kinners", o.sayJuhu());
      o.dispose();


      // very special case with recursive calls from different classes to
      // the mixin member
      var o = new qx.Patch1();
      this.assertEquals("++bar__foo", o.foo());
      o.__b.dispose();
      o.dispose();
    },
    
    testPatchConstructors: function() {
      this.assertTrue(qx.test.testclasses.BaseClassIncluded.constructor === qx.test.testclasses.BaseClassIncluded);
      this.assertTrue(qx.test.testclasses.BaseClassPatched.constructor === qx.test.testclasses.BaseClassPatched);
      this.assertTrue(qx.test.testclasses.BaseClassBoth.constructor === qx.test.testclasses.BaseClassBoth);
      this.assertTrue(qx.test.testclasses.DerivedClassIncluded.constructor === qx.test.testclasses.DerivedClassIncluded);
      this.assertTrue(qx.test.testclasses.DerivedClassPatched.constructor === qx.test.testclasses.DerivedClassPatched);
      this.assertTrue(qx.test.testclasses.DerivedClassBoth.constructor === qx.test.testclasses.DerivedClassBoth);

      var objBaseIncluded = new qx.test.testclasses.BaseClassIncluded();
      this.assertArrayEquals([ "root", "base", "mixin-one", "mixin-two" ], objBaseIncluded.state);
      this.assertEquals("mixin-one", objBaseIncluded.getSomething());

      var objIncluded = new qx.test.testclasses.DerivedClassIncluded();
      this.assertArrayEquals([ "root", "base", "mixin-one", "mixin-two", "derived" ], objIncluded.state);
      this.assertEquals("mixin-one:derived", objIncluded.getSomething());

      var objBasePatched = new qx.test.testclasses.BaseClassPatched();
      this.assertArrayEquals([ "root", "base", "mixin-one", "mixin-two" ], objBasePatched.state);
      this.assertEquals("mixin-one", objBasePatched.getSomething());
      
      var objPatched = new qx.test.testclasses.DerivedClassPatched();
      this.assertArrayEquals([ "root", "base", "mixin-one", "mixin-two", "derived" ], objPatched.state);
      this.assertEquals("mixin-one:derived", objPatched.getSomething());
      
      var objBaseBoth = new qx.test.testclasses.BaseClassBoth();
      this.assertArrayEquals([ "root", "base", "mixin-one", "mixin-two" ], objBaseBoth.state);
      this.assertEquals("mixin-one", objBaseBoth.getSomething());
      
      var objBoth = new qx.test.testclasses.DerivedClassBoth();
      this.assertArrayEquals([ "root", "base", "mixin-one", "mixin-two", "derived" ], objBoth.state);
      this.assertEquals("mixin-one:derived", objBoth.getSomething());
      
      this.assertTrue(objBaseIncluded.constructor === qx.test.testclasses.BaseClassIncluded);
      this.assertTrue(objIncluded.constructor === qx.test.testclasses.DerivedClassIncluded);
      this.assertTrue(objBasePatched.constructor === qx.test.testclasses.BaseClassPatched);
      this.assertTrue(objPatched.constructor === qx.test.testclasses.DerivedClassPatched);
      this.assertTrue(objBaseBoth.constructor === qx.test.testclasses.BaseClassBoth);
      this.assertTrue(objBoth.constructor === qx.test.testclasses.DerivedClassBoth);
      
      this.assertTrue(objBaseIncluded instanceof qx.test.testclasses.BaseClassIncluded);
      this.assertTrue(objIncluded instanceof qx.test.testclasses.DerivedClassIncluded);
      this.assertTrue(objIncluded instanceof qx.test.testclasses.BaseClassIncluded);
      this.assertTrue(objBasePatched instanceof qx.test.testclasses.BaseClassPatched);
      this.assertTrue(objPatched instanceof qx.test.testclasses.BaseClassPatched);
      this.assertTrue(objPatched instanceof qx.test.testclasses.DerivedClassPatched);
      this.assertTrue(objBaseBoth instanceof qx.test.testclasses.BaseClassBoth);
      this.assertTrue(objBoth instanceof qx.test.testclasses.BaseClassBoth);
      this.assertTrue(objBoth instanceof qx.test.testclasses.DerivedClassBoth);
      
      this.assertTrue(objBaseIncluded instanceof qx.test.testclasses.RootClass);
      this.assertTrue(objBaseBoth instanceof qx.test.testclasses.RootClass);
      this.assertTrue(objPatched instanceof qx.test.testclasses.RootClass);
    }
  }
});
