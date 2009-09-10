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

qx.Class.define("qx.test.List",
{
  extend : qx.dev.unit.TestCase,

  construct : function()
  {
    this.base(arguments);
    qx.List.define("qx.test.TestList", {});
  },


  members :
  {

    __isFF2 : function() {
      return (qx.bom.client.Engine.GECKO && qx.bom.client.Engine.VERSION < 3);
    },

    testListConstruct : function()
    {
      if (this.__isFF2())
      {
        qx.log.Logger.warn("This test is skipped in Firefox 2.");
        return ;
      }

      var list = new qx.test.TestList(10);
      this.assertEquals(10, list.length);

      list = new qx.test.TestList(1, 2, 3);
      this.assertArrayEquals([1, 2, 3], list);
    },

    testArrayLength : function()
    {
      if (this.__isFF2())
      {
        qx.log.Logger.warn("This test is skipped in Firefox 2.");
        return ;
      }

      var list = new qx.test.TestList(1, 2, 3);
      this.assertEquals(3, list.length);
    },

    testClear : function()
    {
      if (this.__isFF2())
      {
        qx.log.Logger.warn("This test is skipped in Firefox 2.");
        return ;
      }

      var list = new qx.test.TestList(1, 2, 3);
      list.length = 0;
      this.assertArrayEquals([], list)
    },

    testArrayJoin : function()
    {
      if (this.__isFF2())
      {
        qx.log.Logger.warn("This test is skipped in Firefox 2.");
        return ;
      }

      var list = new qx.test.TestList(1, 2, 3);
      this.assertEquals("1, 2, 3", list.join(", "));
    },

    testArrayConcat : function()
    {
      if (this.__isFF2())
      {
        qx.log.Logger.warn("This test is skipped in Firefox 2.");
        return ;
      }

      var list = new qx.test.TestList(1, 2, 3);
      this.assertArrayEquals([1, 2, 3, 4, 5], list.concat(4, 5));
    },

    testArrayPop : function()
    {
      if (this.__isFF2())
      {
        qx.log.Logger.warn("This test is skipped in Firefox 2.");
        return ;
      }

      var list = new qx.test.TestList(1, 2, 3);
      var popped = list.pop();
      this.assertEquals(3, popped);
      this.assertArrayEquals([1, 2], list);
    },

    testArrayPush : function()
    {
      if (this.__isFF2())
      {
        qx.log.Logger.warn("This test is skipped in Firefox 2.");
        return ;
      }

      var list = new qx.test.TestList(1, 2);
      var length = list.push(3);
      this.assertEquals(3, length);
      this.assertArrayEquals([1, 2, 3], list);

      var length = list.push(4, 5);
      this.assertEquals(5, length);
      this.assertArrayEquals([1, 2, 3, 4, 5], list);
    },

    testArrayReverse : function()
    {
      if (this.__isFF2())
      {
        qx.log.Logger.warn("This test is skipped in Firefox 2.");
        return ;
      }

      var list = new qx.test.TestList(1, 2, 3, 4, 5);
      list.reverse();
      this.assertArrayEquals([5, 4, 3, 2, 1], list);
      list.reverse();
      this.assertArrayEquals([1, 2, 3, 4, 5], list);
    },

    testArrayShift : function()
    {
      if (this.__isFF2())
      {
        qx.log.Logger.warn("This test is skipped in Firefox 2.");
        return ;
      }

      var list = new qx.test.TestList(1, 2, 3, 4, 5);
      var shifted = list.shift();
      this.assertEquals(1, shifted);
      this.assertArrayEquals([2, 3, 4, 5], list);
    },

    testArrayUnshift : function()
    {
      if (this.__isFF2())
      {
        qx.log.Logger.warn("This test is skipped in Firefox 2.");
        return ;
      }

      var list = new qx.test.TestList(2, 3, 4, 5);
      var length = list.unshift(1);
      this.assertArrayEquals([1, 2, 3, 4, 5], list);
    },

    testArraySlice : function()
    {
      if (this.__isFF2())
      {
        qx.log.Logger.warn("This test is skipped in Firefox 2.");
        return ;
      }

      var list = new qx.test.TestList(1, 2, 3, 4, 5);
      this.assertArrayEquals([3, 4], list.slice(2, 4));
      this.assertArrayEquals([2, 3, 4, 5], list.slice(1));
      this.assertArrayEquals([3, 4], list.slice(2, -1));
    },

    testArraySort : function()
    {
      if (this.__isFF2())
      {
        qx.log.Logger.warn("This test is skipped in Firefox 2.");
        return ;
      }

      var list = new qx.test.TestList(3, 5, 1, -1);
      var sorted = list.sort();
      this.assertArrayEquals([-1, 1, 3, 5], list);

      var list = new qx.test.TestList(3, 5, 1, -1);
      var sorted = list.sort(function(a, b) {
        return a > b ? -1 : 1;
      });
      this.assertArrayEquals([5, 3, 1, -1], list);
    },

    testArraySplice : function()
    {
      if (this.__isFF2())
      {
        qx.log.Logger.warn("This test is skipped in Firefox 2.");
        return ;
      }

      var list = new qx.test.TestList(1, 2, 3, 4, 5);
      var removed = list.splice(1, 2, 22, 33);
      this.assertArrayEquals([2, 3], removed);
      this.assertArrayEquals([1, 22, 33, 4, 5], list);
    },

    testArrayToString : function()
    {
      if (this.__isFF2())
      {
        qx.log.Logger.warn("This test is skipped in Firefox 2.");
        return ;
      }

      var list = new qx.test.TestList(1, 2, 3);
      this.assertEquals(list.join(), list.toString());
    },

    testArrayToLocaleString : function()
    {
      if (this.__isFF2())
      {
        qx.log.Logger.warn("This test is skipped in Firefox 2.");
        return ;
      }

      var list = new qx.test.TestList(1, 2, 3);
      this.assertEquals([1, 2, 3].toLocaleString(), list.toLocaleString());
    }
  }
});
