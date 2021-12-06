/* ************************************************************************

   qooxdoo - the new era of web development

   http://qooxdoo.org

   Copyright:
     2004-2008 1&1 Internet AG, Germany, http://www.1und1.de

   License:
     MIT: https://opensource.org/licenses/MIT
     See the LICENSE file in the project's top-level directory for details.

   Authors:
     * Sebastian Werner (wpbasti)

************************************************************************ */

/**
 * Methods to cleanup fields from maps/objects.
 *
 * @ignore(qx.log.Logger)
 * @ignore(qx.log)
 * @ignore(qx.ui.container.Composite)
 * @ignore(qx.ui.container.Scroll)
 * @ignore(qx.ui.container.SlideBar)
 * @ignore(qx.ui.container.Stack)
 * @ignore(qx.ui.mobile)
 * @ignore(qx.ui.mobile.container.Composite)
 * @ignore(qx.ui.mobile.core.Widget)
 */
qx.Class.define("qx.util.DisposeUtil",
{
  statics :
  {
    /**
     * Disconnects and disposes given objects from instance.
     * Only works with qx.core.Object based objects e.g. Widgets.
     *
     * @param obj {Object} Object which contains the fields
     * @param arr {Array} List of fields (which store objects) to dispose
     * @param disposeSingletons {Boolean?} true, if singletons should be disposed
     */
    disposeObjects : function(obj, arr, disposeSingletons)
    {
      var name;
      for (var i=0, l=arr.length; i<l; i++)
      {
        name = arr[i];
        if (obj[name] == null || !obj.hasOwnProperty(name)) {
          continue;
        }

        if (!qx.core.ObjectRegistry.inShutDown)
        {
          if (obj[name].dispose) {
            // singletons
            if (!disposeSingletons && obj[name].constructor.$$instance) {
              throw new Error("The object stored in key " + name + " is a singleton! Please use disposeSingleton instead.");
            } else {
              obj[name].dispose();
            }
          } else {
            throw new Error("Has no disposable object under key: " + name + "!");
          }
        }

        obj[name] = null;
      }
    },


    /**
     * Disposes all members of the given array and deletes
     * the field which refers to the array afterwards.
     *
     * @param obj {Object} Object which contains the field
     * @param field {String} Name of the field which refers to the array
     */
    disposeArray : function(obj, field)
    {
      var data = obj[field];
      if (!data) {
        return;
      }

      // Fast path for application shutdown
      if (qx.core.ObjectRegistry.inShutDown)
      {
        obj[field] = null;
        return;
      }

      // Dispose all content
      try
      {
        var entry;
        for (var i=data.length-1; i>=0; i--)
        {
          entry = data[i];
          if (entry) {
            entry.dispose();
          }
        }
      }
      catch(ex) {
        throw new Error("The array field: " + field + " of object: " + obj + " has non disposable entries: " + ex);
      }

      // Reduce array size to zero
      data.length = 0;

      // Finally remove field
      obj[field] = null;
    },


    /**
     * Disposes all members of the given map and deletes
     * the field which refers to the map afterwards.
     *
     * @param obj {Object} Object which contains the field
     * @param field {String} Name of the field which refers to the array
     */
    disposeMap : function(obj, field)
    {
      var data = obj[field];
      if (!data) {
        return;
      }

      // Fast path for application shutdown
      if (qx.core.ObjectRegistry.inShutDown)
      {
        obj[field] = null;
        return;
      }

      // Dispose all content
      try
      {
        var entry;
        for (var key in data)
        {
          entry = data[key];
          if (data.hasOwnProperty(key) && entry) {
            entry.dispose();
          }
        }
      }
      catch(ex) {
        throw new Error("The map field: " + field + " of object: " + obj + " has non disposable entries: " + ex);
      }

      // Finally remove field
      obj[field] = null;
    },

    /**
     * Disposes a given object when another object is disposed
     *
     * @param disposeMe {Object} Object to dispose when other object is disposed
     * @param trigger {Object} Other object
     *
     */
    disposeTriggeredBy : function(disposeMe, trigger)
    {
      var triggerDispose = trigger.dispose;
      trigger.dispose = function(){
        triggerDispose.call(trigger);
        disposeMe.dispose();
      };
    },


    /**
     * Destroys a container and all of its children recursively.
     * @param container {qx.ui.container.Composite | qx.ui.container.Scroll |
     *   qx.ui.container.SlideBar | qx.ui.container.Stack} Container to be destroyed
     */
    destroyContainer : function(container)
    {
      if(qx.core.Environment.get("qx.debug"))
      {
        if(qx.ui.mobile && container instanceof qx.ui.mobile.core.Widget) {
          qx.core.Assert.assertTrue(this.__isChildrenContainer(container),
          "Container must be an instance of qx.ui.mobile.container.Composite.");
        } else {
          qx.core.Assert.assertQxWidget(container, "First argument must be a container widget!");
          qx.core.Assert.assertTrue(this.__isChildrenContainer(container),
          "Container must be an instance of qx.ui.container.Composite or " +
          "qx.ui.container.Scroll or qx.ui.container.Resizer or " +
          "qx.ui.container.SlideBar or qx.ui.container.Stack!");
        }
      }

      var arr=[];
      this._collectContainerChildren(container, arr);

      var len = arr.length;
      for(var i=len-1; i>=0; i--)
      {
        arr[i].destroy();
      }
      container.destroy();
    },


    /**
     * Helper function to collect all children widgets of an container recursively.
     * @param container {qx.ui.container.Composite | qx.ui.container.Scroll | qx.ui.container.SlideBar | qx.ui.container.Stack} Container to be destroyed
     * @param arr {Array} Array which holds all children widgets
     */
    _collectContainerChildren : function(container, arr)
    {
      var children = container.getChildren();

      for(var i=0; i<children.length; i++)
      {
        var item = children[i];
        arr.push(item);

        if (this.__isChildrenContainer(item)) {
          this._collectContainerChildren(item, arr);
        }
      }
    },


    /**
     * Checks if the given object is a qx container widget
     *
     * @param obj {Object} The object to check
     * @return {Boolean} <code>true</code> if the object is a container for
     * child widgets
     */
    __isChildrenContainer : function(obj)
    {
      var classes = [];
      if(qx.ui.mobile && obj instanceof qx.ui.mobile.core.Widget) {
        classes = [qx.ui.mobile.container.Composite];
      } else {
        classes = [qx.ui.container.Composite, qx.ui.container.Scroll,
        qx.ui.container.SlideBar, qx.ui.container.Stack];
      }

      for (var i=0,l=classes.length; i<l; i++) {
        if (typeof classes[i] !== "undefined" &&
          qx.Class.isSubClassOf(obj.constructor, classes[i]))
        {
          return true;
        }
      }

      return false;
    }
  }
});
