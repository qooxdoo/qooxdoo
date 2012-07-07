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

    setUp : function() {
      this.__model = new inspector.components.InspectorModel();
    },

    tearDown : function() {
      this.__model.dispose();
    },

    testInitValues : function()
    {
      this.assertNull(this.__model.getWindow(), "Init window value wrong!");
      this.assertNull(this.__model.getApplication(), "Init application value wrong!");
      this.assertNull(this.__model.getObjectRegistry(), "Init object registry value wrong!");
      this.assertNull(this.__model.getInspected(), "Init inspected value wrong!");

      this.assertArrayEquals([], this.__model.getExcludes(), "Init excludes value wrong!");
      this.assertArrayEquals([], this.__model.getObjects(), "Init objects value wrong!");
      this.assertArrayEquals([], this.__model.getRoots(), "Init roots value wrong!");
    },

    testSetWindow : function()
    {
      var newWindow = this.__createMock();
      this.__model.setWindow(newWindow);

      this.assertEquals(newWindow, this.__model.getWindow());
    },

    testChangeApplicationEvent : function()
    {
      var newWindow = this.__createMock();
      var that = this;

      this.assertEventFired(this.__model, "changeApplication", function() {
        that.__model.setWindow(newWindow);
      });

      this.assertEventNotFired(this.__model, "changeApplication", function() {
        that.__model.setWindow(newWindow);
      });
    },

    testGetApplication : function()
    {
      var windowMock = this.__createMock();
      var application = windowMock.qx.core.Init.getApplication();

      this.__model.setWindow(windowMock);
      this.assertEquals(application, this.__model.getApplication());
    },

    testObjectRegistry : function()
    {
      var windowMock = this.__createMock();
      var objectRegistry = windowMock.qx.core.ObjectRegistry;

      this.__model.setWindow(windowMock);
      this.assertEquals(objectRegistry, this.__model.getObjectRegistry());
    },

    testAddToExcludes : function()
    {
      var excludes = ["A", "B", "C"];

      for (var i = 0; i < excludes.length; i++) {
        this.__model.addToExcludes(excludes[i]);
      }

      this.assertArrayEquals(excludes, this.__model.getExcludes());
    },

    testAddToExcludesWithNullValues : function()
    {
      var excludes = ["A", "B", "C"];

      this.__model.addToExcludes(null);
      for (var i = 0; i < excludes.length; i++) {
        this.__model.addToExcludes(excludes[i]);
      }
      this.__model.addToExcludes(undefined);

      this.assertArrayEquals(excludes, this.__model.getExcludes());
    },

    testAddToExcludesWithDuplicate : function()
    {
      var excludes = ["A", "B", "C"];

      for (var i = 0; i < excludes.length; i++) {
        this.__model.addToExcludes(excludes[i]);
      }
      this.__model.addToExcludes(excludes[1]);

      this.assertArrayEquals(excludes, this.__model.getExcludes());
    },

    testClearExcludes : function()
    {
      var excludes = ["A", "B", "C"];

      for (var i = 0; i < excludes.length; i++) {
        this.__model.addToExcludes(excludes[i]);
      }
      this.__model.clearExcludes();

      this.assertArrayEquals([], this.__model.getExcludes());
    },

    testGetObjects : function()
    {
      var objects = {
        o1 : {},
        o2 : {},
        o3 : {},
        o4 : {}
      };

      var windowMock = this.__createMock(null, objects);
      this.__model.setWindow(windowMock);

      this.__model.addToExcludes(objects["o1"]);
      this.__model.addToExcludes(objects["o4"]);

      this.assertArrayEquals(
        [objects["o2"], objects["o3"]],
        this.__model.getObjects()
      );
    },

    testGetRoots : function()
    {
      try
      {
        var root = new qx.ui.root.Application(document);
        var objects = {
          o1 : {},
          o2 : new qx.ui.root.Inline(qx.dom.Element.create("div")),
          o3 : {},
          o4 : new qx.ui.root.Inline(qx.dom.Element.create("div"))
        };

        var windowMock = this.__createMock(root, objects);
        this.__model.setWindow(windowMock);

        this.assertArrayEquals(
          [root, objects["o2"], objects["o4"]],
          this.__model.getRoots()
        );
      }
      catch(ex) {
        throw new Error(ex);
      }
      finally
      {
        try {
          root.dispose();
        } catch(ex) {}
        try {
          objects["o2"].dispose();
        } catch(ex) {}
        try {
          objects["o4"].dispose();
        } catch(ex) {}
      }
    },

    testSetInspected : function()
    {
      var newObject = {};
      this.__model.setInspected(newObject);

      this.assertEquals(
        newObject,
        this.__model.getInspected()
      );
    },

    testChangeInspectedEvent : function()
    {
      var newObject = {};
      var oldObject = {};
      this.__model.setInspected(oldObject);

      var that = this;
      this.assertEventFired(this.__model, "changeInspected", function() {
        that.__model.setInspected(newObject);
      }, function(event)
      {
        that.assertEquals(
          newObject,
          event.getData()
        );
        that.assertEquals(
          oldObject,
          event.getOldData()
        );
      });

      this.assertEventNotFired(this.__model, "changeInspected", function() {
        that.__model.setInspected(newObject);
      });
    },

    testResetWindow : function()
    {
      this.testSetWindow();
      this.testChangeApplicationEvent();
      this.testGetApplication();
      this.testObjectRegistry();
      this.testAddToExcludes();
      this.testAddToExcludesWithNullValues();
      this.testAddToExcludesWithDuplicate();
      this.testClearExcludes();
      this.testGetObjects();
      this.testGetRoots();
      this.testSetInspected();
      this.testChangeInspectedEvent();

      this.__model.setWindow(null);

      this.testInitValues();
    },

    __createMock : function(root, objects)
    {
      var application = {
        getRoot: function() {
          return root;
        }
      };

      return {
        qx: {
          Class: {
            isSubClassOf: function(clazz, superClass) {
              return qx.Class.isSubClassOf(clazz, superClass);
            },

            getByName : function(name) {
              return qx.Class.getByName(name);
            }
          },

          core: {
            ObjectRegistry: {
              getRegistry: function() {
                return objects;
              }
            },

            Init: {
              getApplication: function() {
                return application;
              }
            }
          },

          ui: {
            root: {
              Inline: qx.ui.root.Inline
            }
          }
        }
      };
    }
  }
});