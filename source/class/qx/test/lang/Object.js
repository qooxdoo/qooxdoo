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
      };
      this.assertArrayEquals(
        ["a", "b", "c"].sort(),
        Object.keys(object).sort()
      );

      var object = {};
      this.assertArrayEquals(
        [],
        Object.keys(object)
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
        Object.keys(object).sort()
      );
    },


    testGetValues : function()
    {
      var object = {
        a: undefined,
        b: null,
        c: 1
      };
      this.assertArrayEquals(
        [undefined, null, 1].sort(),
        qx.lang.Object.getValues(object).sort()
      );

      var object = {};
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


    testMergeWithCarefully : function() {
      var original = {a: 0};
      var o1 = {a: 2, b: 1};

      qx.lang.Object.mergeWith(original, o1, false);

      // check the original
      this.assertEquals(0, original.a);
      this.assertEquals(1, original.b);
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

      original = [];
      original.push({a: {b: 0}});
      clone = qx.lang.Object.clone(original, true);
      this.assertEquals(0, clone[0].a.b);
      original[0].a.b = 1;
      this.assertEquals(0, clone[0].a.b);

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

    testEquals : function(){

      var a = {a: 'text', b:[0,1]};
      var b = {a: 'text', b:[0,1]};
      var c = {a: 'text', b: 0};
      var d = {a: 'text', b: false};
      var e = {a: 'text', b:[1,0]};
      var f = {a: 'text', b:[1,0], f: function(){ this.f = this.b; }};
      var g = {a: 'text', b:[1,0], f: function(){ this.f = this.b; }};
      var h = {a: 'text', b:[1,0], f: function(){ this.a = this.b; }};

      var i = {
          a: 'text',
          c: {
              b: [1, 0],
              f: function(){
                  this.a = this.b;
              }
          }
      };

      var j = {
          a: 'text',
          c: {
              b: [1, 0],
              f: function(){
                  this.a = this.b;
              }
          }
      };
      var k = {a: 'text', b: null};
      var l = {a: 'text', b: undefined};



      this.assertTrue(qx.lang.Object.equals(a,b));
      this.assertFalse(qx.lang.Object.equals(a,c));
      this.assertFalse(qx.lang.Object.equals(c,d));
      this.assertFalse(qx.lang.Object.equals(a,e));
      this.assertFalse(qx.lang.Object.equals(f,g));
      this.assertFalse(qx.lang.Object.equals(h,g));
      this.assertFalse(qx.lang.Object.equals(i,j));
      this.assertFalse(qx.lang.Object.equals(d,k));
      this.assertFalse(qx.lang.Object.equals(k,l));


      this.assertFalse(qx.lang.Object.equals({}, null));
      this.assertFalse(qx.lang.Object.equals({}, undefined));
      this.assertTrue(qx.lang.Object.equals('qooxdoo','qooxdoo'));
      this.assertTrue(qx.lang.Object.equals(5,5));
      this.assertFalse(qx.lang.Object.equals(5,10));
      this.assertFalse(qx.lang.Object.equals(1,'1'));
      this.assertTrue(qx.lang.Object.equals([],[]));
      this.assertTrue(qx.lang.Object.equals([1,2],[1,2]));
      this.assertFalse(qx.lang.Object.equals([1,2],[2,1]));
      this.assertFalse(qx.lang.Object.equals([1,2],[1,2,3]));
      this.assertTrue(qx.lang.Object.equals(new Date("03/31/2014"), new Date("03/31/2014")));
      this.assertFalse(qx.lang.Object.equals({1:{name:"mhc",age:28}, 2:{name:"arb",age:26}},{1:{name:"mhc",age:28}, 2:{name:"arb",age:27}}));
      this.assertFalse(qx.lang.Object.equals(function(x){return x;},function(y){return y+2;}));

    }

  }
});
