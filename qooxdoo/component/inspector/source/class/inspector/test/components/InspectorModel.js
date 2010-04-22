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

qx.Class.define("inspector.test.components.InspectorModel",
{
  extend : qx.dev.unit.TestCase,

  members :
  {
    __model : null,

    __mockObjectRegistry : null,

    __mockApplication : null,

    setUp : function()
    {
      this.__mockObjectRegistry = new inspector.test.components.fixture.ObjectRegistryMock();
      this.__mockApplication = new inspector.test.components.fixture.ApplicationMock();
      this.__model = new inspector.components.InspectorModel(this.__mockApplication);
      this.__model.setObjectRegistry(this.__mockObjectRegistry);
    },

    tearDown : function()
    {
      this.__mockObjectRegistry.dispose();
      this.__mockApplication.dispose();
      this.__model.dispose();
    },

    testInitValues : function() {
      this.assertEquals(
        this.__mockObjectRegistry,
        this.__model.getObjectRegistry(),
        "Initial object registry is wrong."
      );

      this.assertEquals(
        this.__mockApplication,
        this.__model.getApplication(),
        "Initial application is wrong."
      );

      this.assertNull(this.__model.getInspected(),
        "Initial inspected object is wrong."
      );

      this.assertArrayEquals(
        [],
        this.__model.getObjects(),
        "Initial objects are wrong."
      );
    },

    testSetObjectRegistry : function()
    {
      var newObjectRegistry = new inspector.test.components.fixture.ObjectRegistryMock();
      this.__model.setObjectRegistry(newObjectRegistry);

      this.assertEquals(
        newObjectRegistry,
        this.__model.getObjectRegistry(),
        "Object registry is wrong."
      );

      newObjectRegistry.dispose();
    },

    testChangeObjectsByObjectRegistry : function()
    {
      var newObjectRegistry = new inspector.test.components.fixture.ObjectRegistryMock();
      var that = this;

      this.assertEventFired(this.__model, "changeObjects", function() {
        that.__model.setObjectRegistry(newObjectRegistry);
      });

      newObjectRegistry.dispose();
    },

    testSetApplication : function()
    {
      var newApplication = new inspector.test.components.fixture.ApplicationMock();
      this.__model.setApplication(newApplication);

      this.assertEquals(
        newApplication,
        this.__model.getApplication(),
        "Object registry is wrong."
      );

      newApplication.dispose();
    },

    testChangeObjectsByApplication : function()
    {
      var newApplication = new inspector.test.components.fixture.ApplicationMock();
      var that = this;

      this.assertEventFired(this.__model, "changeObjects", function() {
        that.__model.setApplication(newApplication);
      });

      newApplication.dispose();
    },

    testGetObjects : function() {
      var objects = {
        o1 : new qx.core.Object(),
        o2 : new qx.core.Object(),
        o3 : new qx.core.Object(),
        o4 : new qx.core.Object()
      };

      var excludes = [objects["o1"], objects["o4"]];

      this.__mockObjectRegistry.setRegistry(objects);
      this.__mockApplication.setExcludes(excludes);

      this.assertArrayEquals(
        [objects["o2"], objects["o3"]],
        this.__model.getObjects()
      );
    },

    testSetInspected : function()
    {
      var newObject = new qx.core.Object();
      this.__model.setInspected(newObject);

      this.assertEquals(
        newObject,
        this.__model.getInspected(),
        "Inspected object is wrong."
      );

      this.assertEquals(
        this.__mockApplication.getSelected(),
        this.__model.getInspected(),
        "Inspected object on Application is wrong."
      );

      newObject.dispose();
    },

    testChangeInspected : function()
    {
      var newObject = new qx.core.Object();
      var that = this;

      this.assertEventFired(this.__model, "changeInspected", function() {
        that.__model.setInspected(newObject);
      }, function(event)
      {
        that.assertEquals(
          newObject,
          event.getData(),
          "New inspected object is wrong."
        );
        that.assertNull(
          event.getOldData(),
          "Old inspected object is wrong."
        );

        that.assertEquals(
          that.__mockApplication.getSelected(),
          that.__model.getInspected(),
          "Inspected object on Application is wrong."
        );
      });

      newObject.dispose();
    }
  }
});