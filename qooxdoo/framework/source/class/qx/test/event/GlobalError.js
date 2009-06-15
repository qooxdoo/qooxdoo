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

qx.Class.define("qx.test.event.GlobalError",
{
  extend : qx.dev.unit.TestCase,

  members :
  {
    setUp : function()
    {
      qx.core.Setting.set("qx.globalErrorHandling", "on");
      this.errorHandler = qx.event.GlobalError;
      
      this.called = false;
      this.calledParams = [];
      this.errorHandler.setErrorHandler(this.onError, this);
    },
    
    
    onError : function(ex)
    {
      this.assertEquals(1, arguments.length);
      this.called = true;
      this.calledParams.push(ex);
    },
    
  
    testSetting : function()
    {      
      this.assertEquals("on", qx.core.Setting.get("qx.globalErrorHandling"));
    },
    
    
    testObserveMethod : function()
    {
      var fail = function() {
        throw new Error("fail"); 
      }
            
      var wrappedFail = this.errorHandler.observeMethod(fail);
      this.assertFalse(this.called);
      wrappedFail();
      this.assertTrue(this.called);
    },
    
    
    testDontWarpIfSettingIsOff : function()
    {
      qx.core.Setting.set("qx.globalErrorHandling", "off");
      
      var fcn = function() {};
      var wrapped = this.errorHandler.observeMethod(fcn);
      
      this.assertIdentical(fcn, wrapped);
    },
    
    
    testWrappedParameterAndReturnValue : function()
    {
      var args = null;
      
      var fcn = function(a,b,c) {
        var args = [a, b, c];
        return args;
      }
            
      var wrapped = this.errorHandler.observeMethod(fcn);
      this.assertJsonEquals(
        fcn(1, "2", true),
        wrapped(1, "2", true)
      );
    },
    
    
    testObserveMethodButNoHandler : function()
    {
      var fail = function() {
        throw new Error("fail"); 
      }
            
      var wrappedFail = this.errorHandler.observeMethod(fail);
      
      this.errorHandler.setErrorHandler(null, null);
      this.assertException(wrappedFail);
            
      this.errorHandler.setErrorHandler(this.onError, this);
      wrappedFail();
    }
    
    
    // timer setTimeout/setInterval - OK
    
    // addNativeListener - OK
    // attachEvent - OK
    
    // enabled but no error handler
    
    // mouse - OK
    // key - OK
    // focus - OK
    // scroll - OK
    // rpc/io - OK
    // load - OK
    // animation - OK
    // iframe - OK
  }
});