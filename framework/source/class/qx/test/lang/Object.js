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

qx.Class.define("qx.test.lang.Object",
{
  extend : qx.dev.unit.TestCase,

  members :
  {
    testObject : function() {
      this.assertNotUndefined(qx.lang.Object);
    },


    testEmpty : function()
    {
      var object = {a: 1};
      qx.lang.Object.empty(object);
      this.assertTrue(qx.lang.Object.isEmpty(object));

      var object = {};
      qx.lang.Object.empty(object);
      this.assertTrue(qx.lang.Object.isEmpty(object));
    },


    testIsEmpty : function()
    {
      this.assertEquals(true, qx.lang.Object.isEmpty({}));
      this.assertEquals(false, qx.lang.Object.isEmpty({a:undefined}));
      this.assertEquals(false, qx.lang.Object.isEmpty({a:null}));
      this.assertEquals(false, qx.lang.Object.isEmpty({a:1}));
    },


    testHasMinLength : function()
    {
      var object = {};
      this.assertTrue(qx.lang.Object.hasMinLength(object, 0));
      this.assertFalse(qx.lang.Object.hasMinLength(object, 1));

      var object = {a: 1};
      this.assertTrue(qx.lang.Object.hasMinLength(object, 1));
      this.assertFalse(qx.lang.Object.hasMinLength(object, 2));

      var object = {a:undefined, b: null, c: 1};
      this.assertTrue(qx.lang.Object.hasMinLength(object, 3));
      this.assertFalse(qx.lang.Object.hasMinLength(object, 4));
    },


    testGetLength : function()
    {
      var object = {};
      this.assertEquals(0, qx.lang.Object.getLength(object));

      var object = {a: 1};
      this.assertEquals(1, qx.lang.Object.getLength(object));

      var object = {a:undefined, b: null, c: 1};
      this.assertEquals(3, qx.lang.Object.getLength(object));
    },


    testGetKeys : function()
    {
      var object = {
        a: undefined,
        b: null,
        c: 1
      }
      this.assertArrayEquals(
        ["a", "b", "c"].sort(),
        qx.lang.Object.getKeys(object).sort()
      );

      var object = {}
      this.assertArrayEquals(
        [],
        qx.lang.Object.getKeys(object)
      );

      var object = {
        "isPrototypeOf": 1,
        "hasOwnProperty": 1,
        "toLocaleString": 1,
        "toString": 1,
        "valueOf": 1
      };
      this.assertArrayEquals(
        [
          "isPrototypeOf",
          "hasOwnProperty",
          "toLocaleString",
          "toString",
          "valueOf"
        ].sort(),
        qx.lang.Object.getKeys(object).sort()
      );
    },


    testGetKeysAsString : function()
    {
      var object = {
        a: undefined,
        b: null,
        c: 1
      }
      this.assertEquals(
        '"a", "b", "c"',
        qx.lang.Object.getKeysAsString(object)
      );

      var object = {}
      this.assertEquals(
        '',
        qx.lang.Object.getKeysAsString(object)
      );

      var object = {
        "isPrototypeOf": 1,
        "hasOwnProperty": 1,
        "toLocaleString": 1,
        "toString": 1,
        "valueOf": 1
      };
      this.assertEquals(
        '"isPrototypeOf", "hasOwnProperty", "toLocaleString", "toString", "valueOf"',
        qx.lang.Object.getKeysAsString(object)
      );
    },


    testGetValues : function()
    {
      var object = {
        a: undefined,
        b: null,
        c: 1
      }
      this.assertArrayEquals(
        [undefined, null, 1].sort(),
        qx.lang.Object.getValues(object).sort()
      );

      var object = {}
      this.assertArrayEquals(
        [],
        qx.lang.Object.getValues(object)
      );

      var object = {
        "isPrototypeOf": 1,
        "hasOwnProperty": 2,
        "toLocaleString": 3,
        "toString": 4,
        "valueOf": 5
      };
      this.assertArrayEquals(
        [1, 2, 3, 4, 5].sort(),
        qx.lang.Object.getValues(object).sort()
      );
    },


    testMergeWith : function() {
      var original = {a: 0};
      var o1 = {a: 2, b: 1};

      qx.lang.Object.mergeWith(original, o1, true);

      // check the original
      this.assertEquals(2, original.a);
      this.assertEquals(1, original.b);
    },


    testCarefullyMergeWith : function() {
      var original = {a: 0};
      var o1 = {a: 2, b: 1};

      qx.lang.Object.carefullyMergeWith(original, o1);

      // check the original
      this.assertEquals(0, original.a);
      this.assertEquals(1, original.b);
    },


    testMerge : function() {
      var original = {a: 0};
      var o1 = {b: 1};
      var o2 = {c: 2};

      qx.lang.Object.merge(original, o1, o2);

      // check the original
      this.assertEquals(0, original.a);
      this.assertEquals(1, original.b);
      this.assertEquals(2, original.c);
    },


    testClone : function() {
      var original = {a: 12, b: true, c: "affe"};
      var clone = qx.lang.Object.clone(original);

      clone.a = 14;
      original.b = false;
      clone.c = "AFFE";

      // check the original
      this.assertEquals(12, original.a);
      this.assertEquals(false, original.b);
      this.assertEquals("affe", original.c);

      // check the clone
      this.assertEquals(14, clone.a);
      this.assertEquals(true, clone.b);
      this.assertEquals("AFFE", clone.c);
    },


    testCloneDeep : function() {
      var original = {a: {b: 0}};
      var clone = qx.lang.Object.clone(original, true);

      // change the original
      original.a.b = 1;
      this.assertEquals(0, clone.a.b);

      original = {a: [{b: 0}]};
      clone = qx.lang.Object.clone(original, true);

      // change the original
      original.a[0].b = 1;
      this.assertEquals(0, clone.a[0].b);
    },

    testInvert : function()
    {
      this.assertNotUndefined(qx.lang.Object.invert);
      var Obj = qx.lang.Object;

      this.assertJsonEquals(
      {
        a   : "1",
        "2" : "b"
      },
      Obj.invert(
      {
        1 : "a",
        b : 2
      }));
    },


    testGetKeyFromValue : function() {
      var obj = {a: 123};
      this.assertEquals("a", qx.lang.Object.getKeyFromValue(obj, 123));
    },


    testContains : function() {
      this.assertTrue(qx.lang.Object.contains({a:1}, 1));
    },


    testSelect : function() {
      this.assertEquals("affe", qx.lang.Object.select("affe", {affe: "affe"}));
    },


    testFromArray : function() {
      var array = ["a", "b"];
      var obj = qx.lang.Object.fromArray(array);

      this.assertTrue(obj.a);
      this.assertTrue(obj.b);
    },

    /**
     * Some behavior, which must be consistent in all browsers for some
     * assertions to work.
     */
    testObjectAssertions : function()
    {
      var objConstructor = ({}).constructor;

      this.assertIdentical(({a: 12}).constructor, objConstructor);
      this.assertIdentical(new Object().constructor, objConstructor);

      var qxObj = new qx.core.Object();
      this.assertNotIdentical(qxObj.constructor, objConstructor);
      this.assertNotIdentical((1).constructor, objConstructor);
      this.assertNotIdentical(("Juhu").constructor, objConstructor);
      this.assertNotIdentical((/abc/).constructor, objConstructor);
      qxObj.dispose();
    },

    testToUriParameter : function()
    {
      var obj = {affe: true, maus: false};
      var str = qx.lang.Object.toUriParameter(obj);
      this.assertEquals("affe=true&maus=false", str);
    },

    testToUriParameterUmlauts : function()
    {
      var obj = {"äffe": "jøah", "maüs": "nö"};
      var str = qx.lang.Object.toUriParameter(obj);
      this.assertEquals("%C3%A4ffe=j%C3%B8ah&ma%C3%BCs=n%C3%B6", str);
    },

    testToUriParameterSpaces : function()
    {
      var obj = {"a f f e": true};
      var str = qx.lang.Object.toUriParameter(obj);
      this.assertEquals("a%20f%20f%20e=true", str);
    },

    testToUriParameterSpacesPost : function()
    {
      var obj = {"a f  f e": "j a"};
      var str = qx.lang.Object.toUriParameter(obj, true);
      this.assertEquals("a+f++f+e=j+a", str);
    },

    testToUriParameterArray : function() {
      var obj = {id: [1,2,3]};
      var str = qx.lang.Object.toUriParameter(obj);
      this.assertEquals("id=1&id=2&id=3", str);
    }
  }
});
