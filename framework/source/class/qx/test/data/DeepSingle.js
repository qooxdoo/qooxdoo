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
  },
  

  members :
  {       
    
    setUp : function()
    {
      this.__a = new test.MultiBinding().set({
        name: "a"
      });
      this.__b1 = new test.MultiBinding().set({
        name: "b1"
      });
      this.__b2 = new test.MultiBinding().set({
        name: "b2"
      });
      this.__label = new qx.ui.basic.Label();      
    },


    tearDown : function()
    {
      this.__b1.dispose();
      this.__b2.dispose();
      this.__a.dispose();
      this.__label.dispose();
    },
    
         

    testDepthOf2: function() {      
      // create a hierarchy
      // a --> b1
      this.__a.setChild(this.__b1);
      
      // create the binding
      // a --> b1 --> label
      qx.data.SingleValueBinding.bind(this.__a, "child.name", this.__label, "content");
      
      // just set the name of the second component
      this.__b1.setName("B1");
      this.assertEquals("B1", this.__label.getContent(), "Deep binding does not work with updating the first parameter.");      
      // change the second component
      // a --> b2 --> label
      this.__a.setChild(this.__b2);
      this.assertEquals("b2", this.__label.getContent(), "Deep binding does not work with updating the first parameter.");            
      // check for the null value
      // a --> null
      this.__a.setChild(null);
      this.assertNull(this.__label.getContent(), "Binding does not work with null.");
    },
    
    
    testDepthOf3: function(attribute) {
      // create a hierarchy
      var c1 = new test.MultiBinding().set({
        name: "c1"
      });
      var c2 = new test.MultiBinding().set({
        name: "c2"
      });            

      // a --> b1 --> c1 --> label
      //       b2 --> c2
      this.__a.setChild(this.__b1);
      this.__b1.setChild(c1);
      this.__b2.setChild(c2);
      
      // create the binding
      qx.data.SingleValueBinding.bind(this.__a, "child.child.name", this.__label, "content");
      
      // just set the name of the last component
      c1.setName("C1");
      this.assertEquals("C1", this.__label.getContent(), "Deep binding does not work with updating the third parameter.");
      
      // change the middle child
      // a --> b2 --> c2 --> label
      this.__a.setChild(this.__b2);
      this.assertEquals("c2", this.__label.getContent(), "Deep binding does not work with updating the second parameter.");
      
      // set the middle child to null
      // a --> null
      this.__a.setChild(null);
      this.assertNull(this.__label.getContent(), "Deep binding does not work with first null child.");
      
      // set only two childs
      // a --> b1 --> null
      this.__b1.setChild(null);
      this.__a.setChild(this.__b1);
      this.assertNull(this.__label.getContent(), "Deep binding does not work with second null child.");
      
      // set the childs in a row
      // a --> b1 --> c1 --> label
      this.__b1.setChild(c1);
      this.assertEquals("C1", this.__label.getContent(), "Deep binding does not work with updating the third parameter.");      
    },
    
    
    
    testDepthOf5: function(attribute) {
      // create a hierarchy
      var c = new test.MultiBinding().set({
        name: "c"
      });
      var d = new test.MultiBinding().set({
        name: "d"
      });
      var e = new test.MultiBinding().set({
        name: "e"
      });       
      
      // a --> b1 --> c --> d --> e --> label
      this.__a.setChild(this.__b1);
      this.__b1.setChild(c);
      c.setChild(d);
      d.setChild(e);
      
      // create the binding
      qx.data.SingleValueBinding.bind(this.__a, "child.child.child.child.name", this.__label, "content");
      
      // test if the binding did work
      this.assertEquals("e", this.__label.getContent(), "Deep binding does not work with updating the third parameter.");
    },
    
    
    testWrongDeep: function() {
      // create a hierarchy
      this.__a.setChild(this.__b1);
      
      var a = this.__a;
      var label = this.__label;
      // set a wrong first parameter in the chain
      this.assertException(function() {
        qx.data.SingleValueBinding.bind(a, "chiild.name", label, "content");
      }, qx.core.AssertionError, null, "Wrong property name.");
      
      // set a wrong second parameter in the chain
      this.assertException(function() {
        qx.data.SingleValueBinding.bind(a, "child.naame", label, "content");
      }, qx.core.AssertionError, null, "Wrong property name.");
            
      // set a complete wrong chain
      this.assertException(function() {
        qx.data.SingleValueBinding.bind(a, "affe", label, "content");
      }, qx.core.AssertionError, null, "Wrong property name.");
    },
    
    
    testSingle: function() {
      // set only one property in the chain
      qx.data.SingleValueBinding.bind(this.__a, "name", this.__label, "content");
      
      // chech the initial value
      this.assertEquals("a", this.__label.getContent(), "Single property names dont work!");
      // check the binding
      this.__a.setName("A");
      this.assertEquals("A", this.__label.getContent(), "Single property names dont work!");
    },
   
    
    testDebug: function(attribute) {
      // build the structure
      this.__a.setChild(this.__b1);
      // bind the stuff together
      var id = qx.data.SingleValueBinding.bind(this.__a, "child.name", this.__label, "content");
      
      // log this binding in the console
      qx.data.SingleValueBinding.showBindingInLog(this.__a, id);      
    },
    

    testRemove: function() {
      // build the structure
      this.__a.setChild(this.__b1);
      // bind the stuff together
      var id = qx.data.SingleValueBinding.bind(this.__a, "child.name", this.__label, "content");
      
      // check the binding
      this.__b1.setName("A");
      this.assertEquals("A", this.__label.getContent(), "Single property names dont work!");
  
      // remove the binding
      qx.data.SingleValueBinding.removeBindingFromObject(this.__a, id);
                  
      // check the binding again
      this.__a.setName("A2");
      this.assertEquals("A", this.__label.getContent(), "Removing does not work!");
      
      // smoke Test for the remove
      qx.data.SingleValueBinding.bind(this.__a, "child.name", this.__label, "content");
      qx.data.SingleValueBinding.bind(this.__a, "child.name", this.__label, "content");
      qx.data.SingleValueBinding.bind(this.__a, "child.name", this.__label, "content");
      
      qx.data.SingleValueBinding.removeAllBindings();
      
    }
       
  }
});
