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

qx.Class.define("qx.test.bom.request.Xhr", 
{
  extend : qx.dev.unit.TestCase,

  include : qx.dev.unit.MMock,

  statics :
  {
    UNSENT: 0,
    OPENED: 1,
    HEADERS_RECEIVED: 2,
    LOADING: 3,
    DONE: 4
  },

  members :
  {
    /**
     * The faked XMLHttpRequest.
     */
    fakedXhr: null,
    
    /**
     * Tracks the instance created with the faked XMLHttpRequest.
     */
    fakeReqs: null,
    
    /**
     * The request to test.
     */
    req: null,
    
    setUp : function() 
    {
      this.req = new qx.bom.request.Xhr();
    },
    
    "test: should create instance": function() {
      this.assertObject(this.req);
    },
    
    "test: should prepare faked request": function() {
      this.fakeNativeXhr();
      var req = this.req;
      
      var fakeReq = this.fakeReqs[0];
      var spyFakeReqOpen = this.spy(fakeReq, "open");
      
      var url = "/foo";
      var method = "GET";
      req.open(method, url);
      
      this.assertCalledWith(spyFakeReqOpen, method, url);
      this.assertEquals(this.constructor.OPENED, req.readyState);
    },
    
    "test: should prepare actual request": function() {
      var req = this.req;
      
      var url = "/foo";
      var method = "GET";
      var spyNxhrOpen = this.spy(req._nxhr, "open");
      req.open(method, url);
      
      this.assertCalledWith(spyNxhrOpen, method, url);
      this.assertEquals(this.constructor.OPENED, req.readyState);
    },
    
    fakeNativeXhr: function() {
      var fakeReqs = this.fakeReqs = [];
      this.fakedXhr = this.useFakeXMLHttpRequest();
      this.fakedXhr.onCreate = function(xhr) {
        fakeReqs.push(xhr);
      };
      
      // Need to set-up request again so that 
      // it uses the faked XHR
      this.req = new qx.bom.request.Xhr();
    },
    
    tearDown : function() 
    {
      this.req = null;
      
      // Restore native XMLHttpRequest
      if (this.fakedXhr) {
        this.fakedXhr.restore();
      }
      
      // Empty request queue
      this.fakeReqs = [];
    }
    
  }
});
