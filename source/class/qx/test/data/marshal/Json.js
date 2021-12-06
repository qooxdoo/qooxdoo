/* ************************************************************************

   qooxdoo - the new era of web development

   http://qooxdoo.org

   Copyright:
     2004-2008 1&1 Internet AG, Germany, http://www.1und1.de

   License:
     MIT: https://opensource.org/licenses/MIT
     See the LICENSE file in the project's top-level directory for details.

   Authors:
     * Martin Wittemann (martinwittemann)

************************************************************************ */

/**
 * @asset(qx/test/*)
 *
 * @ignore(qx.data.model)
 * @ignore(qx.test.model.*)
 * @ignore(qx.Test)
 * @ignore(qx.test.Array)
 */
qx.Class.define("qx.test.data.marshal.Json",
{
  extend : qx.dev.unit.TestCase,
  include : qx.dev.unit.MMock,

  members :
  {
    __marshaler : null,
    __data : null,
    __propertyNames : null,

    setUp : function() {
      this.__marshaler = new qx.data.marshal.Json();

      this.__data = {s: 'String', n: 12, b: true};
      this.__propertyNames = ["s", "n", "b"];
    },


    tearDown : function() {
      this.__marshaler.dispose();

      // remove the former created classes
      qx.data.model = {};
      for (var name in qx.Class.$$registry) {
        if (name.search("qx.data.model") != -1) {
          delete qx.Class.$$registry[name];
        }
      }
    },


    "test$$member" : function() {
      var data = {$$a : "b"};
      this.__marshaler.toClass(data);

      // check if the class is defined
      this.assertTrue(qx.Class.isDefined('qx.data.model.$$a'), "Class not created.");

      var clazz = qx.Class.getByName('qx.data.model.$$a');
      // check for the property
      for (var name in clazz.$$properties) {
        this.assertEquals("$$a", name, "Property $$a does have the wrong name.");
        this.assertEquals("change" + qx.lang.String.firstUp("$$a"), clazz.$$properties[name].event, "event has a wrong name.");
      }

      qx.Class.undefine('qx.data.model.$$a');
    },


    testLocalizedString : function () {
      var str = qx.locale.Manager.tr("test one");
      var data = {a : str};
      this.__marshaler.toClass(data);

      var model = this.__marshaler.toModel(data);

      this.assertEquals(str, model.getA());

      model.dispose();
      qx.Class.undefine('qx.data.model.a');
    },


    testClassCreationSingle: function() {
      this.__marshaler.toClass(this.__data);

      // check if the class is defined
      this.assertTrue(qx.Class.isDefined('qx.data.model.b|n|s'), "Class not created.");

      var clazz = qx.Class.getByName('qx.data.model.b|n|s');
      // check for the properties
      var i = 0;
      for (var name in clazz.$$properties) {
        this.assertEquals(this.__propertyNames[i], name, "Property " + i + "does have the wrong name.");
        this.assertEquals("change" + qx.lang.String.firstUp(this.__propertyNames[i]), clazz.$$properties[name].event, "event has a wrong name.");
        i++;
      }
    },


    testClassCreationArray: function() {
      this.__data = {a: ['a', 'b', 'c']};

      this.__marshaler.toClass(this.__data);

      // check if the class is defined
      this.assertTrue(qx.Class.isDefined("qx.data.model.a"), "Class not created.");

      var clazz = qx.Class.getByName("qx.data.model.a");
      // check for the property
      this.assertNotNull(clazz.$$properties.a, "Property does not exist.");
    },


    testClassCreationObject: function() {
      this.__data = {a: {b: 'test'}};

      this.__marshaler.toClass(this.__data);

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
      this.__data = {a: [{b: 'test'}, {b: 'test'}]};

      this.__marshaler.toClass(this.__data);

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
      this.__data = {a: [{b: 'test', c: ['f', 'x', 'e']}, {b: 'test', affe: false}], t: {f: null, r: 152, q: true}};
      this.__marshaler.toClass(this.__data);
    },


    testModelWithNumber: function() {
      this.__data = {a: 10, b: -15, c: 10.5e10};
      // first create the classes before setting the data
      this.__marshaler.toClass(this.__data);
      // set the data
      var model = this.__marshaler.toModel(this.__data);

      // check the model
      this.assertEquals(10, model.getA(), "getA does not work.");
      this.assertEquals(-15, model.getB(), "getB does not work.");
      this.assertEquals(10.5e10, model.getC(), "getC does not work.");
      model.dispose();
    },


    testModelWithBoolean: function() {
      this.__data = {a: true, b: false};
      // first create the classes before setting the data
      this.__marshaler.toClass(this.__data);
      // set the data
      var model = this.__marshaler.toModel(this.__data);

      // check the model
      this.assertEquals(true, model.getA(), "getA does not work.");
      this.assertEquals(false, model.getB(), "getB does not work.");
      model.dispose();
    },


    testModelWithString: function() {
      this.__data = {a: 'affe', b: 'AFFE'};
      // first create the classes before setting the data
      this.__marshaler.toClass(this.__data);
      // set the data
      var model = this.__marshaler.toModel(this.__data);

      // check the model
      this.assertEquals("affe", model.getA(), "getA does not work.");
      this.assertEquals("AFFE", model.getB(), "getB does not work.");
      model.dispose();
    },


    testModelWithPrimitive: function() {
      this.__data = {a: 'affe', b: true, c: 156};
      // first create the classes before setting the data
      this.__marshaler.toClass(this.__data);
      // set the data
      var model = this.__marshaler.toModel(this.__data);

      // check the model
      this.assertEquals("affe", model.getA(), "getA does not work.");
      this.assertEquals(true, model.getB(), "getB does not work.");
      this.assertEquals(156, model.getC(), "getC does not work.");
      model.dispose();
    },


    testModelWithArrayPrimitive: function() {
      this.__data = {a: ['affe', 'affen', 'AFFE']};
      // first create the classes before setting the data
      this.__marshaler.toClass(this.__data);
      // set the data
      var model = this.__marshaler.toModel(this.__data);

      // check the model
      var a = model.getA();
      this.assertNotNull(a, "Nothing stored in the property a.");
      this.assertEquals("qx.data.Array", a.classname, "Its not an data array.");
      this.assertEquals("affe", a.getItem(0), "Item 0 is wrong");
      this.assertEquals("affen", a.getItem(1), "Item 1 is wrong");
      this.assertEquals("AFFE", a.getItem(2), "Item 2 is wrong");
      model.dispose();
    },


    testModelWithArrayArray: function() {
      this.__data = {a: [[true, false], [10, 15]]};
      // first create the classes before setting the data
      this.__marshaler.toClass(this.__data);
      // set the data
      var model = this.__marshaler.toModel(this.__data);

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
      model.dispose();
    },


    testModelWithObjectPrimitive: function() {
      this.__data = {a: {b: true, bb: false}, aa: {c: 15, cc: -89}};
      // first create the classes before setting the data
      this.__marshaler.toClass(this.__data);
      // set the data
      var model = this.__marshaler.toModel(this.__data);

      // check the model
      var a = model.getA();
      this.assertNotNull(a, "Nothing stored in the property a.");
      this.assertEquals(true, a.getB(), "b is not set");
      this.assertEquals(false, a.getBb(), "bb is not set");

      var aa = model.getAa();
      this.assertNotNull(aa, "Nothing stored in the property a.");
      this.assertEquals(15, aa.getC(), "c is not set");
      this.assertEquals(-89, aa.getCc(), "cc is not set");
      model.dispose();
    },


    testModelWithObjectArray: function() {
      this.__data = {a: {b: ['affe', 'AFFE']}};
      // first create the classes before setting the data
      this.__marshaler.toClass(this.__data);
      // set the data
      var model = this.__marshaler.toModel(this.__data);

      // check the model
      var a = model.getA();
      this.assertNotNull(a, "Nothing stored in the property a.");
      var b = a.getB();
      this.assertNotNull(b, "Nothing stored in the property b.");
      this.assertEquals("qx.data.Array", b.classname, "b is not an data array");
      this.assertEquals("affe", b.getItem(0), "Item 0 is wrong.");
      this.assertEquals("AFFE", b.getItem(1), "Item 1 is wrong.");
      model.dispose();
    },


    testModelWithArrayObject: function() {
      this.__data = {a: [{a: 15}, {a: true}]};
      // first create the classes before setting the data
      this.__marshaler.toClass(this.__data);
      // set the data
      var model = this.__marshaler.toModel(this.__data);

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
      model.dispose();
    },


    testModelWithObjectObject: function() {
      this.__data = {a: {a: {a: 'affe'}}};
      // first create the classes before setting the data
      this.__marshaler.toClass(this.__data);
      // set the data
      var model = this.__marshaler.toModel(this.__data);

      // check the model
      this.assertEquals("affe", model.getA().getA().getA(), "No affe is there!");
      model.dispose();
    },


    testModelWithAllSmoke: function() {
      this.__data = {a: [{aa: ['affe'], ab: false, ac: []}, {}, true, 15, 'affe'], b: 'Affe', c: {ca: 156, cb: [null, null], cc: true}};
      // first create the classes before setting the data
      this.__marshaler.toClass(this.__data);
      // set the data
      var model = this.__marshaler.toModel(this.__data);

      this.assertNotNull(model, "No model set.");
      model.dispose();
    },


    testBubbleEventsDepth1: function() {
      this.__data = {a: 10, b: -15, c: 10.5e10};
      // first create the classes before setting the data
      this.__marshaler.toClass(this.__data, true);
      // set the data
      var model = this.__marshaler.toModel(this.__data);

      // check the event for a
      var self = this;
      this.assertEventFired(model, "changeBubble", function() {
        model.setA(0);
      }, function(e) {
        self.assertEquals(0, e.getData().value, "Not the right value in the event.");
        self.assertEquals(10, e.getData().old, "Not the right old value in the event.");
        self.assertEquals("a", e.getData().name, "Not the right name in the event.");
        self.assertString(e.getData().name, "name is not a String.");
        self.assertEquals(model, e.getData().item, "Not the right item in the event.");
      }, "Change event not fired!");

      // check the event for b
      this.assertEventFired(model, "changeBubble", function() {
        model.setB(0);
      }, function(e) {
        self.assertEquals(0, e.getData().value, "Not the right value in the event.");
        self.assertEquals(-15, e.getData().old, "Not the right old value in the event.");
        self.assertEquals("b", e.getData().name, "Not the right name in the event.");
        self.assertString(e.getData().name, "name is not a String.");
        self.assertEquals(model, e.getData().item, "Not the right item in the event.");
      }, "Change event not fired!");
      model.dispose();
    },


    testBubbleEventsDepth2: function() {
      this.__data = {a: {b: 10, c: 20}};
      // first create the classes before setting the data
      this.__marshaler.toClass(this.__data, true);
      // set the data
      var model = this.__marshaler.toModel(this.__data);

      // check the event for b
      var self = this;
      this.assertEventFired(model, "changeBubble", function() {
        model.getA().setB(0);
      }, function(e) {
        self.assertEquals(0, e.getData().value, "Not the right value in the event.");
        self.assertEquals(10, e.getData().old, "Not the right old value in the event.");
        self.assertEquals("a.b", e.getData().name, "Not the right name in the event.");
        self.assertString(e.getData().name, "name is not a String.");
        self.assertEquals(model.getA(), e.getData().item, "Not the right item in the event.");
      }, "Change event not fired!");

      model.getA().dispose();
      // check the event for a
      this.assertEventFired(model, "changeBubble", function() {
        model.setA(true);
      }, function(e) {
        self.assertEquals(true, e.getData().value, "Not the right value in the event.");
        self.assertEquals("a", e.getData().name, "Not the right name in the event.");
        self.assertString(e.getData().name, "name is not a String.");
        self.assertEquals(model, e.getData().item, "Not the right item in the event.");
      }, "Change event not fired!");
      model.dispose();
    },


    testBubbleEventsDepth3: function() {
      this.__data = {a: {b: {c: 10}}};
      // first create the classes before setting the data
      this.__marshaler.toClass(this.__data, true);
      // set the data
      var model = this.__marshaler.toModel(this.__data);

      // check the event for c
      var self = this;
      this.assertEventFired(model, "changeBubble", function() {
        model.getA().getB().setC(0);
      }, function(e) {
        self.assertEquals(0, e.getData().value, "Not the right value in the event.");
        self.assertEquals(10, e.getData().old, "Not the right old value in the event.");
        self.assertEquals("a.b.c", e.getData().name, "Not the right name in the event.");
        self.assertString(e.getData().name, "name is not a String.");
        self.assertEquals(model.getA().getB(), e.getData().item, "Not the right item in the event.");
      }, "Change event not fired!");
      model.dispose();
    },


    testBubbleEventsArrayDepth1: function() {
      this.__data = {a: [12, 23, 34]};
      // first create the classes before setting the data
      this.__marshaler.toClass(this.__data, true);
      // set the data
      var model = this.__marshaler.toModel(this.__data);

      // check the event for the first array element
      var self = this;
      this.assertEventFired(model, "changeBubble", function() {
        model.getA().setItem(0, 1);
      }, function(e) {
        self.assertEquals(1, e.getData().value, "Not the right value in the event.");
        self.assertEquals("a[0]", e.getData().name, "Not the right name in the event.");
        self.assertString(e.getData().name, "name is not a String.");
        self.assertEquals(model.getA(), e.getData().item, "Not the right item in the event.");
      }, "Change event not fired!");

      model.dispose();
    },


    testBubbleEventsArrayDepth2: function() {
      this.__data = {a: [{b: 10}, {b: 11}]};
      // first create the classes before setting the data
      this.__marshaler.toClass(this.__data, true);
      // set the data
      var model = this.__marshaler.toModel(this.__data);

      // check the event for the first array element
      var self = this;
      this.assertEventFired(model, "changeBubble", function() {
        model.getA().getItem(0).setB(0);
      }, function(e) {
        self.assertEquals(0, e.getData().value, "Not the right value in the event.");
        self.assertEquals("a[0].b", e.getData().name, "Not the right name in the event.");
        self.assertString(e.getData().name, "name is not a String.");
        self.assertEquals(model.getA().getItem(0), e.getData().item, "Not the right item in the event.");
      }, "Change event not fired!");
      model.dispose();
    },


    testBubbleEventsArrayDepthAlot: function() {
      this.__data = {a: [[[[{b:10}]]]]};
      // first create the classes before setting the data
      this.__marshaler.toClass(this.__data, true);
      // set the data
      var model = this.__marshaler.toModel(this.__data);

      // check the event for the first array element
      var self = this;
      this.assertEventFired(model, "changeBubble", function() {
        model.getA().getItem(0).getItem(0).getItem(0).getItem(0).setB(0);
      }, function(e) {
        self.assertEquals(0, e.getData().value, "Not the right value in the event.");
        self.assertEquals("a[0][0][0][0].b", e.getData().name, "Not the right name in the event.");
        self.assertString(e.getData().name, "name is not a String.");
        self.assertEquals(model.getA().getItem(0).getItem(0).getItem(0).getItem(0), e.getData().item, "Not the right item in the event.");
      }, "Change event not fired!");
      model.dispose();
    },


    testBubbleEventsArrayDepthAlotMix: function() {
      this.__data = {a: [ {b: [ [{c: {d: [0, 1]}}] ]} ]};
      // first create the classes before setting the data
      this.__marshaler.toClass(this.__data, true);
      // set the data
      var model = this.__marshaler.toModel(this.__data);

      // check the event for the first array element
      var self = this;
      this.assertEventFired(model, "changeBubble", function() {
        model.getA().getItem(0).getB().getItem(0).getItem(0).getC().getD().setItem(1, 12);
      }, function(e) {
        self.assertEquals(12, e.getData().value, "Not the right value in the event.");
        self.assertEquals("a[0].b[0][0].c.d[1]", e.getData().name, "Not the right name in the event.");
        self.assertString(e.getData().name, "name is not a String.");
        self.assertEquals(model.getA().getItem(0).getB().getItem(0).getItem(0).getC().getD(), e.getData().item, "Not the right item in the event.");
      }, "Change event not fired!");
      model.dispose();
    },


    testBubbleEventsArrayLong: function() {
      this.__data = {a: [0, 1, 2, 3, 4, 5, 6 , 7, 8, 9, 10]};
      // first create the classes before setting the data
      this.__marshaler.toClass(this.__data, true);
      // set the data
      var model = this.__marshaler.toModel(this.__data);

      // check the event for the first array element
      var self = this;
      this.assertEventFired(model, "changeBubble", function() {
        model.getA().setItem(10, "AFFE");
      }, function(e) {
        self.assertEquals("AFFE", e.getData().value, "Not the right value in the event.");
        self.assertEquals("a[10]", e.getData().name, "Not the right name in the event.");
        self.assertString(e.getData().name, "name is not a String.");
        self.assertEquals(model.getA(), e.getData().item, "Not the right item in the event.");
      }, "Change event not fired!");
      model.dispose();
    },


    testBubbleEventsArrayReorder: function() {
      this.__data = {a: [11, 1, 2, 3, 4, 5, 6 , 7, 8, 9, 10]};
      // first create the classes before setting the data
      this.__marshaler.toClass(this.__data, true);
      // set the data
      var model = this.__marshaler.toModel(this.__data);

      model.getA().sort();

      // check the event for the first array element
      var self = this;
      this.assertEventFired(model, "changeBubble", function() {
        model.getA().setItem(0, "AFFE");
      }, function(e) {
        self.assertEquals("AFFE", e.getData().value, "Not the right value in the event.");
        self.assertEquals("a[0]", e.getData().name, "Not the right name in the event.");
        self.assertString(e.getData().name, "name is not a String.");
        self.assertEquals(model.getA(), e.getData().item, "Not the right item in the event.");
      }, "Change event not fired!");
      model.dispose();
    },


    testBubbleEventsWithRemove: function() {
      qx.Class.define("qx.Test", {
        extend : qx.core.Object,
        include : qx.data.marshal.MEventBubbling,
        properties : {
          fonts: {
            "event": "changeFonts",
            "check": "qx.data.Array",
            "apply": "_applyEventPropagation"
          }
        }
      });

      var model = new qx.Test();
      var fonts = new qx.data.Array();
      model.setFonts(fonts);
      model.getFonts().push("one", "two", "three");

      model.addListener("changeBubble", function(e) {
        this.assertEquals("fonts[0-2]", e.getData().name, "Wrong name");
        this.assertString(e.getData().name, "name is not a String.");
        this.assertArrayEquals(["one", "two", "three"], e.getData().old, "Wrong old data");
        this.assertEquals(0, e.getData().value.length, "Wrong data");
      }, this);

      // remove all
      model.getFonts().removeAll();

      this.assertEquals(0, model.getFonts().length, "The remove did not work.");
      fonts.dispose();
      model.dispose();
    },


    "test model with and without bubble" : function ()
    {
      var data = { pi: 1 };

      // 1st create explicit *without* changeBubble
      var model1 = qx.data.marshal.Json.createModel(data, false);
      // 2nd create implicit *without* changeBubble
      var model2 = qx.data.marshal.Json.createModel(data);
      // 3rd create explicit *with* changeBubble
      var model3 = qx.data.marshal.Json.createModel(data, true);
      // 4th model is again *without* changeBubble
      //     (should nevertheless result in a model-class *with* changeBubble)
      var model4 = qx.data.marshal.Json.createModel(data, false);

      // Check whether the above assumptions are correct
      this.assertFalse( qx.util.OOUtil.supportsEvent(model1, "changeBubble") );
      this.assertFalse( qx.util.OOUtil.supportsEvent(model2, "changeBubble") );
      this.assertTrue ( qx.util.OOUtil.supportsEvent(model3, "changeBubble") );
      this.assertTrue ( qx.util.OOUtil.supportsEvent(model4, "changeBubble") );

      // Check if bubble event really fires for models 3 & 4
      [ model3, model4 ].forEach(function (model) {

        this.assertEventFired(model, "changeBubble", function () {
          model.setPi(0);
        }, function (e) {
          var data = e.getData();
          this.assertEquals(0, data.value, "Not the right value in the event.");
          this.assertEquals(1, data.old, "Not the right old value in the event.");
          this.assertEquals("pi", data.name, "Not the right name in the event.");
          this.assertEquals(model, data.item, "Not the right item in the event.");
        }.bind(this), "Change event not fired!");

      }, this);

    },


    "test toClass() toModel() match/mismatch" : function ()
    {
      var data = { foo: "foo", bar: "bar" };

      var marshaler = new qx.data.marshal.Json();

      //
      // toClass *without*, toModel *with* should FAIL!
      //
      marshaler.toClass(data, false);
      this.assertException(
        function () { marshaler.toModel(data, true); },
        Error,
        "Class 'qx.data.model.bar|foo' found, but it does not support changeBubble event."
      );

      //
      // toClass *with*, toModel *without* should work
      //
      marshaler.toClass(data, true);
      marshaler.toModel(data, false);

      //
      // "auto"
      //
      var data2 = { foo2: "foo", bar2: "bar" };
      marshaler.toClass(data2); // implicit *without* (auto)

      marshaler.toModel(data2);
      marshaler.toModel(data2, false);

      this.assertException(
        function () { marshaler.toModel(data2, true); },
        Error,
        "Class 'qx.data.model.bar2|foo2' found, but it does not support changeBubble event."
      );
    },


    testAddValidationRule : function()
    {
      var propertiesSaved;

      var valN = function(data) {
        if (data < 10) { throw new qx.core.ValidationError("NNN");}
      };

      var valS = function(data) {
        if (data.length > 10) {throw new qx.core.ValidationError("SSS");}
      };

      var delegate = {getValidationRule : function(properties, propertyName) {
        if (propertyName == "n") {
          return valN;
        } else if (propertyName == "s") {
          return valS;
        }
        propertiesSaved = properties;
      }};

      this.__marshaler.dispose();
      this.__marshaler = new qx.data.marshal.Json(delegate);
      this.__marshaler.toClass(this.__data);
      var model = this.__marshaler.toModel(this.__data);

      // check for the right class hash
      this.assertEquals('b|n|s', propertiesSaved);

      // set working values
      model.setS("123456789");
      model.setN(20);

      // set not working values
      this.assertException(function() {
        model.setS("01234567890123456789");
      }, qx.core.ValidationError);

      this.assertException(function() {
        model.setN(1);
      }, qx.core.ValidationError);

      model.dispose();
    },

    testCustomValidator : function()
    {
      var delegate = {
      getJsonHash: function (data, includeBubbleEvents) {
        return Object.keys(data).sort().map(function (name) { return qx.lang.String.firstUp(name); }).join('') +
          (includeBubbleEvents === true ? '#' : '');
      }};

      this.__marshaler.dispose();
      this.__marshaler = new qx.data.marshal.Json(delegate);
      this.__marshaler.toClass({
        custom: 1,
        props: true
      });

      this.assertTrue(qx.Class.isDefined('qx.data.model.CustomProps'), "Class not created.");
    },


    testQooxdooObject : function()
    {
      var qxObject = new qx.core.Object();
      this.__data = ({a: {b: qxObject}});

      this.__marshaler.toClass(this.__data);

      // set the data
      var model = this.__marshaler.toModel(this.__data);

      // check the model
      this.assertEquals(qxObject, model.getA().getB(), "wrong qx object!");
      model.dispose();
    },


    testDisposeListModel : function() {
      var model = qx.data.marshal.Json.createModel([{name: "a"}]);
      var item = model.getItem(0);
      model.dispose();
      this.assertTrue(item.isDisposed());
    },


    testValidIdentifier: function() {
      // its a debug warning so only check on debug
      if (qx.core.Environment.get("qx.debug")) {
        var data = {"#affe" : 1};
        this.assertException(function() {
          // just check if the creation worked
          qx.data.marshal.Json.createModel(data).dispose();
        }, null, "The key '#affe' is not a valid JavaScript identifier.", "1");

        data = {"1" : 1, "true": false};
        // just check if the creation worked
        qx.data.marshal.Json.createModel(data).dispose();

        data = {"''''" : 1};
        this.assertException(function() {
          // just check if the creation worked
          qx.data.marshal.Json.createModel(data).dispose();
        }, null, "The key '''''' is not a valid JavaScript identifier.", "3");

        data = {"§AFFE" : 1};
        this.assertException(function() {
          // just check if the creation worked
          qx.data.marshal.Json.createModel(data).dispose();
        }, null, "The key '§AFFE' is not a valid JavaScript identifier.", "4");

        data = {"ja!" : 1};
        this.assertException(function() {
          // just check if the creation worked
          qx.data.marshal.Json.createModel(data).dispose();
        }, null, "The key 'ja!' is not a valid JavaScript identifier.", "5");
      }
    },


    /**
     * @ignore(qx.test.model)
     */
    testGetModelClass: function() {
      qx.Class.define("qx.test.model.C", {
        extend : qx.core.Object,
        properties : {
          s : {event : "s"},
          b : {event : "b"},
          n : {event : "n"}
        }
      });

      var self = this;
      var delegate = {getModelClass : function(properties) {
        self.assertEquals('b|n|s', properties);
        return qx.test.model.C;
      }};

      this.__marshaler.dispose();
      this.__marshaler = new qx.data.marshal.Json(delegate);
      this.__marshaler.toClass(this.__data);
      var model = this.__marshaler.toModel(this.__data);

      this.assertTrue(model instanceof qx.test.model.C);
      this.assertEquals("String", model.getS());
      this.assertEquals(12, model.getN());
      this.assertTrue(model.getB());

      model.dispose();
      qx.Class.undefine("qx.test.model.C");
    },


    testGetModelClassDepth: function() {
      var called = 0;
      var delegate = {getModelClass : function(properties, object, parentProperty, depth) {
        called++;
        if (properties == "a") {
          this.assertEquals(data, object);
          this.assertNull(parentProperty);
          this.assertEquals(0, depth);
        } else if (properties == "b") {
          this.assertEquals(data.a, object);
          this.assertEquals("a", parentProperty);
          this.assertEquals(1, depth);
        } else if (properties == "c") {
          this.assertEquals(data.a.b[0], object);
          this.assertEquals("b[0]", parentProperty);
          this.assertEquals(3, depth);
        } else {
          this.fail("Unknown property in the marshaler.");
        }
      }.bind(this)};

      this.__marshaler.dispose();
      var data = {a: {b: [{c: 1}]}};
      this.__marshaler = new qx.data.marshal.Json(delegate);
      this.__marshaler.toClass(data);
      this.assertEquals(3, called);
      var model = this.__marshaler.toModel(data);
      this.assertEquals(6, called);

      model.dispose();
    },


    testGetModelClassIgnore: function() {
      qx.Class.define("qx.test.model.C", {
        extend : qx.core.Object,
        properties : {
          b : {event : "b"}
        }
      });

      var self = this;
      var delegate = {getModelClass : function(properties) {
        self.assertEquals('b|n|s', properties);
        return qx.test.model.C;
      }};

      this.__marshaler.dispose();
      this.__marshaler = new qx.data.marshal.Json(delegate);
      this.__marshaler.toClass(this.__data);
      var model = this.__marshaler.toModel(this.__data);

      this.assertTrue(model instanceof qx.test.model.C);

      this.assertUndefined(model.getS);
      this.assertUndefined(model.getN);
      this.assertTrue(model.getB());

      model.dispose();
      qx.Class.undefine("qx.test.model.C");
    },


    testGetModelSuperClass: function() {
      var called = 0;
      var delegate = {getModelSuperClass : function(properties, parentProperty, depth) {
        called++;
        if (properties == "a") {
          this.assertNull(parentProperty);
          this.assertEquals(0, depth);
        } else if (properties == "b") {
          this.assertEquals("a", parentProperty);
          this.assertEquals(1, depth);
        } else if (properties == "c") {
          this.assertEquals("b[0]", parentProperty);
          this.assertEquals(3, depth);
        } else {
          this.fail("Unknown property in the marshaler.");
        }
      }.bind(this)};

      this.__marshaler.dispose();
      var data = {a: {b: [{c: 1}]}};
      this.__marshaler = new qx.data.marshal.Json(delegate);
      this.__marshaler.toClass(data);
      this.assertEquals(3, called);
    },


    testGetModelMixins: function() {
      var called = 0;
      var delegate = {getModelMixins : function(properties, parentProperty, depth) {
        called++;
        if (properties == "a") {
          this.assertNull(parentProperty);
          this.assertEquals(0, depth);
        } else if (properties == "b") {
          this.assertEquals("a", parentProperty);
          this.assertEquals(1, depth);
        } else if (properties == "c") {
          this.assertEquals("b[0]", parentProperty);
          this.assertEquals(3, depth);
        } else {
          this.fail("Unknown property in the marshaler.");
        }
      }.bind(this)};

      this.__marshaler.dispose();
      var data = {a: {b: [{c: 1}]}};
      this.__marshaler = new qx.data.marshal.Json(delegate);
      this.__marshaler.toClass(data);
      this.assertEquals(3, called);
    },


    testGetPropertyMapping: function() {
      var delegate = {getPropertyMapping : function(property, properties) {
        return property + property + property;
      }};

      this.__marshaler.dispose();
      this.__marshaler = new qx.data.marshal.Json(delegate);
      this.__marshaler.toClass(this.__data);
      var model = this.__marshaler.toModel(this.__data);

      this.assertEquals("String", model.getSss());
      this.assertEquals(12, model.getNnn());
      this.assertTrue(model.getBbb());

      model.dispose();
    },


    testIgnoreParent: function() {
      var called = 0;
      var delegate = {ignore : function(properties, parentProperty, depth) {
        called++;
        if (properties == "a") {
          this.assertNull(parentProperty);
          this.assertEquals(0, depth);
        } else if (properties == "b") {
          this.assertEquals("a", parentProperty);
          this.assertEquals(1, depth);
        } else if (properties == "c") {
          this.assertEquals("b[0]", parentProperty);
          this.assertEquals(3, depth);
        } else {
          this.fail("Unknown property in the marshaler.");
        }
      }.bind(this)};

      this.__marshaler.dispose();
      var data = {a: {b: [{c: 1}]}};
      this.__marshaler = new qx.data.marshal.Json(delegate);
      this.__marshaler.toClass(data);
      this.assertEquals(3, called);
    },


    testIgnoreDepth: function() {
      var delegate = {ignore : function(properties, parentProperty, depth) {
        return depth >= 1;
      }};

      this.__marshaler.dispose();
      this.__marshaler = new qx.data.marshal.Json(delegate);

      var data = {a: [0], b: {x: 1}, c: {y: 2}};

      this.__marshaler.toClass(data);
      var model = this.__marshaler.toModel(data);

      this.assertEquals(0, model.getA()[0]);
      this.assertEquals(1, model.getB().x);
      this.assertEquals(2, model.getC().y);

      model.dispose();
    },



    testIgnoreProperties: function() {
      var delegate = {ignore : function(properties, parentProperty, depth) {
        return properties == "x";
      }};

      this.__marshaler.dispose();
      this.__marshaler = new qx.data.marshal.Json(delegate);

      var data = {a: [], b: {x: 1}, c: {y: 2}};

      this.__marshaler.toClass(data);
      var model = this.__marshaler.toModel(data);

      this.assertInstance(model.getA(), qx.data.Array);
      this.assertEquals(1, model.getB().x);
      this.assertInstance(model.getC(), qx.core.Object);
      this.assertEquals(2, model.getC().getY());

      model.dispose();
    },


    testBubbleSpliceRemoveAndAdd : function() {
      var data = [{label: "Desktop"}];

      var model = qx.data.marshal.Json.createModel(data, true);
      var spy = this.spy();
      model.addListener("changeBubble", spy);

      model.splice(1, 1, model.getItem(0));
      this.assertCalledOnce(spy);

      model.getItem(0).setLabel("pistole");
      this.assertCalledTwice(spy);
    },


    testGetArrayClassSimple : function() {
      qx.Class.define("qx.test.Array", {
        extend : qx.data.Array
      });

      var delegate = {getArrayClass : function(parentProperty, depth) {
        this.assertNull(parentProperty);
        this.assertEquals(0, depth, "'depth' property is wrong");
        return qx.test.Array;
      }.bind(this)};

      this.__marshaler.dispose();
      this.__marshaler = new qx.data.marshal.Json(delegate);

      var data = ["a", "b"];

      this.__marshaler.toClass(data);
      var model = this.__marshaler.toModel(data);

      this.assertInstance(model, qx.test.Array);

      model.dispose();
      qx.Class.undefine("qx.test.Array");
    },


    testGetArrayClassAdvanced : function() {
      qx.Class.define("qx.test.Array", {
        extend : qx.data.Array
      });
      var called = 0;
      var delegate = {getArrayClass : function(parentProperty, depth) {
        called++;
        if (parentProperty == "a") {
          this.assertEquals(1, depth, "'depth' property is wrong");
          return null;
        } else if (parentProperty == "b") {
          this.assertEquals(1, depth, "'depth' property is wrong");
          return qx.test.Array;
        } else if (parentProperty == "e") {
          this.assertEquals(2, depth, "'depth' property is wrong");
          return qx.test.Array;
        } else if (parentProperty == "f") {
          this.assertEquals(2, depth, "'depth' property is wrong");
          return null;
        } else {
          this.fail("Unknown 'parentProperty' in the marshaler.");
        }
      }.bind(this)};

      this.__marshaler.dispose();
      this.__marshaler = new qx.data.marshal.Json(delegate);

      var data = {a: [], b: [], c: {d: "d", e: [], f: []}};

      this.__marshaler.toClass(data);
      var model = this.__marshaler.toModel(data);

      this.assertInstance(model.getA(), qx.data.Array);
      this.assertInstance(model.getB(), qx.test.Array);
      this.assertInstance(model.getC().getE(), qx.test.Array);
      this.assertInstance(model.getC().getF(), qx.data.Array);
      this.assertEquals(4, called);

      model.dispose();
      qx.Class.undefine("qx.test.Array");
    }
  }
});
