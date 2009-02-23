/* ************************************************************************

   qooxdoo - the new era of web development

   http://qooxdoo.org

   Copyright:
     2004-2008 1&1 Internet AG, Germany, http://www.1und1.de

   License:
     LGPL: http://www.gnu.org/licenses/lgpl.html
     EPL: http://www.eclipse.org/org/documents/epl-v10.php
     See the LICENSE file in the project's top-level directory for details.

   Authors:
     * Martin Wittemann (martinwittemann)

************************************************************************ */

/* ************************************************************************

#asset(qx/test/*)

************************************************************************ */

qx.Class.define("qx.test.data.marshal.Json",
{
  extend : qx.dev.unit.TestCase,

  members :
  {

    setUp : function()
    {
      this.__marshaler = new qx.data.marshal.Json();
      
      this.__data = eval("({s: 'String', n: 12, b: true})");
      this.__propertyNames = ["s", "n", "b"];
    },


    tearDown : function()
    {
      this.__marshaler.dispose();
      
      // remove the former created classes
      qx.data.model = {};
      for (var name in qx.Class.$$registry) {
        if (name.search("qx.data.model") != -1) {
          delete qx.Class.$$registry[name];
        }
      } 
    },
  
  
    testClassCreationSingle: function() {
      this.__marshaler.jsonToClass(this.__data);

      // check if the class is defined
      this.assertTrue(qx.Class.isDefined("qx.data.model.b n s"), "Class not created.");
      
      var clazz = qx.Class.getByName("qx.data.model.b n s");
      // check for the properties
      var i = 0;
      for (var name in clazz.$$properties) {
        this.assertEquals(this.__propertyNames[i], name, "Property " + i + "does have the wrong name.");
        this.assertEquals("change" + qx.lang.String.firstUp(this.__propertyNames[i]), clazz.$$properties[name].event, "event has a wrong name.");
        i++;
      }
    },
    
    
    testClassCreationArray: function() {
      this.__data = eval("({a: ['a', 'b', 'c']})");
      
      this.__marshaler.jsonToClass(this.__data);
      
      // check if the class is defined
      this.assertTrue(qx.Class.isDefined("qx.data.model.a"), "Class not created.");
      
      var clazz = qx.Class.getByName("qx.data.model.a");
      // check for the property
      this.assertNotNull(clazz.$$properties.a, "Property does not exist.");      
    },
    
    
    testClassCreationObject: function() {
      this.__data = eval("({a: {b: 'test'}})");
      
      this.__marshaler.jsonToClass(this.__data);
      
      // check if the classes are defined
      this.assertTrue(qx.Class.isDefined("qx.data.model.a"), "Class not created.");
      this.assertTrue(qx.Class.isDefined("qx.data.model.b"), "Class not created.");
      
            
      var clazz = qx.Class.getByName("qx.data.model.a");
      var clazz2 = qx.Class.getByName("qx.data.model.b");      
      // check for the property
      this.assertNotNull(clazz.$$properties.a, "Property does not exist."); 
      this.assertNotNull(clazz2.$$properties.b, "Property does not exist.");     
    },
    
    
    testClassCreationArrayWithObject: function() {
      this.__data = eval("({a: [{b: 'test'}, {b: 'test'}]})");
      
      this.__marshaler.jsonToClass(this.__data);
      
      // check if the classes are defined
      this.assertTrue(qx.Class.isDefined("qx.data.model.a"), "Class not created.");
      this.assertTrue(qx.Class.isDefined("qx.data.model.b"), "Class not created.");
      
      var clazz = qx.Class.getByName("qx.data.model.a");
      var clazz2 = qx.Class.getByName("qx.data.model.b");      
      // check for the property
      this.assertNotNull(clazz.$$properties.a, "Property does not exist."); 
      this.assertNotNull(clazz2.$$properties.b, "Property does not exist.");  
    },
    
    
    testClassCreationAllSmoke: function() {
      this.__data = eval("({a: [{b: 'test', c: ['f', 'x', 'e']}, {b: 'test', affe: false}], t: {f: null, r: 152, q: true}})");      
      this.__marshaler.jsonToClass(this.__data);
    },
    
    
    testModelWithNumber: function() {
      this.__data = eval("({a: 10, b: -15, c: 10.5e10})");
      // first create the classes befor setting the data
      this.__marshaler.jsonToClass(this.__data);
      // set the data
      var model = this.__marshaler.jsonToModel(this.__data);
      
      // check the model
      this.assertEquals(10, model.getA(), "getA does not work.");
      this.assertEquals(-15, model.getB(), "getB does not work.");
      this.assertEquals(10.5e10, model.getC(), "getC does not work.");
    },
    
    
    testModelWithBoolean: function() {
      this.__data = eval("({a: true, b: false})");
      // first create the classes befor setting the data
      this.__marshaler.jsonToClass(this.__data);
      // set the data
      var model = this.__marshaler.jsonToModel(this.__data);
      
      // check the model
      this.assertEquals(true, model.getA(), "getA does not work.");
      this.assertEquals(false, model.getB(), "getB does not work.");
    },
    
    
    testModelWithString: function() {
      this.__data = eval("({a: 'affe', b: 'AFFE'})");
      // first create the classes befor setting the data
      this.__marshaler.jsonToClass(this.__data);
      // set the data
      var model = this.__marshaler.jsonToModel(this.__data);
      
      // check the model
      this.assertEquals("affe", model.getA(), "getA does not work.");
      this.assertEquals("AFFE", model.getB(), "getB does not work.");
    },
    
    
    testModelWithPrimitive: function() {
      this.__data = eval("({a: 'affe', b: true, c: 156})");
      // first create the classes befor setting the data
      this.__marshaler.jsonToClass(this.__data);
      // set the data
      var model = this.__marshaler.jsonToModel(this.__data);
      
      // check the model
      this.assertEquals("affe", model.getA(), "getA does not work.");
      this.assertEquals(true, model.getB(), "getB does not work.");
      this.assertEquals(156, model.getC(), "getC does not work.");
    },
    
    
    testModelWithArrayPrimitive: function() {
      this.__data = eval("({a: ['affe', 'affen', 'AFFE']})");
      // first create the classes befor setting the data
      this.__marshaler.jsonToClass(this.__data);
      // set the data
      var model = this.__marshaler.jsonToModel(this.__data);
      
      // check the model
      var a = model.getA();
      this.assertNotNull(a, "Nothing stored in the property a.");
      this.assertEquals("qx.data.Array", a.classname, "Its not an data array.");
      this.assertEquals("affe", a.getItem(0), "Item 0 is wrong");
      this.assertEquals("affen", a.getItem(1), "Item 1 is wrong");
      this.assertEquals("AFFE", a.getItem(2), "Item 2 is wrong");
    },
    
    
    testModelWithArrayArray: function() {
      this.__data = eval("({a: [[true, false], [10, 15]]})");
      // first create the classes befor setting the data
      this.__marshaler.jsonToClass(this.__data);
      // set the data
      var model = this.__marshaler.jsonToModel(this.__data);
      
      // check the model
      var a = model.getA();
      this.assertNotNull(a, "Nothing stored in the property a.");
      this.assertEquals("qx.data.Array", a.classname, "Its not an data array.");

      var a0 = a.getItem(0);
      this.assertEquals("qx.data.Array", a0.classname, "Its not an data array.");
      this.assertEquals(true, a0.getItem(0), "Item 0 is wrong");
      this.assertEquals(false, a0.getItem(1), "Item 1 is wrong");

      var a1 = a.getItem(1);      
      this.assertEquals("qx.data.Array", a1.classname, "Its not an data array.");
      this.assertEquals(10, a1.getItem(0), "Item 0 is wrong");
      this.assertEquals(15, a1.getItem(1), "Item 1 is wrong");      
    },
    
    
    testModelWithObjectPrimitive: function() {
      this.__data = eval("({a: {b: true, bb: false}, aa: {c: 15, cc: -89}})");
      // first create the classes befor setting the data
      this.__marshaler.jsonToClass(this.__data);
      // set the data
      var model = this.__marshaler.jsonToModel(this.__data);
      
      // check the model
      var a = model.getA();
      this.assertNotNull(a, "Nothing stored in the property a.");      
      this.assertEquals(true, a.getB(), "b is not set");
      this.assertEquals(false, a.getBb(), "bb is not set");
      
      var aa = model.getAa();
      this.assertNotNull(aa, "Nothing stored in the property a.");      
      this.assertEquals(15, aa.getC(), "c is not set");
      this.assertEquals(-89, aa.getCc(), "cc is not set");      
    },
    
    
    testModelWithObjectArray: function() {
      this.__data = eval("({a: {b: ['affe', 'AFFE']}})");
      // first create the classes befor setting the data
      this.__marshaler.jsonToClass(this.__data);
      // set the data
      var model = this.__marshaler.jsonToModel(this.__data);
      
      // check the model
      var a = model.getA();
      this.assertNotNull(a, "Nothing stored in the property a.");
      var b = a.getB();
      this.assertNotNull(b, "Nothing stored in the property b.");      
      this.assertEquals("qx.data.Array", b.classname, "b is not an data array");
      this.assertEquals("affe", b.getItem(0), "Item 0 is wrong.");
      this.assertEquals("AFFE", b.getItem(1), "Item 1 is wrong.");           
    },
    
    
    testModelWithArrayObject: function() {
      this.__data = eval("({a: [{a: 15}, {a: true}]})");
      // first create the classes befor setting the data
      this.__marshaler.jsonToClass(this.__data);
      // set the data
      var model = this.__marshaler.jsonToModel(this.__data);
      
      // check the model
      var a = model.getA();
      this.assertNotNull(a, "Nothing stored in the property a.");
      this.assertEquals("qx.data.Array", a.classname, "b is not an data array");
      
      this.assertEquals(15, a.getItem(0).getA(), "Item 0 is wrong.");
      this.assertEquals(true, a.getItem(1).getA(), "Item 1 is wrong.");
      
      // check if only one class is created and used
      this.assertEquals(model.classname, a.getItem(0).classname, "Differen classes");
      this.assertEquals(model.classname, a.getItem(1).classname, "Differen classes");
      this.assertEquals(a.getItem(0).classname, a.getItem(1).classname, "Differen classes");
    },
    
    
    testModelWithObjectObject: function() {
      this.__data = eval("({a: {a: {a: 'affe'}}})");
      // first create the classes befor setting the data
      this.__marshaler.jsonToClass(this.__data);
      // set the data
      var model = this.__marshaler.jsonToModel(this.__data);
      
      // check the model      
      this.assertEquals("affe", model.getA().getA().getA(), "No affe is there!");
    },
    
    
    testModelWithAllSmoke: function() {
      this.__data = eval("({a: [{aa: ['affe'], ab: false, ac: []}, {}, true, 15, 'affe'], b: 'Affe', c: {ca: 156, cb: [null, null], cc: true}})");
      // first create the classes befor setting the data
      this.__marshaler.jsonToClass(this.__data);
      // set the data
      var model = this.__marshaler.jsonToModel(this.__data);
      
      this.assertNotNull(model, "No model set.");      
    }

  }
});