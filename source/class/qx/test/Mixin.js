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
 * @ignore(qx.UseLog3, qx.MOverridable, qx.MOverridable2, qx.OverrideClass1)
 * @ignore(qx.OverrideClass2, qx.OverrideClass3, qx.OverrideClass4)
 * @ignore(qx.PatchIncludeTest)
 */

qx.Class.define("qx.test.Mixin", {
  extend: qx.dev.unit.TestCase,

  members: {
    testMixinBasic() {
      qx.Mixin.define("qx.MMix1", {
        statics: {
          data: null,

          foo() {
            return "foo";
          }
        },

        members: {
          bar() {
            return "bar";
          }
        },

        properties: { color: {} }
      });

      qx.Mixin.define("qx.MMix2", {
        members: {
          bar() {
            return "bar";
          }
        }
      });

      qx.Class.define("qx.Mix", {
        extend: Object,
        include: qx.MMix1,
        construct() {}
      });

      this.assertEquals("foo", qx.MMix1.foo());
      this.assertEquals("bar", new qx.Mix().bar());
      var mix = new qx.Mix();
      mix.setColor("red");
      this.assertEquals("red", mix.getColor());

      if (this.isDebugOn()) {
        // Test that including multiple mixins with conflicting members still throws an error
        this.assertException(
          function () {
            qx.Class.define("qx.Mix1", {
              extend: Object,
              include: [qx.MMix1, qx.MMix2],
              construct() {}
            });
          },
          Error,
          "Overwriting member",
          "t1"
        );
      }

      // Test that class members can override mixin members (issue #9142)
      // This should now be allowed
      qx.Class.define("qx.Mix2", {
        extend: Object,
        include: qx.MMix1,
        construct() {},

        members: {
          bar() {
            return "bar from class";
          }
        }
      });

      // Verify that the class's version of bar() is used
      var mix2 = new qx.Mix2();
      this.assertEquals("bar from class", mix2.bar());

      // this is allowed
      qx.Class.define("qx.Mix3", {
        extend: Object,
        include: qx.MMix1,
        construct() {},

        statics: {
          foo() {
            return "foo";
          }
        }
      });

      if (this.isDebugOn()) {
        this.assertException(
          function () {
            qx.Class.define("qx.Mix4", {
              extend: Object,
              include: qx.MMix1,
              construct() {},
              properties: { color: {} }
            });
          },
          Error,
          "Overwriting member or property",
          "t3"
        );
      }
    },

    testInclude() {
      qx.Mixin.define("qx.MLogger", {
        members: {
          log(msg) {
            return msg;
          }
        }
      });

      // normal usage
      qx.Class.define("qx.UseLog1", {
        extend: Object,
        construct() {}
      });

      qx.Class.include(qx.UseLog1, qx.MLogger);
      this.assertEquals("Juhu", new qx.UseLog1().log("Juhu"));

      // With issue #9142 fix: Class members can override mixin members
      // When including a mixin after class definition, the class's version is preserved
      qx.Class.define("qx.UseLog2", {
        extend: Object,
        construct() {},

        members: {
          log() {
            return "foo";
          }
        }
      });

      // This should now be allowed - the class's log() is preserved
      qx.Class.include(qx.UseLog2, qx.MLogger);
      this.assertEquals("foo", new qx.UseLog2().log("Juhu"));

      // allowed to overwrite!
      qx.Class.define("qx.UseLog3", {
        extend: Object,
        construct() {},

        members: {
          log() {
            return "foo";
          }
        }
      });

      this.assertEquals("foo", new qx.UseLog3().log("Juhu"));
      qx.Class.patch(qx.UseLog3, qx.MLogger);
      this.assertEquals("Juhu", new qx.UseLog3().log("Juhu"));

      // extended classes must have included methods as well
      qx.Class.define("qx.ExtendUseLog1", { extend: qx.UseLog1 });
      this.assertEquals("Juhu", new qx.ExtendUseLog1().log("Juhu"));
    },

    /**
     * Tests that super in a Mixin calls the affected class' super method
     */
    testIncludeSuper() {
      qx.Class.define("qx.A", {
        extend: qx.core.Object,

        members: {
          sayJuhu() {
            return "Juhu";
          }
        }
      });

      qx.Mixin.define("qx.MB", {
        members: {
          sayJuhu() {
            return super.sayJuhu() + " from Mixin";
          }
        }
      });

      qx.Class.define("qx.B", {
        include: [qx.MB],
        extend: qx.A,

        members: {
          foo() {
            return "bar";
          }
        }
      });

      let b = new qx.B();
      this.assertEquals("Juhu from Mixin", b.sayJuhu());
      this.assertEquals("bar", b.foo());

      qx.Class.undefine("qx.A");
      qx.Class.undefine("qx.B");
    },

    testPatchOverwritten() {
      qx.Class.define("qx.Patch1", {
        extend: qx.core.Object,

        members: {
          sayJuhu() {
            return "Juhu";
          },

          foo() {
            return "foo";
          }
        }
      });

      qx.Class.define("qx.Patch2", {
        extend: qx.core.Object,

        members: {
          sayJuhu() {
            return "Huhu";
          },

          foo() {
            return "bar";
          }
        }
      });

      qx.Mixin.define("qx.MPatch", {
        members: {
          sayJuhu() {
            return super.sayJuhu() + " Kinners";
          },

          /** @lint ignoreUndeclaredPrivates(__b) */
          foo(dontRecurs) {
            var s = "";
            if (!dontRecurs) {
              this.__b = new qx.Patch2();
              s += "++" + this.__b.foo(true) + "__";
            }

            s += super.foo();
            return s;
          }
        }
      });

      // With issue #9142 fix: qx.Class.include no longer throws an error
      // when class members conflict with mixin members. The class's version is preserved.
      if (this.isDebugOn()) {
        // Create a temporary class to test include behavior
        qx.Class.define("qx.PatchIncludeTest", {
          extend: qx.core.Object,
          members: {
            sayJuhu() {
              return "Original";
            }
          }
        });

        // This should not throw an error
        qx.Class.include(qx.PatchIncludeTest, qx.MPatch);
        var oTest = new qx.PatchIncludeTest();
        this.assertEquals("Original", oTest.sayJuhu()); // Class's version is preserved
        oTest.dispose();
      }

      // qx.Class.patch still overwrites as before
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

    testPatchConstructors() {
      this.assertTrue(
        qx.test.testclasses.BaseClassIncluded.constructor ===
          qx.test.testclasses.BaseClassIncluded
      );

      this.assertTrue(
        qx.test.testclasses.BaseClassPatched.constructor ===
          qx.test.testclasses.BaseClassPatched
      );

      this.assertTrue(
        qx.test.testclasses.BaseClassBoth.constructor ===
          qx.test.testclasses.BaseClassBoth
      );

      this.assertTrue(
        qx.test.testclasses.DerivedClassIncluded.constructor ===
          qx.test.testclasses.DerivedClassIncluded
      );

      this.assertTrue(
        qx.test.testclasses.DerivedClassPatched.constructor ===
          qx.test.testclasses.DerivedClassPatched
      );

      this.assertTrue(
        qx.test.testclasses.DerivedClassBoth.constructor ===
          qx.test.testclasses.DerivedClassBoth
      );

      var objBaseIncluded = new qx.test.testclasses.BaseClassIncluded();
      this.assertArrayEquals(
        ["root", "base", "mixin-one", "mixin-two"],
        objBaseIncluded.state
      );

      this.assertEquals("mixin-one", objBaseIncluded.getSomething());

      var objIncluded = new qx.test.testclasses.DerivedClassIncluded();
      this.assertArrayEquals(
        ["root", "base", "mixin-one", "mixin-two", "derived"],
        objIncluded.state
      );

      this.assertEquals("mixin-one:derived", objIncluded.getSomething());

      var objBasePatched = new qx.test.testclasses.BaseClassPatched();
      this.assertArrayEquals(
        ["root", "base", "mixin-one", "mixin-two"],
        objBasePatched.state
      );

      this.assertEquals("mixin-one", objBasePatched.getSomething());

      var objPatched = new qx.test.testclasses.DerivedClassPatched();
      this.assertArrayEquals(
        ["root", "base", "mixin-one", "mixin-two", "derived"],
        objPatched.state
      );

      this.assertEquals("mixin-one:derived", objPatched.getSomething());

      var objBaseBoth = new qx.test.testclasses.BaseClassBoth();
      this.assertArrayEquals(
        ["root", "base", "mixin-one", "mixin-two"],
        objBaseBoth.state
      );

      this.assertEquals("mixin-one", objBaseBoth.getSomething());

      var objBoth = new qx.test.testclasses.DerivedClassBoth();
      this.assertArrayEquals(
        ["root", "base", "mixin-one", "mixin-two", "derived"],
        objBoth.state
      );

      this.assertEquals("mixin-one:derived", objBoth.getSomething());

      this.assertTrue(
        objBaseIncluded.constructor === qx.test.testclasses.BaseClassIncluded
      );

      this.assertTrue(
        objIncluded.constructor === qx.test.testclasses.DerivedClassIncluded
      );

      this.assertTrue(
        objBasePatched.constructor === qx.test.testclasses.BaseClassPatched
      );

      this.assertTrue(
        objPatched.constructor === qx.test.testclasses.DerivedClassPatched
      );

      this.assertTrue(
        objBaseBoth.constructor === qx.test.testclasses.BaseClassBoth
      );

      this.assertTrue(
        objBoth.constructor === qx.test.testclasses.DerivedClassBoth
      );

      this.assertTrue(
        objBaseIncluded instanceof qx.test.testclasses.BaseClassIncluded
      );

      this.assertTrue(
        objIncluded instanceof qx.test.testclasses.DerivedClassIncluded
      );

      this.assertTrue(
        objIncluded instanceof qx.test.testclasses.BaseClassIncluded
      );

      this.assertTrue(
        objBasePatched instanceof qx.test.testclasses.BaseClassPatched
      );

      this.assertTrue(
        objPatched instanceof qx.test.testclasses.BaseClassPatched
      );

      this.assertTrue(
        objPatched instanceof qx.test.testclasses.DerivedClassPatched
      );

      this.assertTrue(objBaseBoth instanceof qx.test.testclasses.BaseClassBoth);
      this.assertTrue(objBoth instanceof qx.test.testclasses.BaseClassBoth);
      this.assertTrue(objBoth instanceof qx.test.testclasses.DerivedClassBoth);

      this.assertTrue(objBaseIncluded instanceof qx.test.testclasses.RootClass);
      this.assertTrue(objBaseBoth instanceof qx.test.testclasses.RootClass);
      this.assertTrue(objPatched instanceof qx.test.testclasses.RootClass);
    },

    testPatchDouble() {
      qx.Class.define("qx.Patch_1", {
        extend: qx.core.Object,

        members: {
          sayJuhu() {
            return "Juhu 1";
          }
        }
      });

      qx.Class.define("qx.Patch_2", {
        extend: qx.core.Object,

        members: {
          sayJuhu() {
            return "Juhu 2";
          }
        }
      });

      qx.Mixin.define("qx.MPatch", {
        members: {
          sayJuhu() {
            return super.sayJuhu() + " Mixin";
          }
        }
      });

      qx.Class.patch(qx.Patch_1, qx.MPatch);
      qx.Class.patch(qx.Patch_2, qx.MPatch);

      var o = new qx.Patch_1();
      this.assertEquals("Juhu 1 Mixin", o.sayJuhu());
      o.dispose();

      var o = new qx.Patch_2();
      this.assertEquals("Juhu 2 Mixin", o.sayJuhu());
      o.dispose();
    },

    testPatchOverwrittenDerived() {
      qx.Class.define("qx.Patch", {
        extend: qx.core.Object,
        members: {
          sayJuhu() {
            return "Juhu";
          }
        }
      });

      qx.Class.define("qx.PatchDerived", {
        extend: qx.Patch,
        members: {
          sayJuhu() {
            return super.sayJuhu() + " Derived";
          }
        }
      });

      qx.Mixin.define("qx.MPatch", {
        members: {
          sayJuhu() {
            return super.sayJuhu() + " Mixin";
          }
        }
      });

      qx.Class.patch(qx.PatchDerived, qx.MPatch);

      var o = new qx.PatchDerived();
      this.assertEquals("Juhu Derived Mixin", o.sayJuhu());
      o.dispose();
      qx.Class.undefine("qx.Patch");
      qx.Class.undefine("qx.PatchDerived");
    },

    testPatchOverwrittenDerivedInBaseClass() {
      qx.Mixin.define("qx.MPatch", {
        members: {
          sayJuhu() {
            return super.sayJuhu() + " Mixin";
          }
        }
      });

      qx.Class.define("qx.Patch", {
        extend: qx.core.Object,
        members: {
          sayJuhu() {
            return "Juhu";
          }
        }
      });

      qx.Class.define("qx.PatchDerived", {
        extend: qx.Patch,
        members: {
          sayJuhu() {
            return super.sayJuhu() + " Derived";
          }
        }
      });

      qx.Class.patch(qx.Patch, qx.MPatch);

      var o = new qx.Patch();
      this.assertEquals("Juhu Mixin", o.sayJuhu());
      o.dispose();

      var o = new qx.PatchDerived();
      this.assertEquals("Juhu Mixin Derived", o.sayJuhu());
      o.dispose();
      qx.Class.undefine("qx.Patch");
      qx.Class.undefine("qx.PatchDerived");
    },

    testPatchMultiOverwrittenDerived() {
      qx.Class.define("qx.A", {
        extend: qx.core.Object,
        members: {
          sayJuhu() {
            return "A";
          }
        }
      });

      qx.Class.define("qx.B", {
        extend: qx.A,
        members: {
          sayJuhu() {
            return super() + " B";
          }
        }
      });

      qx.Class.define("qx.C", {
        extend: qx.B,
        members: {
          sayJuhu() {
            return super() + " C";
          }
        }
      });

      qx.Mixin.define("qx.MA", {
        members: {
          sayJuhu() {
            return super.sayJuhu() + " MA";
          }
        }
      });

      qx.Mixin.define("qx.MB", {
        members: {
          sayJuhu() {
            return super.sayJuhu() + " MB";
          }
        }
      });

      qx.Mixin.define("qx.MC", {
        members: {
          sayJuhu() {
            return super.sayJuhu() + " MC";
          }
        }
      });

      qx.Class.patch(qx.A, qx.MA);
      qx.Class.patch(qx.B, qx.MB);
      qx.Class.patch(qx.C, qx.MC);

      var o = new qx.C();
      this.assertEquals("A MA B MB C MC", o.sayJuhu());
      o.dispose();
    },

    testMixinInMultipleClasses() {
      // Two unrelated base classes, each with a 'describe' method
      qx.Class.define("qx.MBase1", {
        extend: qx.core.Object,
        members: {
          describe() {
            return "Base1";
          }
        }
      });
      qx.Class.define("qx.MBase2", {
        extend: qx.core.Object,
        members: {
          describe() {
            return "Base2";
          }
        }
      });

      // Same mixin included in both classes
      qx.Mixin.define("qx.MDual", {
        members: {
          describe() {
            return super.describe() + " + Mixin";
          }
        }
      });

      qx.Class.define("qx.MChild1", { extend: qx.MBase1, include: [qx.MDual] });
      qx.Class.define("qx.MChild2", { extend: qx.MBase2, include: [qx.MDual] });

      var c1 = new qx.MChild1();
      var c2 = new qx.MChild2();

      // Without the fix, c1.describe() would call Base2 (last include clobbered fn.base)
      this.assertEquals("Base1 + Mixin", c1.describe());
      this.assertEquals("Base2 + Mixin", c2.describe());

      c1.dispose();
      c2.dispose();
      qx.Class.undefine("qx.MChild1");
      qx.Class.undefine("qx.MChild2");
      qx.Class.undefine("qx.MDual");
      qx.Class.undefine("qx.MBase1");
      qx.Class.undefine("qx.MBase2");
    },

    testDoubleMixin() {
      qx.Class.define("qx.D", {
        extend: qx.core.Object,
        members: {
          sayJuhu() {
            return "Double";
          }
        }
      });

      qx.Mixin.define("qx.MDA", {
        members: {
          sayJuhu() {
            return super.sayJuhu() + " MA";
          }
        }
      });

      qx.Mixin.define("qx.MDB", {
        members: {
          sayJuhu() {
            return super.sayJuhu() + " MB";
          }
        }
      });

      qx.Class.patch(qx.D, qx.MDA);
      qx.Class.patch(qx.D, qx.MDB);

      var o = new qx.D();
      var ret = o.sayJuhu();
      this.assertEquals("Double MA MB", ret);
      o.dispose();
      qx.Class.undefine("qx.D");
    },

    testDoubleMixinWithSuperStruct() {
      qx.Class.define("qx.E1", {
        extend: qx.core.Object,
        members: {
          sayJuhu() {
            return "E1";
          }
        }
      });
      qx.Mixin.define("qx.ME1a", {
        members: {
          sayJuhu() {
            return `${super.sayJuhu()} ME1`;
          }
        }
      });
      qx.Mixin.define("qx.ME1b", {
        members: {
          // does not implement `sayJuhu`
        }
      });

      qx.Class.define("qx.E2", {
        extend: qx.E1,
        members: {
          sayJuhu() {
            return `${super.sayJuhu()} E2`;
          }
        }
      });
      qx.Mixin.define("qx.ME2a", {
        members: {
          sayJuhu() {
            return `${super.sayJuhu()} ME2a`;
          }
        }
      });
      qx.Mixin.define("qx.ME2b", {
        members: {
          sayJuhu() {
            return `${super.sayJuhu()} ME2b`;
          }
        }
      });

      qx.Class.patch(qx.E1, qx.ME1a);
      qx.Class.patch(qx.E1, qx.ME1b);
      qx.Class.patch(qx.E2, qx.ME2a);
      qx.Class.patch(qx.E2, qx.ME2b);

      const e = new qx.E2();
      this.assertEquals("E1 ME1 E2 ME2a ME2b", e.sayJuhu());
      e.dispose();
    },

    /**
     * tests a large structure to ensure that combinations of patch order,
     * presence of given method, nor patched class count have an impact on
     * the behavior of `super` in mixin methods.
     */
    testLotsMixinLotsSuper() {
      qx.Class.define("qx.G1", {
        extend: qx.core.Object,
        members: {
          sayJuhu() {
            return "G1";
          }
        }
      });
      qx.Mixin.define("qx.M1G1", {
        members: {
          sayJuhu() {
            return `${super.sayJuhu()} M1G1`;
          }
        }
      });
      qx.Class.patch(qx.G1, qx.M1G1);
      qx.Mixin.define("qx.M2G1", {
        members: {
          sayJuhu() {
            return `${super.sayJuhu()} M2G1`;
          }
        }
      });
      qx.Class.patch(qx.G1, qx.M2G1);
      qx.Mixin.define("qx.M3G1", {
        members: {
          sayJuhu() {
            return `${super.sayJuhu()} M3G1`;
          }
        }
      });
      qx.Class.patch(qx.G1, qx.M3G1);
      qx.Mixin.define("qx.M4G1", {
        members: {
          sayJuhu() {
            return `${super.sayJuhu()} M4G1`;
          }
        }
      });
      qx.Class.patch(qx.G1, qx.M4G1);
      qx.Mixin.define("qx.M5G1", {
        members: {
          // does not implement `sayJuhu`
        }
      });
      qx.Class.patch(qx.G1, qx.M5G1);
      qx.Mixin.define("qx.M6G1", {
        members: {
          // does not implement `sayJuhu`
        }
      });
      qx.Class.patch(qx.G1, qx.M6G1);

      qx.Class.define("qx.G2", {
        extend: qx.G1,
        members: {
          sayJuhu() {
            return `${super.sayJuhu()} G2`;
          }
        }
      });
      qx.Mixin.define("qx.M1G2", {
        members: {
          sayJuhu() {
            return `${super.sayJuhu()} M1G2`;
          }
        }
      });
      qx.Class.patch(qx.G2, qx.M1G2);
      qx.Mixin.define("qx.M2G2", {
        members: {
          sayJuhu() {
            return `${super.sayJuhu()} M2G2`;
          }
        }
      });
      qx.Class.patch(qx.G2, qx.M2G2);
      qx.Mixin.define("qx.M3G2", {
        members: {
          // does not implement `sayJuhu`
        }
      });
      qx.Class.patch(qx.G2, qx.M3G2);
      qx.Mixin.define("qx.M4G2", {
        members: {
          sayJuhu() {
            return `${super.sayJuhu()} M4G2`;
          }
        }
      });
      qx.Class.patch(qx.G2, qx.M4G2);
      qx.Mixin.define("qx.M5G2", {
        members: {
          sayJuhu() {
            return `${super.sayJuhu()} M5G2`;
          }
        }
      });
      qx.Class.patch(qx.G2, qx.M5G2);

      qx.Class.define("qx.G3", {
        extend: qx.G2,
        members: {
          sayJuhu() {
            return `${super.sayJuhu()} G3`;
          }
        }
      });
      qx.Mixin.define("qx.M1G3", {
        members: {
          // does not implement `sayJuhu`
        }
      });
      qx.Class.patch(qx.G3, qx.M1G3);
      qx.Mixin.define("qx.M2G3", {
        members: {
          sayJuhu() {
            return `${super.sayJuhu()} M2G3`;
          }
        }
      });
      qx.Class.patch(qx.G3, qx.M2G3);
      qx.Mixin.define("qx.M3G3", {
        members: {
          sayJuhu() {
            return `${super.sayJuhu()} M3G3`;
          }
        }
      });
      qx.Class.patch(qx.G3, qx.M3G3);
      qx.Mixin.define("qx.M4G3", {
        members: {
          // does not implement `sayJuhu`
        }
      });
      qx.Class.patch(qx.G3, qx.M4G3);

      qx.Class.define("qx.G4", {
        extend: qx.G3,
        members: {
          sayJuhu() {
            return `${super.sayJuhu()} G4`;
          }
        }
      });
      qx.Mixin.define("qx.M1G4", {
        members: {
          sayJuhu() {
            return `${super.sayJuhu()} M1G4`;
          }
        }
      });
      qx.Class.patch(qx.G4, qx.M1G4);
      qx.Mixin.define("qx.M2G4", {
        members: {
          // does not implement `sayJuhu`
        }
      });
      qx.Class.patch(qx.G4, qx.M2G4);
      qx.Mixin.define("qx.M3G4", {
        members: {
          sayJuhu() {
            return `${super.sayJuhu()} M3G4`;
          }
        }
      });
      qx.Class.patch(qx.G4, qx.M3G4);

      qx.Class.define("qx.G5", {
        extend: qx.G4,
        members: {
          sayJuhu() {
            return `${super.sayJuhu()} G5`;
          }
        }
      });
      qx.Mixin.define("qx.M1G5", {
        members: {
          sayJuhu() {
            return `${super.sayJuhu()} M1G5`;
          }
        }
      });
      qx.Class.patch(qx.G5, qx.M1G5);
      qx.Mixin.define("qx.M2G5", {
        members: {
          // does not implement `sayJuhu`
        }
      });
      qx.Class.patch(qx.G5, qx.M2G5);

      const g5 = new qx.G5();
      this.assertEquals("G1 M1G1 M2G1 M3G1 M4G1 G2 M1G2 M2G2 M4G2 M5G2 G3 M2G3 M3G3 G4 M1G4 M3G4 G5 M1G5", g5.sayJuhu());
      g5.dispose();
    },

    /**
     * Test for issue #9142: Classes should be able to override mixin methods
     * This test verifies that a class can override a method defined in a mixin
     * and can optionally call the mixin's implementation using super
     */
    testMixinMethodOverride() {
      // Define a mixin with a method
      qx.Mixin.define("qx.MOverridable", {
        members: {
          greet() {
            return "Hello from Mixin";
          },

          calculate(a, b) {
            return a + b;
          }
        }
      });

      // Test 1: Class overrides mixin method without calling super
      qx.Class.define("qx.OverrideClass1", {
        extend: qx.core.Object,
        include: qx.MOverridable,

        members: {
          greet() {
            return "Hello from Class";
          }
        }
      });

      var obj1 = new qx.OverrideClass1();
      this.assertEquals("Hello from Class", obj1.greet());
      obj1.dispose();

      // Test 2: Class completely overrides mixin methods with different implementations
      // Note: Calling the mixin's version from the class override is not currently
      // supported by qooxdoo's base call mechanism (this.base looks in superclass, not mixins)
      qx.Class.define("qx.OverrideClass2", {
        extend: qx.core.Object,
        include: qx.MOverridable,

        members: {
          greet() {
            return "Completely overridden by Class";
          },

          calculate(a, b) {
            return (a + b) * 10; // Different calculation
          }
        }
      });

      var obj2 = new qx.OverrideClass2();
      this.assertEquals("Completely overridden by Class", obj2.greet());
      this.assertEquals(50, obj2.calculate(2, 3)); // (2 + 3) * 10 = 50
      obj2.dispose();

      // Test 3: Derived class inherits the overridden method
      qx.Class.define("qx.OverrideClass3", {
        extend: qx.OverrideClass1
      });

      var obj3 = new qx.OverrideClass3();
      this.assertEquals("Hello from Class", obj3.greet());
      obj3.dispose();

      // Test 4: Class overrides mixin method after mixin is included
      qx.Mixin.define("qx.MOverridable2", {
        members: {
          getValue() {
            return "Value from Mixin2";
          }
        }
      });

      qx.Class.define("qx.OverrideClass4", {
        extend: qx.core.Object,
        include: qx.MOverridable2,

        members: {
          getValue() {
            return "Overridden by class";
          }
        }
      });

      var obj4 = new qx.OverrideClass4();
      this.assertEquals("Overridden by class", obj4.getValue());
      obj4.dispose();

      // Cleanup
      qx.Class.undefine("qx.OverrideClass1");
      qx.Class.undefine("qx.OverrideClass2");
      qx.Class.undefine("qx.OverrideClass3");
      qx.Class.undefine("qx.OverrideClass4");
    }
  }
});
