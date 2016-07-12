/* ************************************************************************

   qooxdoo - the new era of web development

   http://qooxdoo.org

   Copyright:
     2007-2012 1&1 Internet AG, Germany, http://www.1und1.de

   License:
     MIT: https://opensource.org/licenses/MIT
     See the LICENSE file in the project's top-level directory for details.

   Authors:
     * Daniel Wagner (danielwagner)

************************************************************************ */

qx.Class.define("qx.test.util.LibraryManager",
{
  extend : qx.dev.unit.TestCase,

  construct : function()
  {
    this.base(arguments);

    this.__mgr = qx.util.LibraryManager.getInstance();
    this.libKeys = ["sourceUri", "resourceUri"];

    this.__qxBackup = {};
    for (var key in qx.$$libraries.qx) {
      if (qx.$$libraries.qx.hasOwnProperty(key)) {
        this.__qxBackup[key] = qx.$$libraries.qx[key];
      }
    }
  },

  members :
  {
    __mgr : null,
    __qxBackup : null,
    libKeys : null,

    testHas : function()
    {
      this.assert(this.__mgr.has("qx"));
      this.assertFalse(this.__mgr.has("foo"));
    },

    testGet : function()
    {
      for (var i=0, l=this.libKeys.length; i<l; i++) {
        var key = this.libKeys[i];
        this.assertEquals(qx.$$libraries.qx[key], this.__mgr.get("qx", key));
      }
    },

    testSet : function()
    {
      for (var i=0, l=this.libKeys.length; i<l; i++) {
        var key = this.libKeys[i];
        this.__mgr.set("qx", key, "foo");
        this.assertEquals("foo", qx.$$libraries.qx[key]);
      }
    },

    tearDownTestSet : function()
    {
      for (var key in this.__qxBackup) {
        qx.$$libraries.qx[key] = this.__qxBackup[key];
      }
    }
  }
});