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
qx.Class.define("qx.test.data.singlevalue.Simple",
{
  extend : qx.dev.unit.TestCase,

  construct : function() {
    this.base(arguments);

    // create the widgets
    this.__a = new qx.ui.form.TextField();
    this.__b = new qx.ui.form.TextField();
  },


  members :
  {

    testStringPropertyBinding : function()
    {
      qx.data.SingleValueBinding.bindPropertyToProperty(this.__a, "name", this.__b, "name");
      this.__a.setName("affe");
      this.assertEquals("affe", this.__b.getName(), "String binding does not work!");

      var affe = new qx.ui.form.TextField()
      affe.setName("Jonny");
      qx.data.SingleValueBinding.bindPropertyToProperty(affe, "name", this.__b, "name");
      this.assertEquals("Jonny", this.__b.getName(), "String binding does not work!");
      affe.destroy();
    },


    testBooleanPropertyBinding : function()
    {
      qx.data.SingleValueBinding.bindPropertyToProperty(this.__a, "enabled", this.__b, "enabled");
      this.__a.setEnabled(false);
      this.assertFalse(this.__b.getEnabled(), "Boolean binding does not work!");
    },


    testNumberPropertyBinding : function()
    {
      qx.data.SingleValueBinding.bindPropertyToProperty(this.__a, "zIndex", this.__b, "zIndex");
      this.__a.setZIndex(2456);
      this.assertEquals(2456, this.__b.getZIndex(), "Number binding does not work!");
    },


    testColorPropertyBinding : function()
    {
      qx.data.SingleValueBinding.bindPropertyToProperty(this.__a, "backgroundColor", this.__b, "backgroundColor");
      this.__a.setBackgroundColor("red");
      this.assertEquals("red", this.__b.getBackgroundColor(), "Color binding does not work!");
    },


    testWrongPropertyNames : function()
    {
      if (qx.core.Variant.isSet("qx.debug", "on")) {
        var a = this.__a;
        var b = this.__b;

        // only in source version
        if (qx.core.Variant.isSet("qx.debug", "on")) {
          // wrong source
          this.assertException(function() {
            qx.data.SingleValueBinding.bindPropertyToProperty(a, "BackgroundColor", b, "backgroundColor");
          }, qx.core.AssertionError, null, "Not a wrong property name? (source)");

          // wrong target
          this.assertException(function() {
            qx.data.SingleValueBinding.bindPropertyToProperty(a, "backgroundColor", b, "affe");
          }, qx.core.AssertionError, null, "Not a wrong property name? (target)");
        }
      }
    },


    testWrongEventType : function()
    {
      if (qx.core.Variant.isSet("qx.debug", "on")) {
        var a = this.__a;
        var b = this.__b;

        // only in source version
        if (qx.core.Variant.isSet("qx.debug", "on")) {
          // wrong eventName
          this.assertException(function() {
            qx.data.SingleValueBinding.bindEventToProperty(a, "affe", b, "backgroundColor");
          }, null, null, "Not a wrong event name? (source)");
        }
      }
    },


    testDefaultConversion : function()
    {
      // String to number
      qx.data.SingleValueBinding.bindPropertyToProperty(this.__a, "name", this.__b, "zIndex");
      this.__a.setName("4879");
      this.assertEquals(4879, this.__b.getZIndex(), "String --> Number does not work!");

      // number to String
      qx.data.SingleValueBinding.bindPropertyToProperty(this.__a, "zIndex", this.__b, "name");
      this.__a.setZIndex(1234);
      this.assertEquals("1234", this.__b.getName(), "Number --> String does not work!");

      // boolean to string
      qx.data.SingleValueBinding.bindPropertyToProperty(this.__a, "enabled", this.__b, "name");
      this.__a.setEnabled(true);
      this.assertEquals("true", this.__b.getName(), "Boolean --> String does not work!");

      // string to float
      var s = new qx.ui.form.Slider();
      qx.data.SingleValueBinding.bindPropertyToProperty(s, "value", this.__b, "name");
      s.setValue(13.5);
      this.assertEquals("13.5", this.__b.getName(), "Float --> String does not work!");
    },


    testRemoveBinding: function(){
      // remove all bindings
      qx.data.SingleValueBinding.removeAllBindings();
      // add a binging
      var id = qx.data.SingleValueBinding.bindPropertyToProperty(this.__a, "name", this.__b, "name");
      // set and chech the name
      this.__a.setName("hans");
      this.assertEquals("hans", this.__b.getName(), "String binding does not work!");

      // remove the binding
      qx.data.SingleValueBinding.removeBindingFromObject(this.__a, id);
      // set and chech the name
      this.__a.setName("hans2");
      this.assertEquals("hans", this.__b.getName(), "Did not remove the binding!");

      // test if the binding is not listed anymore
      var bindings = qx.data.SingleValueBinding.getAllBindingsForObject(this.__a);
      this.assertEquals(0, bindings.length, "Binding still in the registry!");

      // only in source version
      if (qx.core.Variant.isSet("qx.debug", "on")) {
        // test wrong binding id
        var a = this.__a;
        this.assertException(function() {
          qx.data.SingleValueBinding.removeBindingFromObject(a, null);
        }, Error, null, "No exception thrown.");
      }
    },


    testGetAllBindingsForObject: function(){
      // remove all old bindings
      qx.data.SingleValueBinding.removeAllBindings();

      // add two binging
      var id = qx.data.SingleValueBinding.bindPropertyToProperty(this.__a, "name", this.__b, "name");
      var id2 = qx.data.SingleValueBinding.bindPropertyToProperty(this.__a, "zIndex", this.__b, "zIndex");
      // set and chech the binding
      this.__a.setName("hans");
      this.assertEquals("hans", this.__b.getName(), "String binding does not work!");
      this.__a.setZIndex(89);
      this.assertEquals(89, this.__b.getZIndex(), "Number binding does not work!");

      // check the method
      var bindings = qx.data.SingleValueBinding.getAllBindingsForObject(this.__a);
      this.assertEquals(2, bindings.length, "There are more than 2 bindings!");
      this.assertEquals(id, bindings[0][0], "Binding 1 not in the array.");
      this.assertEquals(id2, bindings[1][0], "Binding 2 not in the array.");

      // check for a non existing binding
      var noBindings = qx.data.SingleValueBinding.getAllBindingsForObject(this);
      this.assertEquals(0, noBindings.length, "There are bindings for this?");
    },


    testRemoveAllBindingsForObject: function() {
      // add two binging
      qx.data.SingleValueBinding.bindPropertyToProperty(this.__a, "name", this.__b, "name");
      qx.data.SingleValueBinding.bindPropertyToProperty(this.__a, "zIndex", this.__b, "zIndex");
      // set and chech the binding
      this.__a.setName("hans");
      this.assertEquals("hans", this.__b.getName(), "String binding does not work!");
      this.__a.setZIndex(89);
      this.assertEquals(89, this.__b.getZIndex(), "Number binding does not work!");

      // remove the bindings at once
      qx.data.SingleValueBinding.removeAllBindingsForObject(this.__a);

      // set and chech the binding
      this.__a.setName("hans2");
      this.assertEquals("hans", this.__b.getName(), "String binding not removed!");
      this.__a.setZIndex(892);
      this.assertEquals(89, this.__b.getZIndex(), "Number binding not removed!");

      // check if they are internaly removed
      var bindings = qx.data.SingleValueBinding.getAllBindingsForObject(this.__a);
      this.assertEquals(0, bindings.length, "Still bindings there!");

      // only test in the source version
      if (qx.core.Variant.isSet("qx.debug", "on")) {
        // test for null object
        this.assertException(function() {
          qx.data.SingleValueBinding.removeAllBindingsForObject(null);
        }, qx.core.AssertionError, null, "Null is not possible!");
      }

   },


    testRemoveAllBindings: function(){
      // add three binging
      qx.data.SingleValueBinding.bindPropertyToProperty(this.__a, "name", this.__b, "name");
      qx.data.SingleValueBinding.bindPropertyToProperty(this.__a, "zIndex", this.__b, "zIndex");
      qx.data.SingleValueBinding.bindPropertyToProperty(this.__b, "zIndex", this.__a, "zIndex");

      // check if the bindings are there
      var bindingsA = qx.data.SingleValueBinding.getAllBindingsForObject(this.__a);
      var bindingsB = qx.data.SingleValueBinding.getAllBindingsForObject(this.__b);
      this.assertEquals(2, bindingsA.length, "There are more than 2 bindings!");
      this.assertEquals(1, bindingsB.length, "There are more than 2 bindings!");

      // remove all bindings
      qx.data.SingleValueBinding.removeAllBindings();

      var bindingsA = qx.data.SingleValueBinding.getAllBindingsForObject(this.__a);
      var bindingsB = qx.data.SingleValueBinding.getAllBindingsForObject(this.__b);
      this.assertEquals(0, bindingsA.length, "Still bindings there!");
      this.assertEquals(0, bindingsB.length, "Still bindings there!");
    },


    testGetAllBindings: function(){
      // remove all bindings
      qx.data.SingleValueBinding.removeAllBindings();

      // add three bindings
      var id1 = qx.data.SingleValueBinding.bindPropertyToProperty(this.__a, "name", this.__b, "name");
      var id2 = qx.data.SingleValueBinding.bindPropertyToProperty(this.__a, "zIndex", this.__b, "zIndex");
      var id3 = qx.data.SingleValueBinding.bindPropertyToProperty(this.__b, "zIndex", this.__a, "zIndex");

      // get all bindings
      var allBindings = qx.data.SingleValueBinding.getAllBindings();

      // check if only the added hashs are in the object
      var hashArray = [this.__a.toHashCode(), this.__b.toHashCode()];
      var i = 0;
      for (var hash in allBindings) {
        this.assertInArray(hash, hashArray, "This hash sould be in!");
        i++;
      }
      this.assertEquals(2, i, "Too much or too less objects in the array!");

      // check for the binding ids
      this.assertEquals(id1, allBindings[this.__a.toHashCode()][0][0], "This id sould be in!");
      this.assertEquals(id2, allBindings[this.__a.toHashCode()][1][0], "This id sould be in!");
      this.assertEquals(id3, allBindings[this.__b.toHashCode()][0][0], "This id sould be in!");

      // check for the length
      this.assertEquals(2, allBindings[this.__a.toHashCode()].length, "Not the right amount in the data!");
      this.assertEquals(1, allBindings[this.__b.toHashCode()].length, "Not the right amount in the data!");
    },


    testDebugStuff: function(){
      // just a test if the method runs threw without an exception
      var id1 = qx.data.SingleValueBinding.bindPropertyToProperty(this.__a, "name", this.__b, "name");
      qx.data.SingleValueBinding.bindPropertyToProperty(this.__a, "zIndex", this.__b, "zIndex");
      qx.data.SingleValueBinding.bindPropertyToProperty(this.__b, "name", this.__a, "name");
      qx.data.SingleValueBinding.bindPropertyToProperty(this.__b, "zIndex", this.__a, "zIndex");
      // test the single log
      qx.data.SingleValueBinding.showBindingInLog(this.__a, id1);
      // test the all log
      qx.data.SingleValueBinding.showAllBindingsInLog();
    },


    testMixinSupport: function() {
      // remove all bindings
      qx.data.SingleValueBinding.removeAllBindings();

      // create a new Binding
      var id1 = this.__a.bind("name", this.__b, "name");
      this.__a.setName("hulk");
      this.assertEquals("hulk", this.__b.getName(), "String binding does not work!");

      // remove the binding
      this.__a.removeBinding(id1);
      this.__a.setName("hulk2");
      this.assertEquals("hulk", this.__b.getName(), "Unbinding does not work!");

      // add another two bindings
      var id1 = this.__a.bindEvent("changeName", this.__b, "name");
      var id2 = this.__a.bind("zIndex", this.__b, "zIndex");

      // get the current bindings
      var bindings = this.__a.getBindings();
      this.assertEquals(id1, bindings[0][0], "First binding is not there.");
      this.assertEquals(id2, bindings[1][0], "Second binding is not there.");

      // remove all bindings
      this.__a.removeAllBindings();
      var bindings = this.__a.getBindings();
      this.assertEquals(0, bindings.length, "Still bindings there?");
    },
    
    
    testDebugListenerMessages: function() {
      // enable debugging
      qx.data.SingleValueBinding.DEBUG_ON = true;
      
      // just do some bindings and invoke the changes
      qx.data.SingleValueBinding.bindPropertyToProperty(this.__a, "name", this.__b, "name");
      this.__a.setName("affe");
      this.assertEquals("affe", this.__b.getName(), "String binding does not work!");

      var affe = new qx.ui.form.TextField()
      affe.setName("Jonny");
      qx.data.SingleValueBinding.bindPropertyToProperty(affe, "name", this.__b, "name");
      this.assertEquals("Jonny", this.__b.getName(), "String binding does not work!");
      affe.destroy();      
    }
  }
});
