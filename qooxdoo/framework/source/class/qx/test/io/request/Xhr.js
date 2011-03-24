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

      qx.Class.define("Klass", {
        extend : qx.core.Object,

        properties :
        {
          affe: {
            init: true
          }
        }
      });
    },

    tearDown : function() {
      this.getSandbox().restore();

      this.transport.dispose();
      this.req.dispose();

      qx.Class.undefine("Klass");
    },

    //
    // General
    //

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
    },

    //
    // Data with GET
    //

    "test: should not send data with GET request": function() {
      this.spy(this.transport, "send");
      this.req.setData("str");
      this.req.send();

      this.assertCalledWith(this.transport.send, null);
    },

    "test: should append string data to URL with GET request": function() {
      this.spy(this.transport, "open");
      this.req.setData("str");
      this.req.send();

      this.assertCalledWith(this.transport.open, "GET", "url?str");
    },

    "test: should append obj data to URL with GET request": function() {
      this.spy(this.transport, "open");
      this.req.setData({affe: true});
      this.req.send();

      this.assertCalledWith(this.transport.open, "GET", "url?affe=true");
    },

    "test: should append qooxdoo obj data to URL with GET request": function() {
      var obj = new Klass();
      this.spy(this.transport, "open");
      this.req.setData(obj);
      this.req.send();

      this.assertCalledWith(this.transport.open, "GET", "url?affe=true");
    },
    
    //
    // Data with POST
    //

    "test: should send string data with POST request": function() {
      this.spy(this.transport, "send");
      this.req.setMethod("POST");
      this.req.setData("str");
      this.req.send();

      this.assertCalledWith(this.transport.send, "str");
    },
    
    "test: should send obj data with POST request": function() {
      this.spy(this.transport, "send");
      this.req.setMethod("POST");
      this.req.setData({"af fe": true});
      this.req.send();

      this.assertCalledWith(this.transport.send, "af+fe=true");
    },
    
    "test: should send qooxdoo obj data with POST request": function() {
      var obj = new Klass();
      this.spy(this.transport, "send");
      this.req.setMethod("POST");
      this.req.setData(obj);
      this.req.send();

      this.assertCalledWith(this.transport.send, "affe=true");
    },
  }
});
