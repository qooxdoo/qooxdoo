/* ************************************************************************

   qooxdoo - the new era of web development

   http://qooxdoo.org

   Copyright:
     2004-2010 1&1 Internet AG, Germany, http://www.1und1.de

   License:
     LGPL: http://www.gnu.org/licenses/lgpl.html
     EPL: http://www.eclipse.org/org/documents/epl-v10.php
     See the LICENSE file in the project's top-level directory for details.

   Authors:
     * Christian Hagendorn (chris_schmidt)

************************************************************************ */

qx.Class.define("inspector.test.objects.Model",
{
  extend : qx.dev.unit.TestCase,

  members :
  {
    __model : null,

    __mockObject : null,

    setUp : function()
    {
      this.__mockObject = new inspector.test.objects.fixture.InspectorModelMock();
      this.__model = new inspector.objects.Model(this.__mockObject);
    },

    tearDown : function()
    {
      this.__mockObject.dispose();
      this.__model.dispose();
    },

    testInitValues : function() {
      this.assertNull(this.__model.getInspected(),
        "Initial inspected object is wrong.");
      this.assertArrayEquals([], this.__model.getObjects(),
        "Initial objects are wrong.");
    },

    testGetInspected : function() {
      var testObject = new qx.core.Object();
      this.__mockObject.setInspected(testObject);
      this.assertEquals(testObject, this.__model.getInspected(),
        "Model doesn't know about change in inspector.");
      testObject.dispose();
    },

    testSetInspected : function() {
      var testObject = new qx.core.Object();
      this.__model.setInspected(testObject);
      this.assertEquals(testObject, this.__model.getInspected(),
        "Model has not the correct object.");
      this.assertEquals(testObject, this.__mockObject.getInspected(),
        "Mock has not the correct object.");
      testObject.dispose();
    },

    testChangeInspectedFromInpector : function() {
      var testObject = new qx.core.Object();
      var that = this;

      this.assertEventFired(this.__model, "changeInspected", function() {
        that.__mockObject.setInspected(testObject)
      }, function(event) {
        var oldInspected = event.getOldData();
        var newInspected = event.getData();

        that.assertNull(oldInspected, "The old inspected object is incorrect.");
        that.assertEquals(testObject, newInspected,
          "The new inspected object is incorrect.");
      });
      testObject.dispose();
    },

    testChangeInspectedFromModel : function() {
      var testObject = new qx.core.Object();
      var that = this;

      this.assertEventFired(this.__model, "changeInspected", function() {
        that.__model.setInspected(testObject)
      }, function(event) {
        var oldInspected = event.getOldData();
        var newInspected = event.getData();

        that.assertNull(oldInspected, "The old inspected object is incorrect.");
        that.assertEquals(testObject, newInspected,
          "The new inspected object is incorrect.");
      });
      testObject.dispose();
    },

    testGetObjects : function() {
      var objects = [new qx.core.Object(), new qx.ui.basic.Label("")];

      this.__mockObject.setObjects(objects);
      this.assertArrayEquals(objects, this.__model.getObjects(),
        "Objects are wrong.");

      objects[0].dispose();
      objects[1].destroy();
    },

    testChangeObjects : function() {
      var objects = [new qx.core.Object(), new qx.ui.basic.Label("")];
      var that = this;

      this.assertEventFired(this.__model, "changeObjects", function() {
        that.__mockObject.setObjects(objects);
      }, function(event) {
        that.assertArrayEquals(objects, event.getTarget().getObjects(),
          "Objects are wrong.");
      });

      objects[0].dispose();
      objects[1].destroy();
    }
  }
});