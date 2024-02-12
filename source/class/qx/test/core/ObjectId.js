/* ************************************************************************

   qooxdoo - the new era of web development

   http://qooxdoo.org

   Copyright:
     2017 Zenesis Limited, http://www.zenesis.com

   License:
     MIT: https://opensource.org/licenses/MIT
     See the LICENSE file in the project's top-level directory for details.

   Authors:
     * John Spackman (john.spackman@zenesis.com, @johnspackman)

************************************************************************ */

/**
 * @ignore(demo.MyClass)
 * @ignore(demo.SuperClass)
 * @ignore(demo.SubClass)
 * @ignore(demo.ObjectOnly)
 */
/* global demo */

qx.Class.define("qx.test.core.ObjectId", {
  extend: qx.dev.unit.TestCase,
  include: qx.dev.unit.MMock,

  members: {
    testGetObject() {
      var clazz = qx.Class.define("demo.MyClass", {
        extend: qx.core.Object,
        members: {
          _createQxObjectImpl(id) {
            switch (id) {
              case "txt":
                return new qx.ui.form.TextField();
            }

            return super._createQxObjectImpl(id);
          }
        }
      });

      var obj = new demo.MyClass();
      var Id = qx.core.Id.getInstance();
      Id.register(obj, "test");
      var txt = obj.getQxObject("txt");
      this.assertTrue(txt === obj.getQxObject("txt"));
      this.assertTrue(txt.getQxObjectId() === "txt");
      this.assertTrue(Id.getQxObject("test") === obj);
      this.assertTrue(Id.getQxObject("test/txt") === txt);

      obj.removeOwnedQxObject(txt);
      var txt2 = obj.getQxObject("txt");
      this.assertTrue(txt !== txt2);
      this.assertTrue(txt2 === obj.getQxObject("txt"));

      txt.setQxObjectId("txt-orig");
      obj.addOwnedQxObject(txt);
      this.assertTrue(txt === obj.getQxObject("txt-orig"));

      var obj2 = new demo.MyClass();
      obj2.addOwnedQxObject(txt);
      this.assertTrue(obj.getQxObject("txt-orig") === undefined);
      this.assertTrue(obj2.getQxObject("txt-orig") === txt);

      Id.unregister("test");
      this.assertTrue(!Id.getQxObject("test"));
    },

    testObjectsSection() {
      const SuperClass = qx.Class.define("demo.SuperClass", {
        extend: qx.core.Object,
        objects: {
          overriddenObject() {
            return "overridden object in superclass";
          },

          inheritedObject() {
            return "inherited object";
          },

          modifiedObject() {
            return "modified object";
          }
        },

        members: {
          _createQxObjectImpl(id) {
            switch (id) {
              case "superCreateQxObjectImpl":
                return "superCreateQxObjectImpl";
            }

            return super._createQxObjectImpl(id);
          }
        }
      });

      const Mixin = qx.Mixin.define("demo.Mixin", {
        objects: {
          mixedObject() {
            return "mixed object";
          },

          mixedOverriddenObject() {
            return "mixed object";
          }
        }
      });

      const SubClass = qx.Class.define("demo.SubClass", {
        extend: SuperClass,
        include: [qx.core.MAssert, Mixin],
        objects: {
          commonObject() {
            return "common object in objects section";
          },

          overriddenObject() {
            return "overridden object in subclass";
          },

          modifiedObject() {
            return (
              super._createQxObjectImpl("modifiedObject") + " + some changes"
            );
          },

          mixedOverriddenObject() {
            return "mixed overridden object";
          }
        },

        members: {
          _createQxObjectImpl(id) {
            switch (id) {
              case "commonObject":
                return "common object in _createQxObjectImpl";
              case "onlyInQxObjectImpl":
                return "onlyInQxObjectImpl";
            }

            return super._createQxObjectImpl(id);
          }
        }
      });

      const obj = new SubClass();

      this.assertEquals(
        "common object in objects section",
        obj.getQxObject("commonObject")
      );

      this.assertEquals(
        "onlyInQxObjectImpl",
        obj.getQxObject("onlyInQxObjectImpl")
      );

      this.assertEquals(
        "overridden object in subclass",
        obj.getQxObject("overriddenObject")
      );

      this.assertEquals("inherited object", obj.getQxObject("inheritedObject"));
      this.assertEquals(
        "modified object + some changes",
        obj.getQxObject("modifiedObject")
      );

      this.assertEquals(
        "superCreateQxObjectImpl",
        obj.getQxObject("superCreateQxObjectImpl")
      );

      this.assertEquals("mixed object", obj.getQxObject("mixedObject"));

      this.assertEquals(
        "mixed overridden object",
        obj.getQxObject("mixedOverriddenObject")
      );

      const ObjectOnlyClass = qx.Class.define("demo.ObjectOnly", {
        extend: qx.core.Object,
        objects: {
          onlyInQxObjectImpl() {
            return "onlyInQxObjectImpl";
          }
        }
      });

      const objectsOnlyObject = new ObjectOnlyClass();
      this.assertEquals(
        "onlyInQxObjectImpl",
        objectsOnlyObject.getQxObject("onlyInQxObjectImpl")
      );
    }
  }
});
