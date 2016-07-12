/* ************************************************************************

   qooxdoo - the new era of web development

   http://qooxdoo.org

   Copyright:
     2004-2011 1&1 Internet AG, Germany, http://www.1und1.de

   License:
     MIT: https://opensource.org/licenses/MIT
     See the LICENSE file in the project's top-level directory for details.

   Authors:
     * Daniel Wagner (d_wagner)

************************************************************************ */

qx.Class.define("qx.test.dev.unit.TestCase", {

  extend : qx.dev.unit.TestCase,

  members : {

    testSkip : function()
    {
      this.skip();
      this.fail("Executed code after calling skip()!");
    },


    testResumeHandler : function()
    {
      this.__do(this.resumeHandler(function(param) {
        this.assertEquals(param, "foo");

        return "bar";
      }, this));

      this.wait();
    },

    __do : function(callback)
    {
      window.setTimeout(this.__doSuccess.bind(this, callback), 0);
    },

    __doSuccess : function(callback)
    {
      var result = callback("foo");
      this.assertEquals(result, "bar");
    }
  }
});
