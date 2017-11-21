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
     * Christian Hagendorn (chris_schmidt)

************************************************************************ */

qx.Class.define("qx.test.lang.Array",
{
  extend : qx.dev.unit.TestCase,

  members :
  {
    /**
     * Array tests
     *
     */
    testAppend : function()
    {
      this.assertNotUndefined(qx.lang.Array.append);
      var a = [ 1, 2, 3 ];
      qx.lang.Array.append(a, [ 4, 5, 6 ]);
      this.assertJsonEquals(a, [ 1, 2, 3, 4, 5, 6 ]);

      var a = [ 1, 2, 3 ];
      qx.lang.Array.append(a, new qx.data.Array([ 4, 5, 6 ]));
      this.assertJsonEquals(a, [ 1, 2, 3, 4, 5, 6 ]);

      var a = new qx.data.Array([ 1, 2, 3 ]);
      qx.lang.Array.append(a, [ 4, 5, 6 ]);
      this.assertJsonEquals(a.toArray(), [ 1, 2, 3, 4, 5, 6 ]);
      a.dispose();

      var error = false;

      try {
        qx.lang.Array.append(a, 1);
      } catch(ex) {
        error = true;
      }

      this.assert(error);
    },
    
    
    testExclude : function() {
      var a = [ 1, 2, 3, 4, 5 ];
      qx.lang.Array.exclude(a, [ 2, 4 ]);
      this.assertJsonEquals([ 1, 3, 5 ], a);
      
      var a = [0,1,2,3,4,5,6,7,8,9];
      qx.lang.Array.exclude(a, [1,2,3]);
      this.assertJsonEquals([0,4,5,6,7,8,9], a);
      
      var a = [ 1, 2, 3, 4, 5 ];
      qx.lang.Array.exclude(a, new qx.data.Array([ 1, 3, 5 ]));
      this.assertJsonEquals([ 2, 4 ], a);
      
      var a = [0,1,2,3,4,5,6,7,8,9];
      qx.lang.Array.exclude(a, new qx.data.Array([ 1,2,3 ]));
      this.assertJsonEquals([0,4,5,6,7,8,9], a);
      
      var a = new qx.data.Array([ 1, 2, 3, 4, 5 ]);
      qx.lang.Array.exclude(a, [ 1, 3, 5 ]);
      this.assertJsonEquals([ 2, 4 ], a.toArray());
      a.dispose();
      
      var a = new qx.data.Array([0,1,2,3,4,5,6,7,8,9]);
      qx.lang.Array.exclude(a, [1,2,3]);
      this.assertJsonEquals([0,4,5,6,7,8,9], a.toArray());
      a.dispose();
    },


    testMinNumeric : function()
    {
      var a = [ -3, -2, -1, 0, 1, 2, 3 ];
      var result = qx.lang.Array.min(a);
      this.assertEquals(-3, result);
    },


    testMaxNumeric : function()
    {
      var a = [ -3, -2, -1, 0, 1, 2, 3 ];
      var result = qx.lang.Array.max(a);
      this.assertEquals(3, result);
    },


    testMinMixed : function()
    {
      var a = [ -3, -2, -1, 0, 1, 2, 3, 'foo', 'bar', undefined, null ];
      var result = qx.lang.Array.min(a);
      this.assertEquals(-3, result);
    },


    testMaxMixed : function()
    {
      var a = [ -3, -2, -1, 0, 1, 2, 3, 'foo', 'bar', undefined, null ];
      var result = qx.lang.Array.max(a);
      this.assertEquals(3, result);
    },


    testMinEmpty : function()
    {
      var a = [ ];
      var result = qx.lang.Array.min(a);
      this.assertEquals(null, result);
    },


    testMaxEmpty : function()
    {
      var a = [ ];
      var result = qx.lang.Array.max(a);
      this.assertEquals(null, result);
    },


    testRemove : function()
    {
      var a = [ -3, -2, -1, 0, 1, 2, 3 ];
      qx.lang.Array.remove(a, 2);

      this.assertJsonEquals(a, [ -3, -2, -1, 0, 1, 3 ]);
      this.assertEquals(6, a.length);
      
      var da = new qx.data.Array([ -3, -2, -1, 0, 1, 2, 3 ]);
      qx.lang.Array.remove(da, 2);

      this.assertJsonEquals(da.toArray(), [ -3, -2, -1, 0, 1, 3 ]);
      this.assertEquals(6, da.length);
    },


    testRemoveAt : function()
    {
      var a = [ -3, -2, -1, 0, 1, 2, 3 ];
      qx.lang.Array.removeAt(a, 3);

      this.assertJsonEquals(a, [ -3, -2, -1, 1, 2, 3 ]);
      this.assertEquals(6, a.length);
    },


    testRemoveAll : function()
    {
      var a = [ -3, -2, -1, 0, 1, 2, 3 ];
      qx.lang.Array.removeAll(a);

      this.assertJsonEquals(a, []);
      this.assertEquals(0, a.length);
    },
    
    
    testContains: function() {
      var a = [ -3, -2, -1, 0, 1, 2, 3 ];
      var da = new qx.data.Array(a);

      this.assertTrue(a.includes(-2));
      this.assertFalse(a.includes(-10));
      this.assertTrue(da.includes(-2));
      this.assertFalse(da.includes(-10));
      
      da.dispose();
    },
    
    
    testEquals : function() {
      var a = [ -3, -2, -1, 0, 1, 2, 3 ];
      var da = new qx.data.Array(a);
      
      this.assertFalse(da.toArray() === a);
      this.assertTrue(qx.lang.Array.equals(a, da));
      this.assertTrue(qx.lang.Array.equals(da, a));
      this.assertFalse(qx.lang.Array.equals(a, [ 4, 5, 6 ]));
    },
    
    
    testReplace: function() {
      var a = [ 1, 2, 3 ];
      var tmp = qx.lang.Array.replace(a, [ "one", "two", "three" ]);
      this.assertTrue(a === tmp);
      this.assertArrayEquals([ "one", "two", "three" ], a);
    },


    testToNativeArray : function() {
      var da = new qx.data.Array([ 1, 2, 3 ]);
      var na = qx.lang.Array.toNativeArray(da);
      this.assertTrue(da.toArray() === na);
      na = qx.lang.Array.toNativeArray(da, true);
      this.assertTrue(da.toArray() !== na);
      this.assertArrayEquals([ 1, 2, 3 ], na);
    }
  }
});
