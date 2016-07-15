/* ************************************************************************

   qooxdoo - the new era of web development

   http://qooxdoo.org

   Copyright:
     2007-2012 1&1 Internet AG, Germany, http://www.1und1.de

   License:
     MIT: https://opensource.org/licenses/MIT
     See the LICENSE file in the project's top-level directory for details.

   Authors:
     * Martin Wittemann (wittemann)

************************************************************************ */


qx.Class.define("qx.test.bom.AnimationFrame",
{
  extend : qx.dev.unit.TestCase,
  include : [qx.dev.unit.MMock],

  members :
  {
    setUp : function()
    {
      this.__frame = new qx.bom.AnimationFrame();
    },


    testStart : function() {
      var clb = this.spy();
      this.__frame.once("frame", clb);
      this.__frame.startSequence(300);
      this.wait(500, function() {
        this.assertCalledOnce(clb);
        this.assertTrue(clb.args[0][0] >= 0);
      }, this);
    },


    testCancel : function() {
      var clb = this.spy();
      this.__frame.once("frame", clb);
      this.__frame.startSequence(300);
      this.__frame.cancelSequence();
      this.wait(500, function() {
        this.assertNotCalled(clb);
      }, this);
    }
  }
});