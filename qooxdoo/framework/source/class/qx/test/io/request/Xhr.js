/* ************************************************************************

   qooxdoo - the new era of web development

   http://qooxdoo.org

   Copyright:
     2004-2011 1&1 Internet AG, Germany, http://www.1und1.de

   License:
     LGPL: http://www.gnu.org/licenses/lgpl.html
     EPL: http://www.eclipse.org/org/documents/epl-v10.php
     See the LICENSE file in the project's top-level directory for details.

   Authors:
     * Tristan Koch (tristankoch)

************************************************************************ */

qx.Class.define("qx.test.io.request.Xhr",
{
  extend : qx.dev.unit.TestCase,

  include : qx.dev.unit.MMock,

  members :
  {
    setUp : function() {
      this.transport = new qx.bom.request.Xhr();
      this.stub(qx.io.request.Xhr.prototype, "_createTransport").
          returns(this.stub(this.transport));

      this.req = new qx.io.request.Xhr;
      this.req.setUrl("url");
    },

    tearDown : function() {
      this.getSandbox().restore();

      this.transport.dispose();
      this.req.dispose();
    },

    "test: should send request": function() {
      this.spy(this.transport, "open");
      this.spy(this.transport, "send");

      this.req.send();

      this.assertCalledWith(this.transport.open, "GET", "url", true);
      this.assertCalled(this.transport.send);
    },

    "test: should send sync request": function() {
      this.spy(this.transport, "open");

      this.req.setAsync(false);
      this.req.send();

      this.assertCalledWith(this.transport.open, "GET", "url", false);
    },

    "test: should send POST request": function() {
      this.spy(this.transport, "open");
      this.req.setMethod("POST");
      this.req.send();

      this.assertCalledWith(this.transport.open, "POST");
    },

    "test: should send authorized request": function() {
      this.spy(this.transport, "open");
      this.req.setUsername("affe");
      this.req.setPassword("geheim");

      this.req.send();

      this.assertCalledWith(this.transport.open, "GET", "url", true, "affe", "geheim");
    }

  }
});
