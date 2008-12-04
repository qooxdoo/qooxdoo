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
     * Martin Wittemann (martinwittemann)
     
************************************************************************ */
/**
 * Test-Class for testing the single value binding
 */
qx.Class.define("qx.test.data.DeepSingle",
{
  extend : qx.dev.unit.TestCase,

  construct : function() {
    this.base(arguments);    
  },
  

  members :
  {        

    testDeepBinding: function() {
      // define a test class
      qx.Class.define("test.MultiBinding", 
      {
        extend : qx.core.Object,

        properties :
        {
          child : {
            check : "test.MultiBinding",
            event : "changeChild",
            nullable : true
          },
          
          name : {
            check : "String",
            init : "Juhu",
            event : "changeName"
          }
        }
      });
      
      // create a hierarchy
      var a = new test.MultiBinding().set({
        name: "a"
      });
      var b1 = new test.MultiBinding().set({
        name: "b1"
      });
      var b2 = new test.MultiBinding().set({
        name: "b2"
      });
      a.setChild(b1);
      
      var label = new qx.ui.basic.Label();
      qx.data.SingleValueBinding.bind(a, "child.name", label, "content");
      
      b1.setName("B1");
      this.assertEquals("B1", label.getContent(), "Deep binding does not work with updating the first parameter.");      
      
      a.setChild(b2);
      this.assertEquals("b2", label.getContent(), "Deep binding does not work with updating the first parameter.");            
    
      a.setChild(null);
      this.assertNull(label.getContent(), "");            
    }
    
       
  }
});
