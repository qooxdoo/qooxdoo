/* ************************************************************************

   qooxdoo - the new era of web development

   http://qooxdoo.org

   Copyright:
     2016 GONICUS GmbH, Germany, http://www.gonicus.de

   License:
     MIT: https://opensource.org/licenses/MIT
     See the LICENSE file in the project's top-level directory for details.

   Authors:
     * Cajus Pollmeier (cajus)

************************************************************************ */


qx.Class.define("qx.test.bom.IdleCallback",
{
  extend : qx.dev.unit.TestCase,
  include : [
    qx.dev.unit.MMock,
    qx.dev.unit.MRequirements
  ],

  members :
  {
    tearDown: function() {
      this.getSandbox().restore();
    },


    "test: emulated requestIdleCallback" : function() {
      var setting = this.stub(qx.core.Environment, "get").withArgs("client.idle");
      setting.returns(false);

      var clb = this.spy();
      qx.bom.IdleCallback.request(clb);
      this.getSandbox().restore();

      this.wait(500, function() {
        this.assertCalledOnce(clb);
        this.assertFalse(clb.args[0][0].didTimeout);
        this.assertFunction(clb.args[0][0].timeRemaining);
        this.assertNumber(clb.args[0][0].timeRemaining());
        this.assertNumber(clb.args[0][0].timeRemaining(), 0);
      }, this);
    },

    "test: emulated cancelIdleCallback" : function() {
      var setting = this.stub(qx.core.Environment, "get").withArgs("client.idle");
      setting.returns(false);

      var clb = this.spy();
      var request = qx.bom.IdleCallback.request(clb);
      qx.bom.IdleCallback.cancel(request);
      this.getSandbox().restore();

      this.wait(500, function() {
        this.assertNotCalled(clb);
      }, this);
    },


    "test: native requestIdleCallback" : function() {
      if (!qx.core.Environment.get("client.idle")) {
        this.skip();
      }

      var clb = this.spy();
      qx.bom.IdleCallback.request(clb);
      this.wait(500, function() {
        this.assertCalledOnce(clb);
        this.assertFalse(clb.args[0][0].didTimeout);
        this.assertFunction(clb.args[0][0].timeRemaining);
        this.assertNumber(clb.args[0][0].timeRemaining());
      }, this);
    },


    "test: native cancelIdleCallback" : function() {
      if (!qx.core.Environment.get("client.idle")) {
        this.skip();
      }

      var clb = this.spy();
      var request = qx.bom.IdleCallback.request(clb);
      qx.bom.IdleCallback.cancel(request);

      this.wait(500, function() {
        this.assertNotCalled(clb);
      }, this);
    }
  }
});
