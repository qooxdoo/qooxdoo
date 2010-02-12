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
     * Martin Wittemann (martinwittemann)

************************************************************************ */

qx.Class.define("qx.test.Bootstrap",
{
  extend : qx.dev.unit.TestCase,

  members :
  {
    "test: define class with contructor" : function()
    {
      qx.Bootstrap.define("qx.test.Construct",
      {
        extend: Object,
        construct : function() {
          this.called = true;
        }
      });
      
      var obj = new qx.test.Construct();
      this.assertTrue(obj.called);
      
      qx.Class.undefine("qx.test.Construct");      
    },
    
  
    "test: define bootstrap class, which extends 'Error'" : function()
    {
      qx.Bootstrap.define("qx.test.ExtendError", {
        extend: Error
      });
      
      var obj = new qx.test.ExtendError();
      this.assertInstance(obj, Error);
      
      qx.Class.undefine("qx.test.ExtendError");
    },
    
    
    "test: extend from qx.core.Object" : function()
    {
      qx.Bootstrap.define("qx.test.ExtendQxObject", {
        extend: qx.core.Object
      });
      
      var obj = new qx.test.ExtendQxObject();
      this.assertInstance(obj, qx.core.Object);
      
      obj.dispose();
      
      qx.Class.undefine("qx.test.ExtendQxObject");      
    },
    
    
    "test: extend from null should extend Object" : function()
    {
      qx.Bootstrap.define("qx.test.ExtendNull", {
        extend: null,
        members : {}
      });
      
      var obj = new qx.test.ExtendNull();
      this.assertInstance(obj, Object);
      
      qx.Class.undefine("qx.test.ExtendNull");            
    },
    
    
    "test: extend from Bootstrap class" : function()
    {
      qx.Bootstrap.define("qx.test.Super", {
        members : {}
      });

      qx.Bootstrap.define("qx.test.ExtendSuper", {
        extend: qx.test.Super,
        members : {}
      });
      
      var obj = new qx.test.ExtendSuper();
      
      this.assertInstance(obj, Object);
      this.assertInstance(obj, qx.test.Super);
      this.assertInstance(obj, qx.test.ExtendSuper);
      
      qx.Class.undefine("qx.test.Super"); 
      qx.Class.undefine("qx.test.ExtendSuper"); 
    },
    
    
    testFunctionWrap : function()
    {
      var context = null;
      var result = 0;

      var add = function(a, b)
      {
        context = this;
        return a + b;
      };

      context = null;
      result = add(1, 2);

      // The assertEquals test fails in Safari 3 but is fixed in WebKit nightly
      if (qx.bom.client.Browser.NAME == "safari" && qx.bom.client.Browser.VERSION < 4 ) {
        this.assertNotEquals(context, window, "This test fails if the issue is "
        + "fixed in Safari 3.");
      } else {
        this.assertEquals(context, window);
      }
      this.assertEquals(3, result);

      context = null;
      var boundAdd = qx.Bootstrap.bind(add, this);
      result = boundAdd(1, 3);
      this.assertEquals(context, this);
      this.assertEquals(4, result);

      context = null;
      var addOne = qx.Bootstrap.bind(add, this, 1);
      result = addOne(4);
      this.assertEquals(context, this);
      this.assertEquals(5, result);
    },
    
    
    testBindWithUndefinedArguments : function()
    {
      var undef;
      var callback = function(undef, arg) {
        this.assertTrue(arg)
      }
      var bound = qx.Bootstrap.bind(callback, this, undef, true);
      bound();
    }
  }
});
