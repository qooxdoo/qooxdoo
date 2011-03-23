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
      // Stub _createTransport in qx.io.request.Xhr
      var transport = new qx.bom.request.Xhr();
      var stubCreateTransport = this.stub(qx.io.request.Xhr.prototype, "_createTransport").
          returns(this.stub(transport));
      var req =  new qx.io.request.Xhr;
      
      this.transport = transport;
      this.stubCreateTransport = stubCreateTransport;
      this.req = req;
    },
    
    tearDown : function() {
      // Restore
      this.stubCreateTransport.restore();
      
      this.transport.dispose();
      this.req.dispose();
    },
    
    "test: should send request": function() {
      var req = this.req;
      var transport = this.transport;
      
      this.spy(transport, "open");
      this.spy(transport, "send");
      
      req.setUrl("sample.json");
      req.send();
      
      this.assertCalledWith(transport.open, "GET", "sample.json");
      this.assertCalled(transport.send);
    }
    
  }
});
